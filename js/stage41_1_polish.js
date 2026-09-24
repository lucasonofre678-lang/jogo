// Stage 41.1 — world cleanup and an authored opening for new survivors.

const stage411GenerateRegions=StructureManager.prototype.generateRegions;
StructureManager.prototype.generateRegions=function(){
  stage411GenerateRegions.call(this);
  const camp=this.structures.find(s=>s.type==='camp'&&s.x===30);
  if(camp){
    camp.name='Ponto de Evacuação 12';
    camp.stage411=true;
    camp.state='damaged';
    camp.ambientProfile='forest';
  }
  const ground=x=>this.world.groundY(x)-1;
  this.addProp('wrecked_car',18,ground(18),{scale:.94,behind:true,flip:true,tint:'#56605a'});
  this.addProp('road_barrier',22,ground(22),{scale:.9,tilt:-.12});
  this.addProp('warning_sign',25,ground(25),{scale:.88,behind:true});
  this.addProp('suitcases',27,ground(27),{scale:.9});
  this.addProp('radio',36,ground(36),{scale:1.05});
  this.addProp('papers',38,ground(38),{scale:.9,tilt:.08});
  const first=this.containers.find(c=>c.name==='Mochila esquecida'&&Math.floor(c.x/CONFIG.TILE)<50);
  if(first){first.name='Mochila de evacuação';first.stage411=true;}
};

class OpeningSequence{
  constructor({fresh=false,mode='survival',onFinish=null}={}){
    this.active=Boolean(fresh&&mode==='survival');
    this.elapsed=0;this.phase=-1;this.onFinish=onFinish;
    this.root=document.getElementById('openingSequence');
    this.kicker=document.getElementById('openingKicker');
    this.title=document.getElementById('openingTitle');
    this.copy=document.getElementById('openingCopy');
    this.hint=document.getElementById('openingHint');
    this.root?.addEventListener('click',()=>{if(this.elapsed>2.5)this.finish();});
  }
  start(){
    if(!this.active||!this.root)return;
    this.root.classList.remove('hidden','leaving');
    this.setPhase(0);
  }
  setPhase(phase){
    if(phase===this.phase)return;this.phase=phase;
    const scenes=[
      ['ÚLTIMA TRANSMISSÃO · 07:58','DIA 1','O comboio de evacuação não chegou ao próximo bloqueio.'],
      ['MATA FRIA · NORTE DO CONDADO','PONTO DE EVACUAÇÃO 12','O motor parou durante a madrugada. O acampamento está vazio e a estrada, silenciosa.'],
      ['RÁDIO DE EMERGÊNCIA','“PROCURE ABRIGO ANTES DA NOITE”','Água limpa ainda pode ser encontrada nas áreas rurais. Evite as luzes vindas do leste.'],
      ['LAST COUNTY','VOCÊ FICOU PARA TRÁS','Vasculhe o acampamento. Encontre ferramentas. Descubra o que aconteceu com o condado.']
    ];
    const row=scenes[Math.min(phase,scenes.length-1)];
    if(this.kicker)this.kicker.textContent=row[0];
    if(this.title)this.title.textContent=row[1];
    if(this.copy)this.copy.textContent=row[2];
    if(this.hint)this.hint.textContent=phase>=3?'PRESSIONE QUALQUER TECLA PARA ASSUMIR O CONTROLE':'CLIQUE PARA AVANÇAR';
    this.root?.setAttribute('data-phase',String(phase));
  }
  update(dt){
    if(!this.active)return;
    this.elapsed+=dt;
    const next=this.elapsed<1.7?0:this.elapsed<3.7?1:this.elapsed<6?2:3;
    this.setPhase(next);
    if(this.elapsed>=10)this.finish();
  }
  handleKey(){if(!this.active)return false;if(this.elapsed>2.5){if(this.phase<3){this.elapsed=Math.max(this.elapsed,6);this.setPhase(3);}else this.finish();}return true;}
  finish(){
    if(!this.active)return;this.active=false;
    this.root?.classList.add('leaving');
    if(this.root)setTimeout(()=>this.root.classList.add('hidden'),650);
    this.onFinish?.();
  }
}

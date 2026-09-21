/* Stage 32 — front-end da tela inicial e do Modo Criativo. */
const Stage32Menu = {
  modeView:'survival',
  el:{},
  init(){
    if(typeof document.querySelector!=='function')return;
    this.el={
      screen:document.getElementById('startScreen'),cont:document.getElementById('startContinue'),contInfo:document.getElementById('startContinueInfo'),
      survival:document.getElementById('startNewSurvival'),free:document.getElementById('startNewFree'),resume:document.getElementById('startResume'),
      slots:document.getElementById('startSlotList'),hint:document.getElementById('startSlotHint'),bar:document.getElementById('creativeBar'),
      open:document.getElementById('creativeOpen'),modal:document.getElementById('creativeModal'),close:document.getElementById('creativeClose'),
      search:document.getElementById('creativeSearch'),groups:document.getElementById('creativeGroups'),grid:document.getElementById('creativeGrid'),
      count:document.getElementById('creativeCount'),recent:document.getElementById('creativeRecent'),slotIcon:document.getElementById('creativeSlotIcon'),
      slotName:document.getElementById('creativeSlotName'),fly:document.getElementById('creativeFly'),threat:document.getElementById('creativeThreat')
    };
    this.installModeTabs();
    this.bind();
    if(pendingNew){
      creative.enabled=currentGameMode==='free';creative.flying=creative.enabled;
      if(creative.enabled)inventory.maxWeight=99999;
      mainMenuOpen=false;this.el.screen.classList.add('hidden');saveGameState(false,currentSaveSlot);
    }else if(pendingLoad){
      mainMenuOpen=false;this.el.screen.classList.add('hidden');
    }else this.open();
    this.syncCreativeHud();this.refresh();
  },
  installModeTabs(){
    const header=this.el.slots?.parentElement?.querySelector('header');if(!header||header.querySelector('.slot-mode-tabs'))return;
    const tabs=document.createElement('div');tabs.className='slot-mode-tabs';tabs.innerHTML='<button data-slot-mode="survival">SOBREVIVÊNCIA</button><button data-slot-mode="free">CRIATIVO</button>';
    header.after(tabs);tabs.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{this.modeView=b.dataset.slotMode;this.renderSlots();}));
  },
  bind(){
    this.el.cont?.addEventListener('click',()=>{const n=SaveSlots.newest();if(n)this.load(n.id,n.mode);});
    this.el.survival?.addEventListener('click',()=>{this.modeView='survival';this.newGame('survival');});
    this.el.free?.addEventListener('click',()=>{const n=SaveSlots.newest('free');if(n)this.load(n.id,'free');else this.newGame('free');});
    this.el.resume?.addEventListener('click',()=>this.closeMenu());
    this.el.open?.addEventListener('click',()=>this.toggleCreative(true));
    this.el.close?.addEventListener('click',()=>this.toggleCreative(false));
    this.el.modal?.addEventListener('mousedown',e=>{if(e.target===this.el.modal)this.toggleCreative(false);});
    this.el.search?.addEventListener('input',()=>{creative.query=this.el.search.value;this.renderCreative();});
    this.el.fly?.addEventListener('click',()=>{creative.toggleFlight();this.syncCreativeHud();});
    this.el.threat?.addEventListener('click',()=>{creativeThreats=!creativeThreats;this.syncCreativeHud();showToast(creativeThreats?'Infectados ativados no criativo':'Infectados pausados','info');});
    document.addEventListener('keydown',e=>{
      if(e.key==='Escape'&&mainMenuOpen&&currentSaveSlot){e.preventDefault();this.closeMenu();return;}
      if(!mainMenuOpen||typingInField(e))return;
      const buttons=[...this.el.screen.querySelectorAll('button:not(:disabled)')];if(!buttons.length)return;
      const at=Math.max(0,buttons.indexOf(document.activeElement));
      if(['ArrowDown','s','S'].includes(e.key)){e.preventDefault();buttons[(at+1)%buttons.length].focus();}
      if(['ArrowUp','w','W'].includes(e.key)){e.preventDefault();buttons[(at-1+buttons.length)%buttons.length].focus();}
    });
  },
  open(){mainMenuOpen=true;this.el.screen.classList.remove('hidden');this.el.resume.classList.toggle('hidden',!currentSaveSlot);this.refresh();},
  closeMenu(){if(!currentSaveSlot)return;mainMenuOpen=false;this.el.screen.classList.add('hidden');},
  refresh(){
    const newest=SaveSlots.newest();this.el.cont.disabled=!newest;
    this.el.contInfo.textContent=newest?`${newest.modeName} · DIA ${newest.day} · ${newest.area} · ${newest.clock}`:'Nenhuma partida encontrada';
    const creativeSave=SaveSlots.newest('free');this.el.free.querySelector('strong').textContent=creativeSave?'CONTINUAR CRIATIVO':'MODO CRIATIVO';
    this.el.free.querySelector('small').textContent=creativeSave?`Dia ${creativeSave.day} · ${creativeSave.area} · clique para continuar`:'Todos os itens e blocos, voo e construção sem custos.';
    this.renderSlots();
  },
  renderSlots(){
    const rows=SaveSlots.list(this.modeView);const tabs=this.el.slots.parentElement.querySelectorAll('[data-slot-mode]');tabs.forEach(b=>b.classList.toggle('active',b.dataset.slotMode===this.modeView));
    this.el.slots.innerHTML=rows.map(r=>`<div class="slot-row" data-mode="${this.modeView}" data-empty="${r.empty}"><span class="slot-tag">${r.label}</span><span class="slot-main"><b class="slot-title">${r.empty?'VAZIO':`${r.modeName} · DIA ${r.day}`}</b><small class="slot-sub">${r.empty?'Disponível para uma nova partida':`${r.area} · ${r.clock}`}</small></span><span class="slot-buttons">${r.empty&&r.id!=='auto'?`<button data-new-slot="${r.id}">NOVO</button>`:r.empty?'':`<button data-load-slot="${r.id}">ABRIR</button><button class="slot-erase" data-erase-slot="${r.id}">×</button>`}</span></div>`).join('');
    this.el.slots.querySelectorAll('[data-load-slot]').forEach(b=>b.addEventListener('click',()=>this.load(b.dataset.loadSlot,this.modeView)));
    this.el.slots.querySelectorAll('[data-new-slot]').forEach(b=>b.addEventListener('click',()=>this.newGame(this.modeView,b.dataset.newSlot)));
    this.el.slots.querySelectorAll('[data-erase-slot]').forEach(b=>b.addEventListener('click',()=>{if(confirm(`Apagar ${SaveSlots.label(b.dataset.eraseSlot)} de ${gameModeDef(this.modeView).name}?`)){SaveSlots.erase(b.dataset.eraseSlot,this.modeView);this.refresh();}}));
    this.el.hint.textContent=`Saves de ${gameModeDef(this.modeView).name.toLowerCase()} ficam separados dos demais modos.`;
  },
  firstSlot(mode){return SaveSlots.SLOT_IDS.find(id=>!SaveSlots.read(id,mode))||'slot1';},
  newGame(mode,slot=this.firstSlot(mode)){
    if(SaveSlots.read(slot,mode)&&!confirm(`${SaveSlots.label(slot)} já possui uma partida. Substituir?`))return;
    SaveSlots.erase(slot,mode);SaveSlots.setNew(slot,mode);location.reload();
  },
  load(id,mode){if(!SaveSlots.read(id,mode))return;SaveSlots.setPending(id,mode);location.reload();},
  toggleCreative(force){if(!creative.enabled)return;creativeOpen=typeof force==='boolean'?force:!creativeOpen;this.el.modal.classList.toggle('hidden',!creativeOpen);if(creativeOpen){this.renderCreative();this.el.search?.focus();}},
  renderCreative(){
    const groups=creative.groups();this.el.groups.innerHTML=groups.map(g=>`<button data-creative-group="${g.id}" class="${creative.group===g.id?'active':''}">${g.name}</button>`).join('');
    this.el.groups.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{creative.group=b.dataset.creativeGroup;creative.query='';this.el.search.value='';this.renderCreative();}));
    const entries=creative.entries();this.el.grid.innerHTML=entries.map(e=>`<button class="creative-cell ${creative.selection?.kind===e.kind&&String(creative.selection.id)===String(e.id)?'active':''}" data-kind="${e.kind}" data-id="${e.id}" title="${e.name}"><img src="${creative.iconFor(e)}" alt=""><span>${e.name}</span><small class="cell-kind">${e.kind==='item'?'ADICIONAR':e.kind==='build'?'CONSTRUÇÃO':'BLOCO'}</small></button>`).join('');
    this.el.grid.querySelectorAll('.creative-cell').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.kind==='item'){const r=creative.grantItem(b.dataset.id);showToast(r.ok?`${ITEM_DEFS[r.id].name} ×${r.added} adicionado`:'Não foi possível adicionar',r.ok?'good':'warn');renderInventory();renderHotbar();}else{creative.select(b.dataset.kind,b.dataset.id);this.toggleCreative(false);showToast(`${creative.selection.name} selecionado`,'good');}this.syncCreativeHud();}));
    this.el.count.textContent=`${entries.length} resultado${entries.length===1?'':'s'} · ${creative.build().filter(e=>e.kind==='item').length}/${Object.keys(ITEM_DEFS).length} itens disponíveis`;
  },
  syncCreativeHud(){
    this.el.bar?.classList.toggle('hidden',!creative.enabled);if(!creative.enabled)return;
    const s=creative.selection;this.el.slotName.textContent=s?s.name:'ABRIR CATÁLOGO';this.el.slotIcon.src=s?creative.iconFor(s):'assets/ui/nav_build.png';
    this.el.fly.classList.toggle('on',creative.flying);this.el.fly.textContent=creative.flying?'VOO ON':'VOO OFF';this.el.threat.classList.toggle('on',creativeThreats);
    this.el.recent.innerHTML=creative.recent.map((e,i)=>`<button data-recent="${i}" class="${s&&s.kind===e.kind&&String(s.id)===String(e.id)?'active':''}" title="${e.name}"><img src="${creative.iconFor(e)}" alt=""></button>`).join('');
    this.el.recent.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{creative.selectRecent(Number(b.dataset.recent));this.syncCreativeHud();}));
  }
};
window.Stage32Menu=Stage32Menu;
Stage32Menu.init();

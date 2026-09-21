/* Stage 29: field equipment, using the game's existing inventory and saves. */
const FieldInventory = (() => {
  if (typeof document.querySelector !== "function") return null;
  const state={target:'',uid:null,order:'category',compare:0,drag:null};
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const weight=rows=>rows.reduce((n,e)=>n+(ITEM_DEFS[e.id]?.weight||0)*e.qty,0);
  const weapon=id=>Boolean(ITEM_DEFS[id]?.gun||ITEM_DEFS[id]?.melee);
  function endpoints(){
    const p=player.center(),r=CONFIG.INTERACT_REACH*CONFIG.TILE;
    const list=structures.containers.filter(c=>Math.hypot(p.x-c.x-c.width/2,p.y-c.y-c.height/2)<=r).map(c=>({key:`box:${c.id}`,name:`${c.builtObjectId!=null?'BASE':'CONTAINER'} · ${c.name}`,rows:c.loot,max:Infinity,object:c}));
    for(const v of vehicles.vehicles){const c=vehicles.center(v);if(Math.hypot(p.x-c.x,p.y-c.y)<=3.3*CONFIG.TILE)list.push({key:`car:${v.id}`,name:`CARRO · ${v.name}`,rows:v.trunk,max:v.trunkMax,object:v});}
    return list;
  }
  const endpoint=key=>key==='bag'?{key,rows:inventory.entries,max:inventory.capacity()*1.35}:endpoints().find(e=>e.key===key);
  function transfer(fromKey,toKey,index,qty=Infinity){
    const from=endpoint(fromKey),to=endpoint(toKey);if(!from||!to||fromKey===toKey)return 0;
    const row=from.rows[index],def=row&&ITEM_DEFS[row.id];if(!def)return 0;
    let n=Math.min(row.qty,qty);
    if(def.weight>0)n=Math.min(n,Math.max(0,Math.floor((to.max-weight(to.rows)+1e-8)/def.weight)));
    n=Math.floor(n);if(n<=0)return 0;
    let left=n;
    const sig=e=>JSON.stringify(Object.fromEntries(Object.entries(e).filter(([k])=>!['uid','qty'].includes(k)).sort(([a],[b])=>a.localeCompare(b))));
    const copy={...row,durability:row.durability??def.maxDurability??null};
    if(def.stackable)for(const dest of to.rows){
      if(dest.id!==row.id||sig({...dest,durability:dest.durability??null})!==sig(copy))continue;
      const add=Math.min(left,Math.max(0,(def.maxStack||999)-dest.qty));dest.qty+=add;left-=add;if(!left)break;
    }
    while(left>0){const add=Math.min(left,def.stackable?(def.maxStack||999):1);const moved={...copy,qty:add};delete moved.uid;if(toKey==='bag')moved.uid=inventory.uidCounter++;to.rows.push(moved);left-=add;}
    row.qty-=n;if(row.qty<=0)from.rows.splice(index,1);
    if(to.object)to.object.discovered=true;
    for(const k of ['head','body','hands','legs','feet','pack'])if(clothing[k]&&!itemExists(clothing[k]))clothing[k]=null;
    for(let i=0;i<hotbar.length;i++)if(hotbar[i]&&!itemExists(hotbar[i]))hotbar[i]=null;
    return n;
  }
  function hideTip(){if($('fieldTooltip'))$('fieldTooltip').hidden=true;}
  function refresh(){hideTip();renderHotbar();renderInventory();updateUI();}
  function move(from,to,index,qty=Infinity){const n=transfer(from,to,index,qty);showToast(n?`${n} item(ns) transferido(s)`:'Sem espaço ou depósito fora de alcance',n?'good':'warn');refresh();return n;}
  function batch(from,to,materials=false){
    const source=endpoint(from);if(!source)return;let total=0;
    for(let i=source.rows.length-1;i>=0;i--){const row=source.rows[i],d=ITEM_DEFS[row.id];if(materials&&(!['material','component'].includes(d?.category)||hotbar.includes(row.id)||d.upgradeCarry))continue;total+=transfer(from,to,i);}
    showToast(total?`${total} item(ns) transferido(s)`:'Nada transferido: confira espaço e alcance');refresh();
  }
  function drop(el,fn){
    el.addEventListener('dragover',e=>{e.preventDefault();el.classList.add('field-drop');});
    el.addEventListener('dragleave',()=>el.classList.remove('field-drop'));
    el.addEventListener('drop',e=>{e.preventDefault();e.stopPropagation();el.classList.remove('field-drop');if(state.drag)fn(state.drag);state.drag=null;});
  }
  function drag(el,from,entry){el.draggable=true;el.addEventListener('dragstart',e=>{state.drag={from,entry};e.dataTransfer.setData('text/item-id',entry.id);e.dataTransfer.effectAllowed='copyMove';hideTip();});el.addEventListener('dragend',()=>{state.drag=null;document.querySelectorAll('.field-drop').forEach(e=>e.classList.remove('field-drop'));});}
  function equip(slot,id){
    if(!itemExists(id))return;const d=ITEM_DEFS[id];
    const clothingSlots=['head','body','hands','legs','feet','pack'];
    if(clothingSlots.includes(slot)&&d.clothingSlot===slot)clothing[slot]=id;
    else if(slot==='pack'&&d.upgradeCarry){useItem(id);return;}
    else if(['primary','secondary'].includes(slot)&&weapon(id))hotbar[slot==='primary'?0:1]=id;
    else{showToast('Esse item não cabe neste espaço');return;}refresh();
  }
  function renderGear(){
    const host=$('fieldGear');if(!host)return;
    const silhouettes={head:'police_helmet',body:'rain_jacket',hands:'field_gloves',legs:'cargo_pants',feet:'hiking_boots',pack:'daypack',primary:'rifle',secondary:'pistol'};
    const data=[
      ['head','CABEÇA',clothing.head,'◇'],['body','CORPO',clothing.body,'♜'],['hands','MÃOS',clothing.hands,'✦'],['legs','PERNAS',clothing.legs,'▥'],
      ['feet','PÉS',clothing.feet,'⌁'],['pack','MOCHILA',clothing.pack,'▤'],['primary','PRINCIPAL · 1',weapon(hotbar[0])?hotbar[0]:null,'Ⅰ'],['secondary','SECUNDÁRIA · 2',weapon(hotbar[1])?hotbar[1]:null,'Ⅱ']
    ];
    const capacity=inventory.capacity();
    host.innerHTML=data.map(([slot,label,id,g])=>`<button type="button" class="field-gear ${id?'occupied':''}" data-gear="${slot}"><span>${label}</span><div>${id?itemIconHtml(id,'field-gear-icon'):itemIconHtml(silhouettes[slot],'field-gear-icon field-ghost')}</div><strong>${id?esc(ITEM_DEFS[id]?.name):slot==='pack'?`${capacity.toFixed(0)} kg · capacidade`:'Arraste ou selecione'}</strong></button>`).join('');
    host.querySelectorAll('[data-gear]').forEach(el=>{const slot=el.dataset.gear;drop(el,p=>{if(p.from==='bag')equip(slot,p.entry.id);});el.addEventListener('click',()=>{if(inventorySelectedId)equip(slot,inventorySelectedId);});el.addEventListener('contextmenu',e=>{e.preventDefault();if(['head','body','hands','legs','feet','pack'].includes(slot))clothing[slot]=null;else if(slot==='primary'||slot==='secondary')hotbar[slot==='primary'?0:1]=null;refresh();});});
  }
  function renderTransfer(){
    const select=$('fieldTarget'),list=$('fieldCargo');if(!select||!list)return;
    const targets=endpoints();if(!targets.some(t=>t.key===state.target))state.target=targets[0]?.key||'';
    select.innerHTML=targets.length?targets.map(t=>`<option value="${esc(t.key)}">${esc(t.name)}</option>`).join(''):'<option value="">Nenhum depósito ao alcance</option>';select.value=state.target;
    const target=endpoint(state.target);list.innerHTML='';
    $('fieldCargoWeight').textContent=target?`${weight(target.rows).toFixed(1)} kg${Number.isFinite(target.max)?` / ${target.max} kg`:''}`:'APROXIME-SE';
    for(const id of ['fieldTakeAll','fieldStoreMaterials','fieldStoreOne'])$(id).disabled=!target;
    if(!target||!target.rows.length)list.innerHTML=`<p class="field-empty">${target?'DEPÓSITO VAZIO<br><small>Arraste itens da mochila para cá.</small>':'NENHUM DEPÓSITO PRÓXIMO<br><small>Aproxime-se de uma caixa, armário da base ou carro.</small>'}</p>`;
    if(!target)return;
    target.rows.forEach((entry,index)=>{const d=ITEM_DEFS[entry.id];if(!d)return;const el=document.createElement('button');el.type='button';el.className='field-cargo-item';el.innerHTML=`${itemIconHtml(entry.id,'field-cargo-icon')}<span>${esc(d.name)}<small>${(d.weight*entry.qty).toFixed(2)} kg${entry.durability!=null?` · ${Math.round(entry.durability/d.maxDurability*100)}%`:''}</small></span><b>×${entry.qty}</b><em>←</em>`;el.title='Clique: pegar pilha · Shift+clique: pegar 1';el.addEventListener('click',e=>move(target.key,'bag',index,e.shiftKey?1:Infinity));drag(el,target.key,entry);list.appendChild(el);});
  }
  function tooltip(el,entry){
    const d=ITEM_DEFS[entry.id];el.removeAttribute('title');
    function show(){const tip=$('fieldTooltip');if(!tip||state.drag)return;tip.innerHTML=`<strong>${esc(d.name)}</strong><span>${categoryLabel(d.category)} · ${(d.weight*entry.qty).toFixed(2)} kg${entry.durability!=null?` · ${Math.round(entry.durability/d.maxDurability*100)}% condição`:''}</span><p>${esc(d.description)}</p><small>Clique: detalhes · Shift+clique: transferir</small>`;tip.hidden=false;const r=el.getBoundingClientRect();tip.style.left=`${Math.max(8,Math.min(r.left,window.innerWidth-tip.offsetWidth-10))}px`;tip.style.top=`${r.bottom+tip.offsetHeight+10>window.innerHeight?Math.max(8,r.top-tip.offsetHeight-8):r.bottom+8}px`;}
    el.addEventListener('mouseenter',show);el.addEventListener('focus',show);el.addEventListener('mouseleave',hideTip);el.addEventListener('blur',hideTip);
  }
  function comparison(id){
    const d=ITEM_DEFS[id];if(!d||(!d.clothingSlot&&!weapon(id)&&!d.upgradeCarry))return '';
    if(d.upgradeCarry&&!d.clothingSlot)return `<div class="field-compare"><h4>REFORÇO PERMANENTE</h4><p>${inventory.maxWeight} kg → ${inventory.maxWeight+d.upgradeCarry} kg</p><small>A instalação consome a armação.</small></div>`;
    const other=d.clothingSlot?clothing[d.clothingSlot]:hotbar[state.compare],b=ITEM_DEFS[other];
    const stats=[];
    const add=(label,a,bv,m=1,suffix='',lowerBetter=false)=>{ if(a==null&&bv==null)return; stats.push([label,a||0,bv||0,m,suffix,lowerBetter]); };
    if(d.clothingSlot){
      add('Proteção',d.armor,b?.armor,100,'%'); add('Isolamento',d.insulation,b?.insulation); add('Chuva',d.rainProtection,b?.rainProtection,100,'%');
      add('Contaminação',d.contamProtection,b?.contamProtection,100,'%'); add('Carga',d.carryBonus,b?.carryBonus,1,' kg'); add('Mobilidade',d.moveBonus,b?.moveBonus,100,'%');
      add('Ruído',d.noiseModifier,b?.noiseModifier,100,'%',true); add('Fôlego',d.staminaModifier,b?.staminaModifier,100,'%'); add('Mineração',d.miningEfficiency,b?.miningEfficiency,100,'%');
    }else{
      add('Dano',d.gun?.damage||d.melee?.damage,b?.gun?.damage||b?.melee?.damage); add('Alcance',d.gun?.range||d.melee?.range,b?.gun?.range||b?.melee?.range);
      add('Capacidade',d.gun?.magazine,b?.gun?.magazine); add('Ruído',d.gun?.noise,b?.gun?.noise,1,'',true);
    }
    add('Peso',d.weight,b?.weight,1,' kg',true);
    return `<div class="field-compare"><h4>COMPARAR EQUIPAMENTO</h4>${weapon(id)?`<div class="field-compare-tabs"><button type="button" data-compare="0" class="${state.compare===0?'active':''}">Principal</button><button type="button" data-compare="1" class="${state.compare===1?'active':''}">Secundária</button></div>`:''}<p>Atual: ${esc(b?.name||'Espaço vazio')}</p>${other===id?'<small>Este modelo já está equipado.</small>':stats.map(([label,a,bv,m,suffix,lowerBetter])=>{const diff=(a-bv)*m;const better=lowerBetter?diff<0:diff>0;return `<div><span>${label}</span><strong>${+(a*m).toFixed(2)}${suffix}</strong><em class="${diff===0?'neutral':better?'positive':'negative'}">${diff>0?'+':''}${+diff.toFixed(2)}${suffix}</em></div>`;}).join('')}</div>`;
  }
  const detail=renderItemDetail;
  renderItemDetail=function(id){
    detail(id);if(!id||!itemExists(id))return;const pane=ui.itemDetailPane;
    const nativeCompare=pane.querySelector('.item-compare');if(nativeCompare)nativeCompare.classList.add('field-compare');
    const stats=pane.querySelector('.detail-stats');if(stats){const more=document.createElement('details');more.className='field-more';more.innerHTML='<summary>Todos os atributos</summary>';stats.replaceWith(more);more.appendChild(stats);}
    if(weapon(id)){const actions=document.createElement('div');actions.className='field-weapon-actions';actions.innerHTML='<button type="button" data-weapon-slot="primary">Equipar principal · 1</button><button type="button" data-weapon-slot="secondary">Equipar secundária · 2</button>';pane.appendChild(actions);actions.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>equip(b.dataset.weaponSlot,id)));}
  };
  const visible=inventoryVisibleEntries;
  inventoryVisibleEntries=function(entries){const q=inventoryQuery;inventoryQuery='';let rows=visible(entries);inventoryQuery=q;rows=rows.filter(e=>{const d=ITEM_DEFS[e.id];return fold(`${d.name} ${d.description} ${categoryLabel(d.category)}`).includes(fold(q.trim()));});
    if(state.order==='name')rows.sort((a,b)=>ITEM_DEFS[a.id].name.localeCompare(ITEM_DEFS[b.id].name,'pt-BR'));
    if(state.order==='weight')rows.sort((a,b)=>ITEM_DEFS[b.id].weight*b.qty-ITEM_DEFS[a.id].weight*a.qty);
    if(state.order==='condition')rows.sort((a,b)=>(a.durability==null?2:a.durability/ITEM_DEFS[a.id].maxDurability)-(b.durability==null?2:b.durability/ITEM_DEFS[b.id].maxDurability));
    if(state.order==='manual')rows.sort((a,b)=>inventory.entries.indexOf(a)-inventory.entries.indexOf(b));return rows;
  };
  const render=renderInventory;
  renderInventory=function(){hideTip();renderHotbar();render();if(!$('fieldGear'))return;renderGear();renderTransfer();
    const effectiveCapacity=inventory.capacity();const ratio=inventory.totalWeight()/effectiveCapacity;
    $('fieldWeightStatus').textContent=ratio>1?'SOBRECARGA · movimento prejudicado':ratio>.82?'CARGA ALTA · prepare espaço':'CARGA ESTÁVEL · pronto para explorar';$('fieldWeightStatus').className=ratio>1?'negative':ratio>.82?'field-warn':'positive';
    $('fieldWeightRemaining').textContent=`${Math.max(0,effectiveCapacity-inventory.totalWeight()).toFixed(1)} kg livres · limite extra ${(effectiveCapacity*1.35).toFixed(1)} kg`;
    const meter=ui.weightFill.parentElement;meter.setAttribute('role','meter');meter.setAttribute('aria-label','Peso carregado');meter.setAttribute('aria-valuenow',inventory.totalWeight().toFixed(1));meter.setAttribute('aria-valuemax',effectiveCapacity*1.35);
    const entries=inventoryVisibleEntries(inventory.list());
    ui.inventoryList.querySelectorAll('.inventory-slot-v2').forEach((el,i)=>{const entry=entries[i];if(!entry)return;el.dataset.uid=entry.uid;tooltip(el,entry);drag(el,'bag',entry);
      el.addEventListener('click',e=>{state.uid=entry.uid;if(e.shiftKey){e.stopImmediatePropagation();move('bag',state.target,inventory.entries.indexOf(entry));}},true);
      drop(el,p=>{if(p.from!=='bag'){move(p.from,'bag',endpoint(p.from)?.rows.indexOf(p.entry));return;}const a=inventory.entries.indexOf(p.entry),b=inventory.entries.indexOf(entry);if(a<0||b<0||a===b)return;inventory.entries.splice(a,1);inventory.entries.splice(b,0,p.entry);state.order='manual';inventorySortMode='manual';if($('inventorySort'))$('inventorySort').value='manual';refresh();});
    });
    const quick=$('fieldQuickbar');quick.innerHTML='';[...ui.hotbar.children].forEach((el,i)=>{const copy=el.cloneNode(true);copy.addEventListener('click',()=>{selected=i;refresh();});drop(copy,p=>{if(p.from==='bag'){hotbar[i]=p.entry.id;selected=i;refresh();}});quick.appendChild(copy);});
  };
  function mount(){
    const panel=document.querySelector('.rust-inventory');if(!panel)return;panel.classList.add('field-panel');
    panel.querySelector('.inventory-head .eyebrow').textContent='LAST COUNTY / FIELD EQUIPMENT';panel.querySelector('.inventory-head h2').textContent='LEVE O QUE IMPORTA.';
    panel.querySelector('.survivor-card .eyebrow').textContent='LAST COUNTY · SOBREVIVENTE';panel.querySelector('.survivor-card small').textContent='Prepare-se para a próxima saída.';
    const gear=document.createElement('div');gear.id='fieldGear';panel.querySelector('.equipment-box').before(gear);panel.querySelector('.equipment-box').classList.add('field-legacy-equipment');
    const wi=document.createElement('div');wi.className='field-weight-info';wi.innerHTML='<strong id="fieldWeightStatus"></strong><span id="fieldWeightRemaining"></span>';panel.querySelector('.capacity').after(wi);
    const sortSelect=$('inventorySort');if(sortSelect){if(!sortSelect.querySelector('option[value="manual"]')){const opt=document.createElement('option');opt.value='manual';opt.textContent='MANUAL';sortSelect.appendChild(opt);}state.order=sortSelect.value||inventorySortMode||'category';sortSelect.addEventListener('change',e=>{state.order=e.target.value;refresh();});}
    const side=panel.querySelector('.craft-pane'),cargo=document.createElement('section');cargo.className='field-transfer';cargo.innerHTML='<header><span>02 / SUPRIMENTOS</span><strong>DEPÓSITOS PRÓXIMOS</strong></header><select id="fieldTarget" aria-label="Depósito de destino"></select><small id="fieldCargoWeight"></small><div id="fieldCargo"></div><div class="field-transfer-actions"><button id="fieldTakeAll" type="button">← PEGAR TUDO</button><button id="fieldStoreOne" type="button">GUARDAR SELEÇÃO →</button><button id="fieldStoreMaterials" type="button">GUARDAR MATERIAIS →</button></div><small>Shift+clique na mochila: guardar pilha.<br>Arraste entre mochila e depósito.</small>';side.before(cargo);
    const craft=document.createElement('details');craft.className='field-crafting';craft.innerHTML='<summary>FABRICAÇÃO DE CAMPO</summary>';side.before(craft);craft.appendChild(side);cargo.appendChild(craft);
    const quick=document.createElement('div');quick.className='field-quick-access';quick.innerHTML='<span>ACESSO RÁPIDO / 1—9 · 0</span><div id="fieldQuickbar" class="field-hotbar"></div>';panel.querySelector('.drag-hint').remove();panel.querySelector('.inventory-footer').before(quick);
    panel.querySelector('.inventory-footer').innerHTML='<span><kbd>ARRASTAR</kbd> organizar / equipar <kbd>SHIFT + CLIQUE</kbd> transferir <kbd>BOTÃO DIREITO</kbd> tirar equipamento</span><strong>TAB / ESC · VOLTAR AO CONDADO</strong>';
    $('inventorySearch').setAttribute('aria-label','Buscar no inventário');$('fieldTarget').addEventListener('change',e=>{state.target=e.target.value;renderTransfer();});
    $('fieldTakeAll').addEventListener('click',()=>batch(state.target,'bag'));$('fieldStoreMaterials').addEventListener('click',()=>batch('bag',state.target,true));
    $('fieldStoreOne').addEventListener('click',()=>{const i=inventory.entries.findIndex(e=>e.uid===state.uid&&e.id===inventorySelectedId);move('bag',state.target,i>=0?i:inventory.entries.findIndex(e=>e.id===inventorySelectedId));});
    drop($('fieldCargo'),p=>{if(p.from==='bag')move('bag',state.target,inventory.entries.indexOf(p.entry));});drop(ui.inventoryList,p=>{if(p.from!=='bag')move(p.from,'bag',endpoint(p.from)?.rows.indexOf(p.entry));});
    const tip=document.createElement('div');tip.id='fieldTooltip';tip.setAttribute('role','tooltip');tip.hidden=true;document.body.appendChild(tip);document.addEventListener('scroll',hideTip,true);document.addEventListener('keydown',hideTip);
    const shortcut=(host,getKey)=>{if(!host)return;const b=document.createElement('button');b.type='button';b.className='field-open-cargo';b.textContent='ORGANIZAR MOCHILA ⇄ DEPÓSITO';b.addEventListener('click',()=>{state.target=getKey();closeContainerModal();closeVehicleModal();toggleInventory(true);});host.appendChild(b);};
    shortcut(document.querySelector('.container-actions'),()=>activeContainer?`box:${activeContainer.id}`:'');shortcut(document.querySelector('.vehicle-panel .inventory-head'),()=>vehicleForMenu()?`car:${vehicleForMenu().id}`:'');refresh();
  }
  const toggle=toggleInventory;toggleInventory=function(force){hideTip();toggle(force);};
  takeFromContainer=function(index){if(!activeContainer)return;move(`box:${activeContainer.id}`,'bag',index);renderContainer();};
  mount();return {state,endpoints,transfer,move,batch,equip,refresh};
})();

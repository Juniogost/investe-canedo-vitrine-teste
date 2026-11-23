(function(root){
'use strict';
const LABEL={apartamento:'Apartamento',casa:'Casa',lote:'Lote ou terreno',flat:'Flat',industrial:'Área industrial',outro:'Outro'};
function createMeter(){
 let allowed=false,last=null,activeAt=null,seconds={},clicks={},since=null;
 return {
  allow(now){allowed=true;last=now;activeAt=now;since=new Date().toISOString();},
  activity(now){activeAt=now;},
  tick(now,visible,item){
   const elapsed=last===null?0:Math.min(2,Math.max(0,(now-last)/1000));last=now;
   if(!allowed||!visible||activeAt===null||now-activeAt>30000||!item)return;
   seconds[item]=(seconds[item]||0)+elapsed;
  },
  click(id){if(allowed)clicks[id]=(clicks[id]||0)+1;},
  reset(){allowed=false;last=null;activeAt=null;seconds={};clicks={};since=null;},
  snapshot(){return {allowed,since,seconds:{...seconds},clicks:{...clicks}};}
 };
}
if(typeof module!=='undefined'&&module.exports){module.exports={createMeter};return;}
const meter=createMeter(), $=id=>document.getElementById(id), data=root.IC_DATA, types=root.IC_INTEREST_TYPES;
let consentAt=null, origin={}, session=null;
const byId=Object.fromEntries(data.props.map(p=>[p.id,p]));
function aggregate(){
 const s=meter.snapshot(), totals={};
 Object.keys(s.seconds).forEach(id=>{const t=types[id]&&types[id].type;if(t)totals[t]=(totals[t]||0)+s.seconds[id];});
 const ranked=Object.entries(totals).sort((a,b)=>b[1]-a[1]);
 const suggested=ranked.length&&ranked[0][1]>=10&&(!ranked[1]||ranked[0][1]>=ranked[1][1]*1.2)?ranked[0][0]:null;
 return {s,totals,suggested};
}
function update(){
 const {s,totals,suggested}=aggregate(), declared=$('declared').value;
 const lines=['INVESTE CANEDO | TESTE | RESUMO VOLUNTÁRIO',
 'Interesse confirmado: '+(LABEL[declared]||'não informado'),
 'Interesse sugerido: '+(LABEL[suggested]||'sem evidência suficiente'),
 'Ofertas WhatsApp: '+($('offer-consent').checked?'SIM, até 1 por semana; saída SAIR. Aceite em '+consentAt:'NÃO autorizado'),
 'Medição: '+(s.allowed?'permitida nesta aba em '+s.since:'desligada')];
 if(s.allowed){lines.push('Sessão local: '+session,'Origem: '+(Object.keys(origin).length?JSON.stringify(origin):'não identificada'));
 lines.push('Tempo visível por tipo (segundos): '+JSON.stringify(Object.fromEntries(Object.entries(totals).map(([k,v])=>[LABEL[k],Math.floor(v)]))));
 const clicked=Object.keys(s.clicks).map(id=>byId[id].name+' ('+id+')');
 if(clicked.length)lines.push('Consultas locais: '+clicked.join('; '));}
 lines.push('Disponibilidade e preços a confirmar. Sem sincronização com CRM. Clique não comprova mensagem enviada.');
 $('summary').value=lines.join('\n');
 $('stats').textContent=JSON.stringify({medicao:s.allowed,tempoPorImovel:s.seconds,tempoPorTipo:totals,interesseSugerido:suggested,consultasLocais:s.clicks,origem:origin},null,2);
}
function readOrigin(){
 const query=new URLSearchParams(location.search), out={};
 // Valores de campanhas permitidos, nunca copiar texto livre, telefone ou e-mail da URL.
 const choices={utm_source:['instagram','facebook','google','whatsapp','direto'],utm_medium:['social','organic','cpc','referral','mensagem'],utm_campaign:['imoveis','lotes','casas','apartamentos','industrial'],utm_content:['bio','story','feed','anuncio','link']};
 Object.keys(choices).forEach(k=>{const v=query.get(k);if(choices[k].includes(v))out[k]=v;});return out;
}
$('allow').onclick=()=>{if(!meter.snapshot().allowed){meter.allow(performance.now());session='teste-'+root.crypto.randomUUID();origin=readOrigin();} $('privacy-status').textContent='Medição permitida apenas nesta aba. Você pode retirar a permissão e apagar abaixo.';update();};
$('refuse').onclick=()=>{meter.reset();session=null;origin={};$('privacy-status').textContent='Medição desligada. Histórico desta aba apagado. Sua escolha de ofertas é independente.';update();};
$('declared').onchange=update;
$('offer-consent').onchange=()=>{consentAt=$('offer-consent').checked?new Date().toISOString():null;update();};
$('wa').href=data.wa_generic;
$('copy').onclick=async()=>{update();try{await navigator.clipboard.writeText($('summary').value);$('copy-status').textContent='Resumo copiado. Você decide se quer colar e enviar.';}catch(e){$('summary').focus();$('summary').select();$('copy-status').textContent='Selecione e copie o resumo acima.';}};
let candidates=new Map();
function currentItem(){
 let best=null, bestRatio=0, bestDistance=Infinity;
 candidates.forEach((ratio,el)=>{
  if(ratio<.5)return;
  const r=el.getBoundingClientRect(),distance=Math.abs(r.top+r.height/2-innerHeight/2);
  if(ratio>bestRatio+.01||(Math.abs(ratio-bestRatio)<=.01&&distance<bestDistance)){best=el.dataset.id;bestRatio=ratio;bestDistance=distance;}
 });return best;
}
const observer='IntersectionObserver' in root?new IntersectionObserver(entries=>{entries.forEach(e=>candidates.set(e.target,e.intersectionRatio));},{threshold:[0,.25,.5,.75,1]}):null;
data.props.forEach(p=>{
 const el=document.createElement('article');el.className='property';el.dataset.id=p.id;
 const h=document.createElement('h3');h.textContent=p.name;el.appendChild(h);
 const t=document.createElement('p');t.className='type';t.textContent='Tipologia: '+(LABEL[types[p.id].type]||'não validada, fora da sugestão');el.appendChild(t);
 const loc=document.createElement('p');loc.textContent=[p.bairro,p.cidade].filter(Boolean).join(' · ');el.appendChild(loc);
 const price=document.createElement('p');price.textContent=p.price?(p.apartir?'A partir de ':'')+Number(p.price).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})+' · confirmar':'Valores sob consulta';el.appendChild(price);
 const id=document.createElement('small');id.textContent='ID: '+p.id;el.appendChild(id);
 const btn=document.createElement('button');btn.textContent='Tenho interesse neste imóvel';btn.onclick=()=>{meter.click(p.id);meter.activity(performance.now());update();$('copy-status').textContent='Consulta local registrada apenas se a medição estiver permitida. Nenhuma mensagem enviada.';};el.appendChild(btn);
 $('catalog').appendChild(el);if(observer)observer.observe(el);
});
['pointerdown','keydown','scroll','touchstart','mousemove'].forEach(event=>document.addEventListener(event,()=>meter.activity(performance.now()),{passive:true}));
document.addEventListener('visibilitychange',()=>{meter.tick(performance.now(),false,null);update();});
setInterval(()=>{meter.tick(performance.now(),document.visibilityState==='visible',currentItem());update();},1000);
if(!observer)$('privacy-status').textContent='Seu navegador não suporta a medição. O catálogo continua disponível.';
root.IC_INTEREST_DEBUG={snapshot:()=>aggregate(),manifest:types};update();
})(typeof window==='undefined'?globalThis:window);

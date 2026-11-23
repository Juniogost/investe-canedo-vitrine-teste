// Tipologia conservadora. Não usar o agrupamento comercial como tipo de imóvel.
(function(){
  const map={};
  window.IC_DATA.props.forEach(p=>{
    let type=null, evidence='Cadastro sem tipologia explícita; validar na fonte antes de segmentar.';
    if (/^Casas /.test(p.name)||/casas de/.test(p.meta||'')) {type='casa';evidence='Nome ou metadado do próprio cadastro declara casas.';}
    if (/condomínio de lotes|^lotes de/.test(p.meta||'')) {type='lote';evidence='Metadado do próprio cadastro declara lotes.';}
    if (['Novos Ares Luar','La Buena Vista','Itá Nobre'].includes(p.name)) {type='apartamento';evidence='Descrição do bloco Tenda identifica estes três empreendimentos como apartamentos.';}
    map[p.id]={type,evidence};
  });
  window.IC_INTEREST_TYPES=map;
})();

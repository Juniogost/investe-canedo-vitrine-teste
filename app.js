(function(){
  var D = window.IC_DATA;
  var BRL = function(v){ return 'R$ ' + Math.round(v).toLocaleString('pt-BR'); };

  // layout final escolhido por Junio: Netflix escuro
  document.body.dataset.layout = 'netflix';

  // generic WA links
  document.getElementById('wa-float').href = D.wa_generic;
  document.getElementById('wa-footer').href = D.wa_generic;
  document.getElementById('wa-top').href = D.wa_generic;

  var CAT_ORDER = ['lancamentos','tenda','tcm','loteamentos','apartamentos','casas','terrenos','chacaras'];

  function propCard(p){
    var el = document.createElement('article'); el.className='card';
    var meta = [];
    if(p.meta) meta.push(p.meta);
    else { if(p.q) meta.push(p.q + (p.q===1?' quarto':' quartos'));
    if(p.area) meta.push(Math.round(p.area) + ' m²'); }
    el.innerHTML =
      '<div class="card-img"><img loading="lazy" src="'+p.img+'" alt="'+p.name.replace(/"/g,'')+'" onerror="this.parentNode.style.display=\'none\'">' +
      (p.ebm ? '<span class="badge">Lançamento EBM</span>' : (p.badge ? '<span class="badge">'+p.badge+'</span>' : '')) + '</div>' +
      '<div class="card-body">' +
        '<h3 class="card-name">'+p.name+'</h3>' +
        '<p class="card-loc">'+[p.bairro,p.cidade].filter(Boolean).join(' · ')+'</p>' +
        (p.price ? '<p class="card-price">'+(p.apartir?'a partir de ':'')+BRL(p.price)+'<small>Valores sujeitos a alteração. Confirme no WhatsApp</small></p>' : '<p class="card-price">Valores sob consulta<small>Confirme valores no WhatsApp</small></p>') +
        (meta.length? '<p class="card-meta">'+meta.join(' · ')+'</p>' : '') +
        '<a class="card-wa" href="'+p.wa+'" target="_blank" rel="noopener">Consultar no WhatsApp</a>' +
      '</div>';
    return el;
  }

  function blockCard(c){
    var el = document.createElement('article'); el.className='card';
    el.innerHTML =
      '<div class="card-img"><img loading="lazy" src="'+c.img+'" alt="'+c.name+'"></div>' +
      '<div class="card-body">' +
        '<h3 class="card-name">'+c.name+'</h3>' +
        '<p class="card-meta">'+c.desc+'</p>' +
        '<a class="card-open" href="'+c.url+'" target="_blank" rel="noopener">Abrir ↗</a>' +
      '</div>';
    return el;
  }

  function render(){
    var app = document.getElementById('app');
    app.innerHTML = '';

    // hero
    var destaques = D.props.filter(function(p){return p.destaque;});
    var hero = document.createElement('section'); hero.className='hero';
    hero.innerHTML =
      '<img class="hero-bg" src="og-image.jpg" alt="">' +
      '<div class="hero-inner">' +
        '<p class="hero-kicker">Senador Canedo · Goiás</p>' +
        '<h1>Imóveis para investir e morar,<br>num só lugar.</h1>' +
        '<p>Lançamentos EBM e Tenda, casas TCM, condomínios de lotes, terrenos e o loteamento Reserva do Parque, com mapa interativo e maquete 3D. Toque em qualquer imóvel e fale direto no WhatsApp.</p>' +
        '<a class="hero-cta" href="'+D.wa_generic+'" target="_blank" rel="noopener">Falar com a Investe Canedo</a>' +
        '<div class="hero-stats">' +
          '<span><b>'+D.props.length+'</b>imóveis na vitrine</span>' +
          '<span><b>'+D.props.filter(function(p){return p.ebm;}).length+'</b>lançamentos EBM</span>' +
          '<span><b>3</b>mapas e maquetes 3D</span>' +
        '</div>' +
      '</div>';
    app.appendChild(hero);

    var rows = {};
    CAT_ORDER.forEach(function(c){
      rows[c] = D.props.filter(function(p){return p.cat===c;});
    });

    function addRow(cat, key){
      var list = rows[key]; if(!list.length) return;
      var sec = document.createElement('section'); sec.className='row'; sec.dataset.cat=key;
      sec.innerHTML = '<div class="row-head"><div><p class="row-tag">'+cat+'</p>'+
        '<h2 class="row-title">'+D.cats[key]+'</h2></div><span class="row-count">'+list.length+' imóveis</span></div>';
      var rail = document.createElement('div'); rail.className='rail';
      list.forEach(function(p){ rail.appendChild(propCard(p)); });
      sec.appendChild(rail); app.appendChild(sec);
    }

    function addBlock(s){
      var sec = document.createElement('section'); sec.className='block'; sec.dataset.cat='mapas';
      sec.innerHTML = '<p class="block-tag">'+s.tag+'</p><h2 class="block-title">'+s.title+'</h2>'+
        '<p class="block-desc">'+s.desc+'</p>';
      var rail = document.createElement('div'); rail.className='rail';
      s.cards.forEach(function(c){ rail.appendChild(blockCard(c)); });
      sec.appendChild(rail); app.appendChild(sec);
    }

    addRow('Lançamentos','lancamentos');
    addBlock(D.sections[0]); // Reserva do Parque
    addRow('Lançamentos','tenda');
    addBlock(D.sections[1]); // Tenda 3D
    addRow('Parceria','tcm');
    addBlock(D.sections[2]); // Catálogo TCM
    addRow('Parceria','loteamentos');
    addRow('Portal','apartamentos');
    addRow('Portal','casas');
    addRow('Portal','terrenos');
    addRow('Portal','chacaras');
    addBlock(D.sections[3]); // Investe em Lotes
  }


  // Medição de cliques nos botões de WhatsApp (GA4)
  document.addEventListener('click', function(ev){
    var a = ev.target && ev.target.closest ? ev.target.closest('a[href*="wa.me"]') : null;
    if(!a || typeof gtag !== 'function') return;
    var botao = a.id || (a.className||'').toString().split(' ')[0] || 'link';
    gtag('event', 'whatsapp_click', {
      botao: botao,
      link_url: a.href,
      pagina: location.pathname
    });
  });
  render();
})();

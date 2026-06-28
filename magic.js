// ═══════════════════════════════════════════
// PARTÍCULAS DOURADAS FLUTUANTES
// ═══════════════════════════════════════════
(function() {
  var colors = ['#C9A84C','#E8C96A','#FFD700','#B8942E','#D4AF37']
  var container = document.createElement('div')
  container.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:0'
  document.body.appendChild(container)
  
  function createParticle() {
    var p = document.createElement('div')
    var size = Math.random() * 4 + 1
    var x = Math.random() * 100
    var duration = Math.random() * 15 + 10
    var delay = Math.random() * 10
    p.style.cssText = [
      'position:absolute',
      'left:' + x + '%',
      'bottom:-20px',
      'width:' + size + 'px',
      'height:' + size + 'px',
      'background:' + colors[Math.floor(Math.random() * colors.length)],
      'border-radius:50%',
      'pointer-events:none',
      'opacity:0',
      'box-shadow:0 0 ' + (size*3) + 'px ' + (size) + 'px rgba(201,168,76,0.15)',
      'animation: floatUp ' + duration + 's linear ' + delay + 's infinite'
    ].join(';')
    container.appendChild(p)
  }
  
  for (var i = 0; i < 30; i++) createParticle()
})();

// ═══════════════════════════════════════════
// EFEITO 3D TILT NOS CARDS
// ═══════════════════════════════════════════
(function() {
  var cards = document.querySelectorAll('.card_item, .barb_card, .stat_card, .p_card, .resumo_card')
  cards.forEach(function(card) {
    card.addEventListener('mousemove', function(e) {
      var rect = card.getBoundingClientRect()
      var x = e.clientX - rect.left
      var y = e.clientY - rect.top
      var centerX = rect.width / 2
      var centerY = rect.height / 2
      var rotateX = (y - centerY) / 15
      var rotateY = (centerX - x) / 15
      card.style.transform = 'perspective(1000px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) scale(1.02)'
    })
    card.addEventListener('mouseleave', function() {
      card.style.transform = ''
    })
  })
})();

// ═══════════════════════════════════════════
// RIPPLE NOS BOTÕES
// ═══════════════════════════════════════════
(function() {
  document.addEventListener('click', function(e) {
    var btn = e.target.closest('.btn_primary, .btn_gold, .btn, .cta_main, .cta_main_btn, .p_btn_gold, .filtro_chip')
    if (!btn) return
    var ripple = document.createElement('span')
    var rect = btn.getBoundingClientRect()
    var size = Math.max(rect.width, rect.height)
    ripple.style.cssText = [
      'position:absolute',
      'border-radius:50%',
      'background:rgba(255,255,255,0.3)',
      'width:' + size + 'px',
      'height:' + size + 'px',
      'left:' + (e.clientX - rect.left - size/2) + 'px',
      'top:' + (e.clientY - rect.top - size/2) + 'px',
      'transform:scale(0)',
      'animation: rippleAnim 0.6s linear',
      'pointer-events:none'
    ].join(';')
    btn.style.position = btn.style.position || 'relative'
    btn.style.overflow = 'hidden'
    btn.appendChild(ripple)
    setTimeout(function() { ripple.remove() }, 600)
  })
})();

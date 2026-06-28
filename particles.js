// PARTICULAS DOURADAS FLUTUANTES
(function() {
  var colors = ['#C9A84C','#E8C96A','#FFD700','#B8942E','#D4AF37']
  var container = document.createElement('div')
  container.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:0'
  document.body.appendChild(container)
  
  for (var i = 0; i < 25; i++) {
    var p = document.createElement('div')
    var size = Math.random() * 3 + 1
    p.style.cssText = [
      'position:absolute',
      'left:' + (Math.random() * 100) + '%',
      'bottom:-20px',
      'width:' + size + 'px',
      'height:' + size + 'px',
      'background:' + colors[Math.floor(Math.random() * colors.length)],
      'border-radius:50%',
      'pointer-events:none',
      'opacity:0',
      'box-shadow:0 0 ' + (size*3) + 'px ' + size + 'px rgba(201,168,76,0.12)',
      'animation: floatUp ' + (Math.random() * 15 + 10) + 's linear ' + (Math.random() * 10) + 's infinite'
    ].join(';')
    container.appendChild(p)
  }
})();

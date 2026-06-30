// PARTICULAS DOURADAS FLUTUANTES
(function() {
  // Inject keyframe
  var style = document.createElement('style')
  style.textContent = '@keyframes floatUp{0%{transform:translateY(0) scale(0);opacity:0}5%{opacity:0.9}80%{opacity:0.4}100%{transform:translateY(-110vh) scale(1.5);opacity:0}}'
  document.head.appendChild(style)

  var colors = ['#C9A84C','#E8C96A','#FFD700','#B8942E','#D4AF37','#F5D76E']
  var container = document.createElement('div')
  container.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:1;overflow:hidden'
  document.body.insertBefore(container, document.body.firstChild)
  
  for (var i = 0; i < 40; i++) {
    var p = document.createElement('div')
    var size = Math.random() * 3 + 1.5
    var x = Math.random() * 100
    var duration = Math.random() * 12 + 8
    var delay = Math.random() * 10
    p.style.cssText = [
      'position:absolute',
      'left:' + x + '%',
      'bottom:-30px',
      'width:' + size + 'px',
      'height:' + size + 'px',
      'background:' + colors[Math.floor(Math.random() * colors.length)],
      'border-radius:50%',
      'pointer-events:none',
      'opacity:0',
      'box-shadow:0 0 ' + (size*4) + 'px ' + (size) + 'px ' + colors[Math.floor(Math.random() * colors.length)],
      'animation:floatUp ' + duration + 's linear ' + delay + 's infinite'
    ].join(';')
    container.appendChild(p)
  }
})();

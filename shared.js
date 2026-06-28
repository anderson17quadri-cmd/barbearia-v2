// ===== SUPABASE =====
// NOTA: db é inicializado em cada HTML, NÃO aqui
// var createClient = supabase.createClient (removido daqui)

// ===== RIPPLE EFFECT =====
document.addEventListener('click', function(e) {
  var btn = e.target.closest('.btn, .btn_primary, .btn_secondary, .btn_gold, .btn_outline, .btn_danger, .btn_success, .filtro_chip')
  if (!btn) return
  var ripple = document.createElement('span')
  ripple.className = 'ripple'
  var rect = btn.getBoundingClientRect()
  var size = Math.max(rect.width, rect.height)
  ripple.style.width = ripple.style.height = size + 'px'
  ripple.style.left = (e.clientX - rect.left - size/2) + 'px'
  ripple.style.top = (e.clientY - rect.top - size/2) + 'px'
  btn.appendChild(ripple)
  setTimeout(function() { ripple.remove() }, 600)
})

// ===== CONFETTI =====
function confetti() {
  var colors = ['#C9A84C','#E8C96A','#2ecc71','#e74c3c','#f0f0f0','#e89043']
  for (var i = 0; i < 50; i++) {
    var piece = document.createElement('div')
    piece.className = 'confetti-piece'
    piece.style.left = Math.random() * 100 + '%'
    piece.style.top = -(Math.random() * 20 + 10) + 'px'
    piece.style.width = (Math.random() * 8 + 4) + 'px'
    piece.style.height = (Math.random() * 8 + 4) + 'px'
    piece.style.background = colors[Math.floor(Math.random() * colors.length)]
    piece.style.borderRadius = Math.random() > .5 ? '50%' : '2px'
    piece.style.animationDuration = (Math.random() * 2 + 1.5) + 's'
    piece.style.animationDelay = Math.random() * .5 + 's'
    document.body.appendChild(piece)
    setTimeout(function() { piece.remove() }, 3000)
  }
}

// ===== ESCAPE HTML (anti-XSS) =====
function esc(s) {
  if (!s && s !== 0) return ''
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')
}

// ===== SKELETON LOADING =====
function skeleton_html(count) {
  count = count || 3
  var html = ''
  for (var i = 0; i < count; i++) {
    html += '<div class="skeleton skeleton-card" style="animation-delay:'+(i*.1)+'s">'
      +'<div style="padding:16px">'
      +'<div class="skeleton skeleton-title"></div>'
      +'<div class="skeleton skeleton-text"></div>'
      +'<div class="skeleton skeleton-text"></div>'
      +'</div></div>'
  }
  return html
}

// ===== TOAST (melhorado) =====
let _toastTimer = null
function toast(msg, tipo) {
  tipo = tipo || 'ok'
  var t = document.getElementById('toast')
  if (!t) return
  clearTimeout(_toastTimer)
  t.className = 'toast'
  t.innerHTML = (tipo==='ok'?'✅ ':'❌ ') + msg
  void t.offsetWidth
  t.className = 'toast show ' + tipo
  _toastTimer = setTimeout(function() {
    t.classList.add('hide')
    setTimeout(function() { t.className = 'toast'; t.textContent = '' }, 300)
  }, 2500)
}

// ===== FORMATAÇÃO =====
function fmt_data(d) {
  try { return new Date(d+'T12:00:00').toLocaleDateString('pt-PT',{weekday:'long',day:'numeric',month:'long'}) }
  catch(e) { return d || '—' }
}
function fmt_data_curta(d) {
  try { return new Date(d+'T12:00:00').toLocaleDateString('pt-PT',{weekday:'short',day:'numeric',month:'short'}) }
  catch(e) { return d || '—' }
}
function fmt_hora(h) { return h ? h.substring(0,5) : '—' }
function fmt_preco(v) { return v ? '€'+parseFloat(v).toFixed(2) : 'Grátis' }

// ===== BADGE =====
function badge(s) {
  var m = {pendente:'badge_pendente',confirmado:'badge_confirmado',cancelado:'badge_cancelado',concluido:'badge_concluido'}
  return '<span class="badge '+(m[s]||'')+'">'+esc(s)+'</span>'
}

// ===== VALIDAÇÃO =====
function validar_email(e) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e || '')
}
function validar_tel(t) {
  return (t||'').replace(/[\s\-()]/g,'').length >= 9
}

// ===== LOADING / EMPTY =====
function loading_html(msg) {
  return '<div class="loading"><div class="spinner"></div> '+(msg||'A carregar...')+'</div>'
}
function empty_html(ico, titulo, sub) {
  return '<div class="empty"><div class="empty_ico">'+(ico||'📭')+'</div><div class="empty_txt">'+(titulo||'Sem dados')+'</div>'+(sub?'<div class="empty_txt" style="font-size:12px;margin-top:4px">'+sub+'</div>':'')+'</div>'
}

// ===== RENDER DE CARDS SEGURO (já faz escape) =====
function card_agendamento(a) {
  var data_txt = a.data ? fmt_data_curta(a.data) : '—'
  var hora_txt = a.hora_inicio ? fmt_hora(a.hora_inicio) : '—'
  var hora_fim_txt = a.hora_fim ? ' - '+fmt_hora(a.hora_fim) : ''
  var nome_cli = a.clientes ? a.clientes.nome : 'Cliente'
  var nome_srv = a.servicos ? a.servicos.nome : '—'
  var nome_pro = a.profissionais ? a.profissionais.nome : 'Qualquer'
  var nome_barb = a.barbearias ? a.barbearias.nome : 'Barbearia'
  var tel = a.clientes ? (a.clientes.telefone||'') : ''
  
  return '<div class="card_item">'
    +'<div class="card_item_header"><div>'
    +(a.barbearias?'<div class="card_item_nome">💈 '+esc(nome_barb)+'</div>':'')
    +'<div class="card_item_nome">'+esc(nome_cli)+'</div>'
    +'<div class="card_item_info">'+esc(data_txt)+' às '+esc(hora_txt)+esc(hora_fim_txt)+'</div>'
    +(tel?'<div class="card_item_info" style="color:var(--text2)">📞 '+esc(tel)+'</div>':'')
    +'</div>'+badge(a.status)+'</div>'
    +'<div class="card_item_info" style="margin-top:4px">'+esc(nome_srv)+' · '+esc(nome_pro)+'</div>'
    +'</div>'
}

// ===== ERRO SEGURO PARA TRY/CATCH =====
function err_msg(e) {
  return e ? (e.message || e.error_description || String(e)) : 'Erro desconhecido'
}

// ===== SAFE INNERHTML =====
function set_html(id, html) {
  var el = typeof id === 'string' ? document.getElementById(id) : id
  if (el) el.innerHTML = html
}

// ===== MOSTRAR/ESCONDER =====
function show(id) { var el = document.getElementById(id); if (el) el.style.display = 'block' }
function hide(id) { var el = document.getElementById(id); if (el) el.style.display = 'none' }
function toggle(id) { var el = document.getElementById(id); if (el) el.style.display = el.style.display==='none'?'block':'none' }
function vis(id, show) { var el = document.getElementById(id); if (el) el.style.display = show?'block':'none' }

// ===== OFFLINE DETECTION =====
window.addEventListener('online', function() {
  var b = document.getElementById('offline_banner')
  if (b) b.classList.remove('show')
})
window.addEventListener('offline', function() {
  var b = document.getElementById('offline_banner')
  if (b) b.classList.add('show')
})

// ===== PERSISTÊNCIA LOCAL SEGURA =====
function local_set(k, v) {
  try { localStorage.setItem(k, JSON.stringify(v)) } catch(e) { /* silencioso */ }
}
function local_get(k, def) {
  try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : def } catch(e) { return def }
}
function local_del(k) {
  try { localStorage.removeItem(k) } catch(e) { /* silencioso */ }
}

// ===== GERAR LINK DA BARBEARIA =====
function link_barbearia(id) {
  return APP_URL + '/cliente.html?b=' + id
}

// ===== COPIAR PARA CLIPBOARD =====
function copiar_texto(texto, cb) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(texto).then(function() { if (cb) cb(true) }).catch(function() { if (cb) cb(false) })
  } else {
    var el = document.createElement('textarea')
    el.value = texto
    el.style.position = 'fixed'
    el.style.opacity = '0'
    document.body.appendChild(el)
    el.select()
    try { document.execCommand('copy'); if (cb) cb(true) } catch(e) { if (cb) cb(false) }
    document.body.removeChild(el)
  }
}

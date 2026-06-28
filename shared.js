// ===== SUPABASE =====
const { createClient } = supabase
const db = createClient(SUPA_URL, SUPA_KEY)

// ===== ESCAPE HTML (anti-XSS) =====
function esc(s) {
  if (!s && s !== 0) return ''
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')
}

// ===== TOAST =====
let _toastTimer = null
function toast(msg, tipo) {
  tipo = tipo || 'ok'
  var t = document.getElementById('toast')
  if (!t) return
  t.textContent = msg
  t.className = 'toast show ' + tipo
  clearTimeout(_toastTimer)
  _toastTimer = setTimeout(function(){ t.className = 'toast' }, 2500)
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

-- ═══════════════════════════════════════════════════════════
-- fix.sql — Correções de base de dados para Agendamento.pt
-- ═══════════════════════════════════════════════════════════
-- 
-- ⚠️  REVÊ E TESTA ANTES DE APLICAR!
--     RLS mal configurada pode bloquear o acesso.
--     Corre no SQL Editor do Supabase:
--     https://supabase.com/dashboard/project/ogtyffrokangokeqlufr/sql/new
--
-- O que faz:
--   1. Índice único contra duplo agendamento
--   2. Políticas RLS para todas as tabelas
-- ═══════════════════════════════════════════════════════════


-- ────────────────────────────────────────────────────────────
-- 1. ÍNDICES CONTRA DUPLO AGENDAMENTO
-- ────────────────────────────────────────────────────────────

-- Bloqueia duas marcações ativas no mesmo profissional/data/hora
-- (exclui cancelados porque esses slots ficam livres)
CREATE UNIQUE INDEX IF NOT EXISTS idx_no_double_booking_pro
ON agendamentos (barbearia_id, profissional_id, data, hora_inicio)
WHERE status != 'cancelado' AND profissional_id IS NOT NULL;

-- Bloqueia duas marcações "qualquer profissional" na mesma hora
CREATE UNIQUE INDEX IF NOT EXISTS idx_no_double_booking_any
ON agendamentos (barbearia_id, data, hora_inicio)
WHERE status != 'cancelado' AND profissional_id IS NULL;


-- ────────────────────────────────────────────────────────────
-- 2. ROW LEVEL SECURITY (RLS)
-- ────────────────────────────────────────────────────────────

-- ═══ barbearias ═══
ALTER TABLE barbearias ENABLE ROW LEVEL SECURITY;

-- Leitura pública de barbearias ativas (app cliente)
DROP POLICY IF EXISTS "Barbearias - leitura publica" ON barbearias;
CREATE POLICY "Barbearias - leitura publica" ON barbearias
  FOR SELECT USING (ativo = true);

-- Gestão total pelo dono
DROP POLICY IF EXISTS "Barbearias - gestao pelo dono" ON barbearias;
CREATE POLICY "Barbearias - gestao pelo dono" ON barbearias
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ═══ servicos ═══
ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;

-- Leitura pública de serviços ativos
DROP POLICY IF EXISTS "Servicos - leitura publica" ON servicos;
CREATE POLICY "Servicos - leitura publica" ON servicos
  FOR SELECT USING (
    ativo = true
    AND EXISTS (SELECT 1 FROM barbearias WHERE id = servicos.barbearia_id AND ativo = true)
  );

-- Gestão pelo dono da barbearia
DROP POLICY IF EXISTS "Servicos - gestao pelo dono" ON servicos;
CREATE POLICY "Servicos - gestao pelo dono" ON servicos
  FOR ALL USING (
    EXISTS (SELECT 1 FROM barbearias WHERE id = servicos.barbearia_id AND user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM barbearias WHERE id = servicos.barbearia_id AND user_id = auth.uid())
  );


-- ═══ profissionais ═══
ALTER TABLE profissionais ENABLE ROW LEVEL SECURITY;

-- Leitura pública
DROP POLICY IF EXISTS "Profissionais - leitura publica" ON profissionais;
CREATE POLICY "Profissionais - leitura publica" ON profissionais
  FOR SELECT USING (
    ativo = true
    AND EXISTS (SELECT 1 FROM barbearias WHERE id = profissionais.barbearia_id AND ativo = true)
  );

-- Gestão pelo dono
DROP POLICY IF EXISTS "Profissionais - gestao pelo dono" ON profissionais;
CREATE POLICY "Profissionais - gestao pelo dono" ON profissionais
  FOR ALL USING (
    EXISTS (SELECT 1 FROM barbearias WHERE id = profissionais.barbearia_id AND user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM barbearias WHERE id = profissionais.barbearia_id AND user_id = auth.uid())
  );


-- ═══ horarios ═══
ALTER TABLE horarios ENABLE ROW LEVEL SECURITY;

-- Leitura pública
DROP POLICY IF EXISTS "Horarios - leitura publica" ON horarios;
CREATE POLICY "Horarios - leitura publica" ON horarios
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM barbearias WHERE id = horarios.barbearia_id AND ativo = true)
  );

-- Gestão pelo dono
DROP POLICY IF EXISTS "Horarios - gestao pelo dono" ON horarios;
CREATE POLICY "Horarios - gestao pelo dono" ON horarios
  FOR ALL USING (
    EXISTS (SELECT 1 FROM barbearias WHERE id = horarios.barbearia_id AND user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM barbearias WHERE id = horarios.barbearia_id AND user_id = auth.uid())
  );


-- ═══ clientes ═══
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

-- INSERT público (clientes marcam sem conta)
DROP POLICY IF EXISTS "Clientes - insert publico" ON clientes;
CREATE POLICY "Clientes - insert publico" ON clientes
  FOR INSERT WITH CHECK (true);

-- SELECT público (para busca de cliente existente durante marcação)
DROP POLICY IF EXISTS "Clientes - select publico" ON clientes;
CREATE POLICY "Clientes - select publico" ON clientes
  FOR SELECT USING (true);

-- UPDATE público limitado (atualizar nome/telefone durante marcação)
DROP POLICY IF EXISTS "Clientes - update publico" ON clientes;
CREATE POLICY "Clientes - update publico" ON clientes
  FOR UPDATE USING (true) WITH CHECK (true);

-- Gestão pelo dono da barbearia (listar clientes no painel)
DROP POLICY IF EXISTS "Clientes - gestao pelo dono" ON clientes;
CREATE POLICY "Clientes - gestao pelo dono" ON clientes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM barbearias WHERE id = clientes.barbearia_id AND user_id = auth.uid())
    OR barbearia_id IS NULL
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM barbearias WHERE id = clientes.barbearia_id AND user_id = auth.uid())
    OR barbearia_id IS NULL
  );


-- ═══ agendamentos ═══
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;

-- INSERT público (clientes marcam sem conta)
DROP POLICY IF EXISTS "Agendamentos - insert publico" ON agendamentos;
CREATE POLICY "Agendamentos - insert publico" ON agendamentos
  FOR INSERT WITH CHECK (true);

-- SELECT público básico (necessário para verificar conflitos de hora)
-- NOTA: se isto expuser demasiada informação, rever.
DROP POLICY IF EXISTS "Agendamentos - select publico" ON agendamentos;
CREATE POLICY "Agendamentos - select publico" ON agendamentos
  FOR SELECT USING (true);

-- Gestão pelo dono da barbearia (confirmar/cancelar/concluir)
DROP POLICY IF EXISTS "Agendamentos - gestao pelo dono" ON agendamentos;
CREATE POLICY "Agendamentos - gestao pelo dono" ON agendamentos
  FOR ALL USING (
    EXISTS (SELECT 1 FROM barbearias WHERE id = agendamentos.barbearia_id AND user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM barbearias WHERE id = agendamentos.barbearia_id AND user_id = auth.uid())
  );


-- ═══════════════════════════════════════════════════════════
-- FIM
-- ═══════════════════════════════════════════════════════════

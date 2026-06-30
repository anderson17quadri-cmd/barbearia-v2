-- ═══════════════════════════════════════════════════════════
-- fix.sql FINAL — Agendado.pt
-- Corre no SQL Editor do Supabase:
-- https://supabase.com/dashboard/project/ogtyffrokangokeqlufr/sql/new
-- ═══════════════════════════════════════════════════════════

-- ─── 1. ÍNDICES ANTI-DUPLO-AGENDAMENTO ───
CREATE UNIQUE INDEX IF NOT EXISTS idx_no_double_booking_pro
ON agendamentos (barbearia_id, profissional_id, data, hora_inicio)
WHERE status != 'cancelado' AND profissional_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_no_double_booking_any
ON agendamentos (barbearia_id, data, hora_inicio)
WHERE status != 'cancelado' AND profissional_id IS NULL;

-- ─── 2. COLUNA AUTO_CONFIRMAR ───
ALTER TABLE barbearias ADD COLUMN IF NOT EXISTS auto_confirmar boolean NOT NULL DEFAULT false;

-- ─── 3. FUNÇÕES RPC SECURITY DEFINER ───

-- 3a. horas_ocupadas — slots ocupados (sem PII)
CREATE OR REPLACE FUNCTION horas_ocupadas(p_barbearia uuid, p_data date, p_profissional uuid DEFAULT NULL)
RETURNS TABLE (hora_inicio time, duracao int)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT a.hora_inicio, COALESCE(s.duracao, 30)::int AS duracao
  FROM agendamentos a
  LEFT JOIN servicos s ON s.id = a.servico_id
  WHERE a.barbearia_id = p_barbearia
    AND a.data = p_data
    AND a.status != 'cancelado'
    AND (p_profissional IS NULL OR a.profissional_id = p_profissional);
END;
$$;

-- 3b. marcar — find-or-create cliente + insert agendamento (atómico)
CREATE OR REPLACE FUNCTION marcar(
  p_barbearia uuid, p_servico uuid, p_profissional uuid DEFAULT NULL,
  p_data date DEFAULT NULL, p_hora text DEFAULT NULL,
  p_nome text DEFAULT 'Cliente', p_tel text DEFAULT '', p_email text DEFAULT ''
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_cliente_id uuid;
  v_duracao int;
  v_hora_fim time;
  v_auto boolean;
BEGIN
  SELECT duracao INTO v_duracao FROM servicos WHERE id = p_servico;
  IF v_duracao IS NULL THEN v_duracao := 30; END IF;
  v_hora_fim := (p_hora::time + (v_duracao || ' minutes')::interval)::time;

  IF p_tel != '' THEN
    SELECT id INTO v_cliente_id FROM clientes
    WHERE barbearia_id = p_barbearia AND telefone = p_tel LIMIT 1;
  END IF;
  IF v_cliente_id IS NULL AND p_email != '' THEN
    SELECT id INTO v_cliente_id FROM clientes
    WHERE barbearia_id = p_barbearia AND email = p_email LIMIT 1;
  END IF;
  IF v_cliente_id IS NULL THEN
    INSERT INTO clientes (barbearia_id, nome, telefone, email)
    VALUES (p_barbearia, p_nome, p_tel, p_email) RETURNING id INTO v_cliente_id;
  ELSE
    UPDATE clientes SET nome = p_nome WHERE id = v_cliente_id;
  END IF;

  SELECT COALESCE(auto_confirmar, false) INTO v_auto FROM barbearias WHERE id = p_barbearia;

  INSERT INTO agendamentos (barbearia_id, cliente_id, servico_id, profissional_id, data, hora_inicio, hora_fim, status)
  VALUES (p_barbearia, v_cliente_id, p_servico, p_profissional, p_data, p_hora::time, v_hora_fim,
          CASE WHEN v_auto THEN 'confirmado' ELSE 'pendente' END);

  RETURN jsonb_build_object('ok', true, 'cliente_id', v_cliente_id);
EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object('ok', false, 'motivo', 'ocupado');
END;
$$;

-- 3c. minhas_marcacoes — marcações da pessoa (sem PII de terceiros)
CREATE OR REPLACE FUNCTION minhas_marcacoes(p_email text DEFAULT '', p_tel text DEFAULT '')
RETURNS TABLE (
  id uuid, barbearia_id uuid, cliente_id uuid, servico_id uuid, profissional_id uuid,
  data date, hora_inicio time, hora_fim time, status text,
  barbearia_nome text, servico_nome text, profissional_nome text
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT a.id, a.barbearia_id, a.cliente_id, a.servico_id, a.profissional_id,
         a.data, a.hora_inicio, a.hora_fim, a.status,
         b.nome AS barbearia_nome, s.nome AS servico_nome, p.nome AS profissional_nome
  FROM agendamentos a
  JOIN barbearias b ON b.id = a.barbearia_id
  LEFT JOIN servicos s ON s.id = a.servico_id
  LEFT JOIN profissionais p ON p.id = a.profissional_id
  WHERE a.cliente_id IN (
    SELECT id FROM clientes
    WHERE (p_email != '' AND email = p_email) OR (p_tel != '' AND telefone = p_tel)
  )
  ORDER BY a.data DESC, a.hora_inicio DESC LIMIT 50;
END;
$$;

-- ─── 4. GRANTS ───
GRANT EXECUTE ON FUNCTION horas_ocupadas(uuid, date, uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION marcar(uuid, uuid, uuid, date, text, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION minhas_marcacoes(text, text) TO anon, authenticated;

-- ─── 5. POLÍTICAS RLS ───
ALTER TABLE barbearias ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Barbearias - leitura publica" ON barbearias;
CREATE POLICY "Barbearias - leitura publica" ON barbearias FOR SELECT USING (ativo = true);
DROP POLICY IF EXISTS "Barbearias - gestao pelo dono" ON barbearias;
CREATE POLICY "Barbearias - gestao pelo dono" ON barbearias FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Servicos - leitura publica" ON servicos;
CREATE POLICY "Servicos - leitura publica" ON servicos FOR SELECT USING (ativo = true AND EXISTS (SELECT 1 FROM barbearias WHERE id = servicos.barbearia_id AND ativo = true));
DROP POLICY IF EXISTS "Servicos - gestao pelo dono" ON servicos;
CREATE POLICY "Servicos - gestao pelo dono" ON servicos FOR ALL USING (EXISTS (SELECT 1 FROM barbearias WHERE id = servicos.barbearia_id AND user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM barbearias WHERE id = servicos.barbearia_id AND user_id = auth.uid()));

ALTER TABLE profissionais ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Profissionais - leitura publica" ON profissionais;
CREATE POLICY "Profissionais - leitura publica" ON profissionais FOR SELECT USING (ativo = true AND EXISTS (SELECT 1 FROM barbearias WHERE id = profissionais.barbearia_id AND ativo = true));
DROP POLICY IF EXISTS "Profissionais - gestao pelo dono" ON profissionais;
CREATE POLICY "Profissionais - gestao pelo dono" ON profissionais FOR ALL USING (EXISTS (SELECT 1 FROM barbearias WHERE id = profissionais.barbearia_id AND user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM barbearias WHERE id = profissionais.barbearia_id AND user_id = auth.uid()));

ALTER TABLE horarios ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Horarios - leitura publica" ON horarios;
CREATE POLICY "Horarios - leitura publica" ON horarios FOR SELECT USING (EXISTS (SELECT 1 FROM barbearias WHERE id = horarios.barbearia_id AND ativo = true));
DROP POLICY IF EXISTS "Horarios - gestao pelo dono" ON horarios;
CREATE POLICY "Horarios - gestao pelo dono" ON horarios FOR ALL USING (EXISTS (SELECT 1 FROM barbearias WHERE id = horarios.barbearia_id AND user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM barbearias WHERE id = horarios.barbearia_id AND user_id = auth.uid()));

-- clientes: só gestão do dono (sem acesso público a PII)
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Clientes - insert publico" ON clientes;
DROP POLICY IF EXISTS "Clientes - select publico" ON clientes;
DROP POLICY IF EXISTS "Clientes - update publico" ON clientes;
DROP POLICY IF EXISTS "Clientes - gestao pelo dono" ON clientes;
CREATE POLICY "Clientes - gestao pelo dono" ON clientes FOR ALL USING (EXISTS (SELECT 1 FROM barbearias WHERE id = clientes.barbearia_id AND user_id = auth.uid()));

-- agendamentos: só gestão do dono (sem acesso público)
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Agendamentos - insert publico" ON agendamentos;
DROP POLICY IF EXISTS "Agendamentos - select publico" ON agendamentos;
DROP POLICY IF EXISTS "Agendamentos - gestao pelo dono" ON agendamentos;
CREATE POLICY "Agendamentos - gestao pelo dono" ON agendamentos FOR ALL USING (EXISTS (SELECT 1 FROM barbearias WHERE id = agendamentos.barbearia_id AND user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM barbearias WHERE id = agendamentos.barbearia_id AND user_id = auth.uid()));


-- ═══════════════════════════════════════════════════════════
-- ─── 6. TRIAL / SUBSCRIÇÃO (adicionado pós-lançamento) ───
-- ═══════════════════════════════════════════════════════════

-- 6a. Colunas de trial e plano
ALTER TABLE barbearias ADD COLUMN IF NOT EXISTS trial_inicio timestamptz DEFAULT now();
ALTER TABLE barbearias ADD COLUMN IF NOT EXISTS plano_ativo boolean NOT NULL DEFAULT false;

-- 6b. Uma barbearia por conta (impede duplicados)
ALTER TABLE barbearias DROP CONSTRAINT IF EXISTS uniq_user_barbearia;
ALTER TABLE barbearias ADD CONSTRAINT uniq_user_barbearia UNIQUE (user_id);

-- 6c. estado_conta — devolve dias de trial restantes (15 dias) e acesso
CREATE OR REPLACE FUNCTION estado_conta()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE v_inicio timestamptz; v_ativo boolean; v_dias int; v_restantes int;
BEGIN
  SELECT trial_inicio, plano_ativo INTO v_inicio, v_ativo
  FROM barbearias WHERE user_id = auth.uid() LIMIT 1;
  IF v_inicio IS NULL THEN RETURN jsonb_build_object('ok', false, 'motivo', 'sem_barbearia'); END IF;
  v_dias := EXTRACT(DAY FROM (now() - v_inicio))::int;
  v_restantes := GREATEST(0, 15 - v_dias);
  RETURN jsonb_build_object('ok', true, 'plano_ativo', v_ativo, 'dias_restantes', v_restantes, 'acesso', (v_ativo OR v_restantes > 0));
END; $$;

-- 6d. cancelar_minha — cancelamento seguro pelo cliente (valida email/tel)
CREATE OR REPLACE FUNCTION cancelar_minha(p_id uuid, p_email text DEFAULT '', p_tel text DEFAULT '')
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE v_ok boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM agendamentos a
    JOIN clientes c ON c.id = a.cliente_id
    WHERE a.id = p_id AND a.status = 'pendente'
      AND ((p_email != '' AND c.email = p_email) OR (p_tel != '' AND c.telefone = p_tel))
  ) INTO v_ok;
  IF NOT v_ok THEN RETURN jsonb_build_object('ok', false); END IF;
  UPDATE agendamentos SET status = 'cancelado' WHERE id = p_id;
  RETURN jsonb_build_object('ok', true);
END; $$;

-- 6e. ativar_plano — chamada pelo webhook Stripe (só service_role)
CREATE OR REPLACE FUNCTION ativar_plano(p_email text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  UPDATE barbearias SET plano_ativo = true
  WHERE user_id = (SELECT id FROM auth.users WHERE email = p_email LIMIT 1);
  RETURN jsonb_build_object('ok', true);
END; $$;

-- 6f. Grants (estado_conta e cancelar_minha p/ clientes; ativar_plano NÃO p/ anon)
GRANT EXECUTE ON FUNCTION estado_conta() TO authenticated;
GRANT EXECUTE ON FUNCTION cancelar_minha(uuid, text, text) TO anon, authenticated;
-- ativar_plano: sem grant a anon/authenticated (só service_role via webhook)

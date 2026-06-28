-- ═══════════════════════════════════════════════════════════
-- fix.sql v2 — RLS apertado (RGPD) + RPCs SECURITY DEFINER
-- ═══════════════════════════════════════════════════════════
-- 
-- ⚠️  Corre no SQL Editor do Supabase:
--     https://supabase.com/dashboard/project/ogtyffrokangokeqlufr/sql/new
--
-- O que faz:
--   1. 3 funções RPC SECURITY DEFINER (substituem acesso direto a clientes/agendamentos)
--   2. Remove políticas públicas de clientes e agendamentos
--   3. Concede EXECUTE ao role anon
--   4. Mantém índices anti-duplo-agendamento
--   5. Mantém leitura pública de barbearias/serviços/profissionais/horarios
-- ═══════════════════════════════════════════════════════════


-- ────────────────────────────────────────────────────────────
-- 1. FUNÇÕES RPC SECURITY DEFINER
-- ────────────────────────────────────────────────────────────

-- 1a. horas_ocupadas — devolve slots ocupados (sem PII)
CREATE OR REPLACE FUNCTION horas_ocupadas(
  p_barbearia uuid,
  p_data date,
  p_profissional uuid DEFAULT NULL
) RETURNS TABLE (hora_inicio time, duracao int) 
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
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


-- 1b. marcar — find-or-create cliente + insert agendamento (atómico)
CREATE OR REPLACE FUNCTION marcar(
  p_barbearia uuid,
  p_servico uuid,
  p_profissional uuid DEFAULT NULL,
  p_data date DEFAULT NULL,
  p_hora text DEFAULT NULL,
  p_nome text DEFAULT 'Cliente',
  p_tel text DEFAULT '',
  p_email text DEFAULT ''
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_cliente_id uuid;
  v_duracao int;
  v_hora_fim time;
BEGIN
  -- Encontrar duração do serviço
  SELECT duracao INTO v_duracao FROM servicos WHERE id = p_servico;
  IF v_duracao IS NULL THEN v_duracao := 30; END IF;

  -- Calcular hora_fim
  v_hora_fim := (p_hora::time + (v_duracao || ' minutes')::interval)::time;

  -- Find-or-create cliente por (barbearia_id, telefone) ou (barbearia_id, email)
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
    VALUES (p_barbearia, p_nome, p_tel, p_email)
    RETURNING id INTO v_cliente_id;
  ELSE
    UPDATE clientes SET nome = p_nome WHERE id = v_cliente_id;
  END IF;

  -- Inserir agendamento (índice único protege contra duplo)
  INSERT INTO agendamentos (barbearia_id, cliente_id, servico_id, profissional_id, data, hora_inicio, hora_fim, status)
  VALUES (p_barbearia, v_cliente_id, p_servico, p_profissional, p_data, p_hora::time, v_hora_fim, 'pendente');

  RETURN jsonb_build_object('ok', true, 'cliente_id', v_cliente_id);

EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object('ok', false, 'motivo', 'ocupado');
  WHEN others THEN
    RETURN jsonb_build_object('ok', false, 'motivo', SQLERRM);
END;
$$;


-- 1c. minhas_marcacoes — devolve marcações da pessoa (por email/tel)
CREATE OR REPLACE FUNCTION minhas_marcacoes(
  p_email text DEFAULT '',
  p_tel text DEFAULT ''
) RETURNS TABLE (
  id uuid,
  barbearia_id uuid,
  cliente_id uuid,
  servico_id uuid,
  profissional_id uuid,
  data date,
  hora_inicio time,
  hora_fim time,
  status text,
  barbearia_nome text,
  servico_nome text,
  profissional_nome text
)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
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
    WHERE (p_email != '' AND email = p_email)
       OR (p_tel != '' AND telefone = p_tel)
  )
  ORDER BY a.data DESC, a.hora_inicio DESC
  LIMIT 50;
END;
$$;


-- ────────────────────────────────────────────────────────────
-- 2. APERTAR POLÍTICAS — remover acesso público a PII
-- ────────────────────────────────────────────────────────────

-- clientes: remove políticas públicas, mantém só gestão do dono
DROP POLICY IF EXISTS "Clientes - insert publico" ON clientes;
DROP POLICY IF EXISTS "Clientes - select publico" ON clientes;
DROP POLICY IF EXISTS "Clientes - update publico" ON clientes;

-- agendamentos: remove políticas públicas, mantém só gestão do dono
DROP POLICY IF EXISTS "Agendamentos - insert publico" ON agendamentos;
DROP POLICY IF EXISTS "Agendamentos - select publico" ON agendamentos;


-- ────────────────────────────────────────────────────────────
-- 3. CONCEDER EXECUTE AO ROLE ANON
-- ────────────────────────────────────────────────────────────

GRANT EXECUTE ON FUNCTION horas_ocupadas(uuid, date, uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION marcar(uuid, uuid, uuid, date, text, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION minhas_marcacoes(text, text) TO anon, authenticated;


-- ═══════════════════════════════════════════════════════════
-- VERIFICAÇÃO (corre depois de aplicar):
--   SELECT * FROM horas_ocupadas('ID_BARBEARIA', CURRENT_DATE, NULL);
--   SELECT marcar('ID_BARBEARIA', 'ID_SERVICO', NULL, CURRENT_DATE, '10:00', 'Teste', '912345678', 'teste@teste.com');
--   SELECT * FROM minhas_marcacoes('teste@teste.com', '912345678');
-- ═══════════════════════════════════════════════════════════

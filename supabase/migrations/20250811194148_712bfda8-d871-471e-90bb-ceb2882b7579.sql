-- Inserir dados de teste para verificar conexão
INSERT INTO public.clientes (nome, cpf, telefone, email, endereco, placa_veiculo)
VALUES 
  ('João Silva', '12345', '(11) 99999-9999', 'joao@teste.com', 'Rua Teste, 123', 'ABC-1234'),
  ('Maria Santos', '67890', '(11) 88888-8888', 'maria@teste.com', 'Av. Exemplo, 456', 'XYZ-5678');

-- Criar usuário admin de teste (será criado via Auth depois)
-- Para criar o admin, você precisará:
-- 1. Ir para o Supabase Auth Dashboard
-- 2. Criar um usuário com email admin@mcdespachadoria.com.br
-- 3. Depois o sistema criará automaticamente o perfil com tipo 'cliente'
-- 4. Então atualize manualmente para 'admin'
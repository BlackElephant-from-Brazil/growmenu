-- Criar banco de dados
CREATE DATABASE growmenu;

-- Criar usuário
CREATE USER growmenu WITH ENCRYPTED PASSWORD 'growmenu123';

-- Dar permissões
GRANT ALL PRIVILEGES ON DATABASE growmenu TO growmenu;
GRANT ALL ON SCHEMA public TO growmenu;

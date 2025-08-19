# GrowMenu Backend

API Backend para plataforma de cardápio digital focada em aumentar vendas e faturamento de restaurantes.

## 🚀 Tecnologias

- **NestJS** - Framework Node.js
- **TypeScript** - Tipagem estática
- **PostgreSQL** - Banco de dados
- **TypeORM** - ORM
- **JWT** - Autenticação
- **bcryptjs** - Hash de senhas
- **class-validator** - Validação de dados

## 📋 Pré-requisitos

- Node.js 18+
- PostgreSQL 15+
- npm ou yarn

## 🔧 Configuração

### 1. Clonar e instalar dependências

```bash
# Instalar dependências
npm install
```

### 2. Configurar banco de dados

#### Opção A: Docker (Recomendado)
```bash
# Subir PostgreSQL com Docker
docker-compose up -d
```

#### Opção B: PostgreSQL local
```bash
# Executar o script SQL no PostgreSQL
psql -U postgres -f database/setup.sql
```

### 3. Configurar variáveis de ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env
```

Editar o arquivo `.env` com suas configurações:

```env
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=growmenu
DB_PASSWORD=growmenu123
DB_DATABASE=growmenu

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
```

## 🏃‍♂️ Executar aplicação

```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod
```

A API estará disponível em: `http://localhost:3000`

## 📚 Documentação da API

### Endpoints Disponíveis

#### 🔐 Autenticação
- `POST /api/users/register` - Registrar novo usuário (sem autenticação)
- `POST /api/auth/login` - Login

#### 👤 Usuários (requer autenticação)
- `GET /api/users/profile` - Perfil do usuário logado
- `GET /api/users/:id` - Detalhes de um usuário
- `GET /api/users` - Listar todos usuários

#### 🏢 Empresas (requer autenticação)
- `POST /api/companies` - Criar nova empresa
- `GET /api/companies` - Listar todas empresas
- `GET /api/companies/my-companies` - Empresas do usuário logado
- `GET /api/companies/:id` - Detalhes de uma empresa
- `PATCH /api/companies/:id` - Atualizar empresa
- `DELETE /api/companies/:id` - Deletar empresa

#### 🏪 Restaurantes (requer autenticação)
- `POST /api/restaurants` - Criar novo restaurante
- `GET /api/restaurants` - Listar todos restaurantes
- `GET /api/restaurants/my-restaurants` - Restaurantes do usuário logado
- `GET /api/restaurants/company/:companyId` - Restaurantes por empresa
- `GET /api/restaurants/:id` - Detalhes de um restaurante
- `PATCH /api/restaurants/:id` - Atualizar restaurante
- `DELETE /api/restaurants/:id` - Deletar restaurante

### Exemplos de Uso

#### Registrar usuário
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@exemplo.com",
    "password": "123456"
  }'
```

#### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@exemplo.com",
    "password": "123456"
  }'
```

#### Criar empresa (com token)
```bash
curl -X POST http://localhost:3000/api/companies \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Minha Empresa",
    "cnpj": "12345678000123"
  }'
```

#### Criar restaurante (com token)
```bash
curl -X POST http://localhost:3000/api/restaurants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Restaurante do João",
    "place": "Rua das Flores, 123 - Centro",
    "company_id": "uuid-da-empresa"
  }'
```

## 🗄️ Estrutura do Banco de Dados

### Tabelas

#### Users
- `id` (UUID) - Chave primária
- `name` (VARCHAR) - Nome do usuário
- `email` (VARCHAR) - Email único
- `password` (VARCHAR) - Senha hasheada
- `restaurant_id` (UUID) - FK para Restaurant (opcional)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### Companies
- `id` (UUID) - Chave primária
- `name` (VARCHAR) - Nome da empresa
- `cnpj` (VARCHAR) - CNPJ único
- `user_manager_id` (UUID) - FK para User
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### Restaurants
- `id` (UUID) - Chave primária
- `name` (VARCHAR) - Nome do restaurante
- `place` (VARCHAR) - Endereço
- `creator_id` (UUID) - FK para User
- `company_id` (UUID) - FK para Company
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Relacionamentos

- Um usuário pode gerenciar várias empresas
- Uma empresa pode ter vários restaurantes
- Um usuário pode criar vários restaurantes
- Um usuário pode estar associado a um restaurante
- Um restaurante pertence a uma empresa

## 🔒 Segurança

- Senhas são hasheadas com bcryptjs
- Autenticação via JWT
- Validação de dados com class-validator
- Proteção CORS habilitada
- Validação de permissões por usuário

## 📈 Melhorias Sugeridas

### Modelagem de Dados
1. **Adicionar campo `role` na tabela Users** - Para diferenciar tipos de usuário (admin, manager, staff)
2. **Adicionar soft delete** - Para não perder dados históricos
3. **Adicionar auditoria** - Campos `created_by`, `updated_by`
4. **Normalizar endereços** - Criar tabela separada para endereços
5. **Adicionar status** - Para empresas e restaurantes (ativo/inativo)

### Lógica de Negócios
1. **Sistema de roles e permissões** - Controle granular de acesso
2. **Multi-tenancy** - Isolamento de dados por empresa
3. **Logs de auditoria** - Rastreamento de todas as operações
4. **Rate limiting** - Proteção contra abuso da API
5. **Paginação** - Para listas grandes
6. **Filtros e busca** - Melhorar queries de listagem
7. **Validação de CNPJ** - Verificar formato e validade
8. **Upload de imagens** - Para logos de empresas e restaurantes
9. **Notificações** - Sistema de notificações por email/SMS
10. **Cache** - Redis para melhor performance

### Estrutura Técnica
1. **Documentação Swagger** - Documentação automática da API
2. **Testes unitários e integração** - Cobertura de testes
3. **Docker** - Containerização completa
4. **CI/CD** - Pipeline de deploy automatizado
5. **Monitoramento** - Logs, métricas e alertas
6. **Backup automatizado** - Estratégia de backup do banco
7. **Migrations** - Versionamento do banco de dados
8. **Healthcheck** - Endpoint para monitoramento da API

## 🚀 Próximos Passos

1. Implementar tabelas de: `menus`, `menu_items`, `categories`
2. Sistema de funcionários e permissões
3. Módulo de pedidos e vendas
4. Dashboard com métricas de vendas
5. Integração com sistemas de pagamento
6. App mobile para clientes
7. Sistema de QR Code para mesas

## 📝 Scripts Disponíveis

```bash
# Desenvolvimento
npm run start:dev

# Build
npm run build

# Produção
npm run start:prod

# Testes
npm run test

# Formatação
npm run format

# Lint
npm run lint
```

## 📧 Contato

Para dúvidas ou sugestões sobre o projeto, entre em contato.

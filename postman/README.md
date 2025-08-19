# 📮 Postman Collection - GrowMenu API

Este diretório contém os arquivos para importar no Postman e testar todas as rotas da API GrowMenu.

## 📁 Arquivos

- **`GrowMenu_API.postman_collection.json`** - Coleção com todas as rotas da API
- **`GrowMenu_Development.postman_environment.json`** - Ambiente de desenvolvimento
- **`README.md`** - Este arquivo com instruções

## 🚀 Como Importar no Postman

### 1. Importar a Coleção

1. Abra o Postman
2. Clique em **"Import"** (canto superior esquerdo)
3. Arraste ou selecione o arquivo `GrowMenu_API.postman_collection.json`
4. Clique em **"Import"**

### 2. Importar o Ambiente

1. No Postman, clique no ícone de **"Environments"** (canto superior direito)
2. Clique em **"Import"**
3. Selecione o arquivo `GrowMenu_Development.postman_environment.json`
4. Clique em **"Import"**
5. Selecione o ambiente **"GrowMenu Development"** no dropdown

## 🔧 Configuração

### Variáveis de Ambiente

O ambiente já vem configurado com:

- **`baseUrl`**: `http://localhost:3000/api` (URL da API)
- **`token`**: Será preenchido automaticamente após login
- **`userId`**: Para armazenar IDs de usuários
- **`companyId`**: Para armazenar IDs de empresas  
- **`restaurantId`**: Para armazenar IDs de restaurantes

### Token Automático

A requisição de **Login** está configurada para salvar automaticamente o token JWT na variável `{{token}}`. Após fazer login, todas as outras requisições usarão esse token automaticamente.

## 📚 Como Usar

### 1. Primeiro Acesso

1. **Registrar Usuário**: Use a rota `POST /users/register`
2. **Fazer Login**: Use a rota `POST /auth/login` (o token será salvo automaticamente)
3. **Verificar Perfil**: Use a rota `GET /users/profile` para confirmar que está autenticado

### 2. Fluxo Completo de Teste

```
1. 👤 Registrar Usuário
2. 🔐 Fazer Login  
3. 👤 Verificar Perfil
4. 🏢 Criar Empresa
5. 🏪 Criar Restaurante
6. 📋 Listar dados criados
```

### 3. Estrutura das Pastas

- **🔐 Autenticação**: Login (único endpoint sem autenticação além do registro)
- **👤 Usuários**: Registro, perfil e listagens de usuários
- **🏢 Empresas**: CRUD completo de empresas
- **🏪 Restaurantes**: CRUD completo de restaurantes

## 🔒 Autenticação

### Rotas que NÃO precisam de autenticação:
- `POST /users/register` - Registrar usuário

### Rotas que PRECISAM de autenticação:
- Todas as outras rotas precisam do header: `Authorization: Bearer {{token}}`

O token é configurado automaticamente após o login, então você não precisa se preocupar em copiá-lo manualmente.

## 📋 Exemplos de Dados

### Registro de Usuário
```json
{
  "name": "João Silva",
  "email": "joao@exemplo.com", 
  "password": "123456"
}
```

### Login
```json
{
  "email": "joao@exemplo.com",
  "password": "123456"
}
```

### Criar Empresa
```json
{
  "name": "Minha Empresa LTDA",
  "cnpj": "12345678000123"
}
```

### Criar Restaurante
```json
{
  "name": "Restaurante do João",
  "place": "Rua das Flores, 123 - Centro, São Paulo - SP",
  "company_id": "uuid-da-empresa"
}
```

## 🚨 Dicas Importantes

1. **Ordem de Testes**: Sempre registre um usuário e faça login primeiro
2. **Token Automático**: O token é salvo automaticamente após login
3. **IDs**: Copie os IDs retornados pelas requisições para usar nas próximas
4. **Permissões**: Usuários só podem editar/deletar suas próprias empresas e restaurantes
5. **Relacionamentos**: Um restaurante precisa de uma empresa existente (company_id)

## 🐛 Solução de Problemas

### Erro 401 (Unauthorized)
- Verifique se fez login e o token está configurado
- O token expira em 7 dias

### Erro 403 (Forbidden)  
- Você está tentando editar/deletar um recurso que não é seu
- Apenas managers de empresa podem gerenciar seus recursos

### Erro 404 (Not Found)
- Verifique se o ID usado na URL está correto
- Certifique-se de que o recurso existe

### Erro 409 (Conflict)
- Email ou CNPJ já estão em uso
- Use dados diferentes

## 🔄 Atualizações

Para atualizar a coleção:
1. Reimporte o arquivo JSON
2. O Postman perguntará se deseja substituir - clique em **"Replace"**

---

**📧 Dúvidas?** Consulte a documentação da API no README principal do projeto.

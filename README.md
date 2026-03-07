# Node.js Authentication Server

Servidor Node.js com Express, TypeScript, JWT e arquitetura em camadas para autenticação e gerenciamento de usuários.

## 🚀 Tecnologias

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **TypeScript** - Tipagem estática
- **JWT** - Autenticação com tokens
- **Bcrypt** - Criptografia de senhas
- **Joi** - Validação de dados
- **Helmet** - Segurança HTTP
- **Morgan** - Logs de requisições
- **CORS** - Controle de origem cruzada

## 📁 Estrutura do Projeto

```
src/
├── controllers/        # Controladores (lógica de requisição/resposta)
├── services/          # Serviços (regras de negócio)
├── repositories/      # Repositórios (acesso a dados)
├── middlewares/       # Middlewares (autenticação, validação, erros)
├── routes/           # Definição das rotas
├── types/            # Tipos TypeScript
└── server.ts         # Arquivo principal do servidor
```

## ⚙️ Instalação

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

3. Copie o arquivo de ambiente:
```bash
cp .env.example .env
```

4. Configure as variáveis de ambiente no arquivo `.env`:
```
PORT=3000
JWT_SECRET=seu_jwt_secret_super_seguro_aqui
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=12
NODE_ENV=development
```

## 🏃‍♂️ Executando

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm run build
npm start
```

## 📚 Endpoints da API

### Autenticação

#### POST /api/auth/register
Registra um novo usuário
```json
{
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "password": "MinhaSenh@123"
}
```

#### POST /api/auth/login
Faz login do usuário
```json
{
  "email": "joao@exemplo.com",
  "password": "MinhaSenh@123"
}
```

#### POST /api/auth/refresh
Renova o token JWT (requer token válido)

#### POST /api/auth/logout
Faz logout do usuário (requer autenticação)

#### GET /api/auth/validate
Valida o token JWT (requer autenticação)

### Usuários

#### GET /api/users/profile
Obtém o perfil do usuário logado (requer autenticação)

#### GET /api/users
Lista todos os usuários (requer autenticação)

#### GET /api/users/:id
Obtém usuário por ID (requer autenticação)

#### PUT /api/users/:id
Atualiza dados do usuário (requer autenticação)
```json
{
  "name": "Novo Nome",
  "email": "novoemail@exemplo.com",
  "password": "NovaSenha@123"
}
```

#### DELETE /api/users/:id
Deleta um usuário (requer autenticação)

## 🔐 Autenticação

### Formato do Token
```
Authorization: Bearer <seu_jwt_token>
```

### Estrutura da Resposta de Login
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "data": {
    "user": {
      "id": "uuid",
      "email": "usuario@exemplo.com",
      "name": "Nome do Usuário"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer"
  }
}
```

## 🛡️ Segurança

- Senhas criptografadas com bcrypt (12 rounds)
- Tokens JWT com expiração configurável
- Validação rigorosa de entrada com Joi
- Headers de segurança com Helmet
- CORS configurado
- Tratamento adequado de erros

## ✅ Validações

### Senha
- Mínimo 6 caracteres
- Pelo menos 1 letra minúscula
- Pelo menos 1 letra maiúscula  
- Pelo menos 1 número

### Email
- Formato de email válido
- Único no sistema

### Nome
- Mínimo 2 caracteres
- Máximo 100 caracteres

## 📝 Middleware de Erros

O sistema possui tratamento centralizado de erros com:
- Logs detalhados para desenvolvimento
- Respostas padronizadas para o cliente
- Códigos de status HTTP apropriados

## 🔧 Arquitetura em Camadas

### Controllers
Responsáveis por receber as requisições HTTP, chamar os serviços apropriados e retornar as respostas.

### Services
Contêm a lógica de negócio da aplicação, como validações específicas e processamento de dados.

### Repositories
Responsáveis pelo acesso e manipulação dos dados (atualmente em memória, mas pode ser facilmente substituído por banco de dados).

### Middlewares
- **authMiddleware**: Verifica e valida tokens JWT
- **validationMiddleware**: Valida dados de entrada com Joi
- **errorMiddleware**: Trata erros de forma centralizada

## 🚨 Health Check

Acesse `GET /health` para verificar se o servidor está funcionando:
```json
{
  "status": "OK",
  "message": "Server is running",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

## 📌 Notas

- Este exemplo usa armazenamento em memória. Para produção, implemente um banco de dados real
- Configure adequadamente as variáveis de ambiente
- Use HTTPS em produção
- Considere implementar rate limiting
- Adicione logs estruturados para produção
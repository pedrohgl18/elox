# EloX - Guia de Desenvolvimento

## 🚀 Como Rodar o Servidor

### Desenvolvimento Local
```bash
# Método 1: Porta padrão (3000)
npm run dev

# Método 2: Porta personalizada
PORT=8080 npm run dev

# Método 3: Para produção local
npm run build && npm start
```

### ⚙️ Configuração de URLs Dinâmicas

A aplicação agora detecta automaticamente a porta e URL base:

1. **Client-side**: Usa `window.location.origin`
2. **Server-side (Vercel)**: Usa `VERCEL_URL`
3. **Server-side (Local)**: Usa `NEXTAUTH_URL` do .env.local
4. **Fallback**: `http://localhost:3000`

### 📝 Arquivos de Configuração

#### `.env.local`
```bash
# URLs dinâmicas - se adapta ao ambiente
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=elox-secret-key-development-only

# Para produção, substitua por:
# NEXTAUTH_URL=https://seu-dominio.com
# NEXTAUTH_SECRET=sua-chave-secreta-super-segura
```

#### `src/lib/config.ts`
Sistema de configuração centralizada que resolve:
- ✅ Dependência de porta específica
- ✅ URLs dinâmicas baseadas no ambiente
- ✅ Configurações diferentes para dev/prod
- ✅ Detecção automática de URL base

### 🔧 Funcionalidades Implementadas

- **URLs Adaptáveis**: Funciona em qualquer porta (3000, 3001, 8080, etc.)
- **Redirecionamento Inteligente**: Admin → `/admin/dashboard`, User → `/dashboard`
- **Proteção de Rotas**: Verifica roles automaticamente
- **Configuração Centralizada**: Uma fonte de verdade para todas as URLs

### 🎯 Credenciais de Teste

| Tipo | Email | Senha | Destino |
|------|-------|-------|---------|
| Admin | `admin@elox.dev` | `admin` | `/admin/dashboard` |
| User | `user@elox.dev` | `user` | `/dashboard` |

### 🌐 Exemplos de URLs

#### Desenvolvimento
- `http://localhost:3000/auth/login`
- `http://localhost:3001/auth/login` 
- `http://localhost:8080/auth/login`

#### Produção
- `https://elox.vercel.app/auth/login`
- `https://seu-dominio.com/auth/login`

**✨ Agora o sistema funciona em qualquer porta automaticamente!**
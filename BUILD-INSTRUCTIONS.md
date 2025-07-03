# Instruções de Build - CERRADØ INTERBOX 2025

## Configurações Disponíveis

### 1. Desenvolvimento e Produção Normal (com Middleware e Headers)
```bash
npm run dev      # Desenvolvimento
npm run build    # Build para produção normal
npm run start    # Iniciar servidor de produção
```

**Características:**
- ✅ Middleware ativo (segurança, rate limiting)
- ✅ Headers de segurança customizados
- ✅ Funcionalidades completas do Next.js
- ❌ Não compatível com Firebase Hosting

### 2. Build para Firebase Hosting (Export Estático)
```bash
npm run build:firebase
```

**Características:**
- ✅ Compatível com Firebase Hosting
- ✅ Export estático (HTML/CSS/JS)
- ❌ Sem middleware
- ❌ Sem headers customizados
- ❌ Funcionalidades limitadas do Next.js

## Quando Usar Cada Configuração

### Use `npm run build` quando:
- Deploy em VPS/Droplet
- Deploy em Vercel, Netlify, Railway
- Precisa de middleware e headers de segurança
- Precisa de funcionalidades dinâmicas do Next.js

### Use `npm run build:firebase` quando:
- Deploy no Firebase Hosting
- Precisa de arquivos estáticos
- Não precisa de middleware ou headers customizados

## Estrutura de Arquivos

- `next.config.js` - Configuração principal (sem export estático)
- `next.config.firebase.js` - Configuração para Firebase Hosting
- `middleware.ts` - Middleware de segurança (não funciona com export)

## Notas Importantes

1. **Segurança**: O middleware fornece proteção contra ataques, rate limiting e validação de User-Agent
2. **Headers**: Os headers customizados adicionam camadas extras de segurança
3. **Firebase**: Para usar Firebase Hosting, você perde essas proteções, mas ganha facilidade de deploy

## Deploy no Firebase

```bash
# 1. Build para Firebase
npm run build:firebase

# 2. Deploy
firebase deploy --only hosting
```

## Deploy Normal

```bash
# 1. Build normal
npm run build

# 2. Iniciar servidor
npm run start
``` 
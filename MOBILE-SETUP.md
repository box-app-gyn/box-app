# 📱 Configuração Mobile - CERRADØ INTERBOX

## 🚀 Início Rápido

### 1. Verificar IP Local
```bash
npm run ip
```

### 2. Iniciar Servidor
```bash
# HTTP (recomendado para testes rápidos)
npm run dev:mobile

# HTTPS (recomendado para PWA completo)
npm run dev:mobile:https
```

### 3. Acessar no Mobile

- **HTTP**: `http://192.168.1.104:3000`
- **HTTPS**: URL fornecida pelo ngrok

## 📋 Checklist de Teste PWA

### ✅ Splash Screen

- [ ] Vídeo `/videos/intro.mp4` carrega
- [ ] Loading spinner aparece
- [ ] Botão "Pular" funciona
- [ ] Logo overlay aparece

### ✅ Instalação PWA

- [ ] Toast iOS aparece (Safari)
- [ ] Banner Android aparece (Chrome)
- [ ] Instruções específicas por plataforma
- [ ] App instala na tela inicial

### ✅ Funcionalidades
- [ ] Navegação entre páginas
- [ ] Formulários funcionam
- [ ] Chat funciona
- [ ] Gamificação funciona

## 🔧 Troubleshooting

### Problema: Não acessa
```bash
# Verificar IP
npm run ip

# Verificar se servidor está rodando
curl http://localhost:3000
```

### Problema: PWA não instala
- Use HTTPS (ngrok)
- Verifique se é Safari/Chrome mobile
- Teste em modo standalone

### Problema: Vídeo não carrega
- Verifique se arquivo existe
- Tamanho pode estar muito grande
- Formato pode não ser suportado

## 📱 URLs de Teste

- **Local**: `http://localhost:3000`
- **Rede**: `http://192.168.1.104:3000`
- **HTTPS**: `https://xxxx.ngrok.io` (via ngrok)

## 🎯 Próximos Passos

1. Teste no Safari iOS
2. Teste no Chrome Android
3. Verifique instalação PWA
4. Teste funcionalidades offline
5. Verifique performance

---

**💡 Dica**: Use `npm run dev:mobile:https` para testar PWA completo com HTTPS! 
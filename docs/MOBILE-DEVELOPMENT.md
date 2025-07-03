# 🚀 Desenvolvimento Mobile - CERRADØ INTERBOX

Este guia explica como configurar o ambiente para testar o app no Safari mobile e outros dispositivos móveis.

## 📱 Configuração Rápida

### 1. Obter IP Local
```bash
npm run ip
```

### 2. Iniciar Servidor Mobile
```bash
# Opção 1: Configuração padrão
npm run dev:mobile

# Opção 2: Configuração otimizada para mobile
npm run dev:mobile:config
```

### 3. Acessar no Mobile
- Abra o Safari no iPhone/iPad
- Digite o IP mostrado no terminal (ex: `http://192.168.1.104:3000`)
- Certifique-se de que o dispositivo está na mesma rede Wi-Fi

## 🔧 Configurações Específicas

### Para Safari Mobile (iOS)
- O app detecta automaticamente se é iOS/Safari
- Mostra splash screen com vídeo
- Exibe toast de instalação PWA
- Configurações Apple específicas aplicadas

### Para Chrome Mobile (Android)
- Banner de instalação no topo
- Toast de instruções específicas
- Configurações Android aplicadas

## 🌐 Configurações de Rede

### Firewall
Se houver problemas de conexão:
- Verifique se a porta 3000 está liberada
- Desative temporariamente o firewall
- Use a mesma rede Wi-Fi

### CORS
O servidor está configurado para aceitar conexões de:
- `localhost`
- `127.0.0.1`
- `192.168.1.104` (seu IP local)
- `0.0.0.0` (qualquer IP)

## 📋 Checklist de Teste

### PWA Features
- [ ] Splash screen com vídeo aparece
- [ ] Toast de instalação iOS aparece
- [ ] Banner de instalação Android aparece
- [ ] App funciona offline (cache)
- [ ] Ícone na tela inicial
- [ ] Modo standalone funciona

### Performance
- [ ] Carregamento rápido
- [ ] Vídeo reproduz sem travamentos
- [ ] Animações suaves
- [ ] Responsividade em diferentes telas

### Funcionalidades
- [ ] Navegação entre páginas
- [ ] Formulários funcionam
- [ ] Chat funciona
- [ ] Gamificação funciona

## 🛠️ Troubleshooting

### Problema: Não consegue acessar
**Solução:**
1. Verifique se está na mesma rede Wi-Fi
2. Execute `npm run ip` para confirmar o IP
3. Tente `http://localhost:3000` no desktop primeiro

### Problema: PWA não instala
**Solução:**
1. Verifique se é HTTPS (necessário para PWA)
2. Use ngrok para tunelamento HTTPS
3. Teste em modo de desenvolvimento

### Problema: Vídeo não carrega
**Solução:**
1. Verifique se o arquivo `/videos/intro.mp4` existe
2. Tamanho do arquivo pode estar muito grande
3. Formato pode não ser suportado

## 🔗 Ferramentas Úteis

### ngrok (para HTTPS)
```bash
# Instalar ngrok
npm install -g ngrok

# Criar túnel HTTPS
ngrok http 3000
```

### Chrome DevTools
- Conecte o iPhone ao Mac
- Use Safari Web Inspector
- Debug direto no dispositivo

### React Native Debugger
- Para debugging avançado
- Inspeção de estado
- Performance profiling

## 📱 Testando PWA

### Safari iOS
1. Abra o app no Safari
2. Toque no botão compartilhar
3. Selecione "Adicionar à Tela Inicial"
4. Confirme a instalação

### Chrome Android
1. Abra o app no Chrome
2. Toque no menu (⋮)
3. Selecione "Adicionar à tela inicial"
4. Confirme a instalação

## 🎯 Dicas de Desenvolvimento

1. **Sempre teste no dispositivo real**
2. **Use o modo de desenvolvimento**
3. **Monitore o console do navegador**
4. **Teste diferentes tamanhos de tela**
5. **Verifique a performance**

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs do terminal
2. Teste em diferentes dispositivos
3. Verifique a configuração de rede
4. Consulte a documentação do Next.js 
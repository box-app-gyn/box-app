# 🛡️ Como Proteger a Branch Main

## ⚠️ Aviso do GitHub
"Your main branch isn't protected" - Vamos resolver isso!

## 🔧 Configuração no GitHub

### 1. Acesse as Configurações do Repositório
1. Vá para seu repositório no GitHub
2. Clique em **Settings** (aba superior)
3. No menu lateral, clique em **Branches**

### 2. Adicione Regra de Proteção
1. Clique em **Add rule** ou **Add branch protection rule**
2. Em **Branch name pattern**, digite: `main`
3. Configure as seguintes opções:

#### ✅ **Proteções Básicas**
- [x] **Require a pull request before merging**
  - [x] Require approvals: `1` (mínimo)
  - [x] Dismiss stale PR approvals when new commits are pushed
  - [x] Require review from code owners

#### ✅ **Proteções de Status**
- [x] **Require status checks to pass before merging**
  - [x] Require branches to be up to date before merging
  - [x] Status checks: `build` (se configurado)

#### ✅ **Proteções de Assinatura**
- [x] **Require signed commits** (opcional, mas recomendado)

#### ✅ **Proteções de Administração**
- [x] **Restrict pushes that create files that are larger than 100 MB**
- [x] **Require linear history** (opcional)

### 3. Configurações Adicionais
- [x] **Include administrators** (aplica regras até para admins)
- [x] **Allow force pushes** → **NÃO** (deixe desmarcado)
- [x] **Allow deletions** → **NÃO** (deixe desmarcado)

### 4. Salve a Configuração
- Clique em **Create** ou **Save changes**

## 🔄 Workflow Recomendado

### Para Novas Features:
```bash
# 1. Criar branch da main
git checkout main
git pull origin main
git checkout -b feature/nova-funcionalidade

# 2. Desenvolver
# ... fazer alterações ...

# 3. Commit e push
git add .
git commit -m "feat: nova funcionalidade"
git push origin feature/nova-funcionalidade

# 4. Criar Pull Request no GitHub
# 5. Aguardar review e aprovação
# 6. Merge via GitHub (não force push!)
```

### Para Hotfixes:
```bash
# 1. Criar branch de hotfix
git checkout main
git pull origin main
git checkout -b hotfix/correcao-urgente

# 2. Corrigir
# ... fazer correções ...

# 3. Commit e push
git add .
git commit -m "fix: correção urgente"
git push origin hotfix/correcao-urgente

# 4. Criar Pull Request
# 5. Merge após aprovação
```

## 🚨 O que Acontece Agora

### ✅ **Protegido:**
- Ninguém pode fazer push direto na main
- Ninguém pode fazer force push
- Ninguém pode deletar a branch
- PRs precisam de aprovação
- Status checks devem passar

### ❌ **Bloqueado:**
- Push direto na main
- Force push
- Deletar branch main
- Merge sem aprovação
- Merge com status checks falhando

## 🔍 Verificar Configuração

### No GitHub:
1. Vá para **Settings > Branches**
2. Deve aparecer uma regra para `main`
3. Status deve mostrar "Protected"

### Teste de Segurança:
```bash
# Isso deve falhar:
git push origin main

# Erro esperado:
# remote: error: GH006: Protected branch update failed for refs/heads/main.
# remote: error: Required status check "build" is expected.
```

## 🎯 Benefícios

1. **Segurança** → Ninguém quebra a main acidentalmente
2. **Qualidade** → Code review obrigatório
3. **Histórico** → Linear e limpo
4. **CI/CD** → Status checks garantem qualidade
5. **Colaboração** → Processo estruturado

## 🚀 Próximos Passos

1. Configure a proteção da main
2. Teste criando uma PR
3. Configure status checks (GitHub Actions)
4. Configure code owners (opcional)
5. Treine o time no novo workflow

## 📚 Recursos Adicionais

- [GitHub Branch Protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches)
- [Code Owners](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)
- [Status Checks](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/about-status-checks) 
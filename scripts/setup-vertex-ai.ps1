# 🚀 Script de Setup Automatizado - Vertex AI para CERRADØ INTERBOX (PowerShell)
# Este script automatiza a configuração do Vertex AI seguindo o guia VERTEX-AI-SETUP.md

param(
    [string]$ProjectId = "interbox-app-8d400",
    [string]$ProjectName = "CERRADO INTERBOX",
    [string]$SaName = "vertex-ai-sa",
    [string]$Location = "us-central1"
)

# Configurações
$SaDisplayName = "Vertex AI Service Account"
$KeyFile = "vertex-ai-key.json"
$EnvFile = ".env.local"
$ProdConfig = "vertex-ai-config.json"

# Função para log colorido
function Write-Log {
    param([string]$Message, [string]$Type = "INFO")
    $timestamp = Get-Date -Format "HH:mm:ss"
    switch ($Type) {
        "INFO" { Write-Host "[$timestamp] [INFO] $Message" -ForegroundColor Green }
        "WARN" { Write-Host "[$timestamp] [WARN] $Message" -ForegroundColor Yellow }
        "ERROR" { Write-Host "[$timestamp] [ERROR] $Message" -ForegroundColor Red }
        "STEP" { Write-Host "[$timestamp] [STEP] $Message" -ForegroundColor Blue }
    }
}

Write-Host "🤖 =========================================" -ForegroundColor Cyan
Write-Host "   SETUP AUTOMATIZADO - VERTEX AI" -ForegroundColor Cyan
Write-Host "   CERRADØ INTERBOX 2025" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# Verificar se gcloud está instalado
Write-Log "Verificando Google Cloud CLI..." "STEP"
try {
    $gcloudVersion = gcloud version --format="value(basic.version)" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Log "✅ Google Cloud CLI encontrado (v$gcloudVersion)"
    } else {
        throw "gcloud não encontrado"
    }
} catch {
    Write-Log "Google Cloud CLI não está instalado!" "ERROR"
    Write-Host "Instale em: https://cloud.google.com/sdk/docs/install" -ForegroundColor Yellow
    exit 1
}

# Verificar se está logado
Write-Log "Verificando autenticação..." "STEP"
$activeAccount = gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>$null
if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrEmpty($activeAccount)) {
    Write-Log "Você não está logado no Google Cloud" "WARN"
    Write-Log "Fazendo login..."
    gcloud auth login
} else {
    Write-Log "✅ Já está logado no Google Cloud ($activeAccount)"
}

# Criar projeto se não existir
Write-Log "Verificando projeto..." "STEP"
try {
    $projectExists = gcloud projects describe $ProjectId --format="value(projectId)" 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Log "Criando projeto $ProjectId..."
        gcloud projects create $ProjectId --name="$ProjectName"
        Write-Log "✅ Projeto criado"
    } else {
        Write-Log "✅ Projeto já existe"
    }
} catch {
    Write-Log "Erro ao verificar/criar projeto" "ERROR"
    exit 1
}

# Definir projeto como padrão
Write-Log "Configurando projeto padrão..." "STEP"
gcloud config set project $ProjectId
Write-Log "✅ Projeto $ProjectId definido como padrão"

# Habilitar APIs necessárias
Write-Log "Habilitando APIs..." "STEP"
$apis = @(
    "aiplatform.googleapis.com",
    "cloudfunctions.googleapis.com",
    "cloudbuild.googleapis.com"
)

foreach ($api in $apis) {
    Write-Log "Habilitando $api..."
    gcloud services enable $api
}

Write-Log "✅ APIs habilitadas"

# Verificar billing
Write-Log "Verificando billing..." "STEP"
$billingEnabled = gcloud billing projects describe $ProjectId --format="value(billingEnabled)" 2>$null
if ($LASTEXITCODE -ne 0 -or $billingEnabled -ne "True") {
    Write-Log "Billing não está habilitado para o projeto!" "WARN"
    Write-Host "Habilite o billing em: https://console.cloud.google.com/billing/projects/$ProjectId" -ForegroundColor Yellow
    Write-Host "Ou execute: gcloud billing projects link $ProjectId --billing-account=YOUR_BILLING_ACCOUNT" -ForegroundColor Yellow
    Read-Host "Pressione Enter após habilitar o billing"
} else {
    Write-Log "✅ Billing habilitado"
}

# Criar service account
Write-Log "Criando Service Account..." "STEP"
$saEmail = "$SaName@$ProjectId.iam.gserviceaccount.com"

try {
    $saExists = gcloud iam service-accounts describe $saEmail --format="value(email)" 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Log "Criando service account $SaName..."
        gcloud iam service-accounts create $SaName --display-name="$SaDisplayName"
        Write-Log "✅ Service account criado"
    } else {
        Write-Log "✅ Service account já existe"
    }
} catch {
    Write-Log "Erro ao criar service account" "ERROR"
    exit 1
}

# Conceder permissões
Write-Log "Concedendo permissões..." "STEP"
$roles = @(
    "roles/aiplatform.user",
    "roles/aiplatform.developer",
    "roles/cloudfunctions.developer"
)

foreach ($role in $roles) {
    Write-Log "Adicionando permissão $role..."
    gcloud projects add-iam-policy-binding $ProjectId --member="serviceAccount:$saEmail" --role=$role
}

Write-Log "✅ Permissões concedidas"

# Criar chave JSON
Write-Log "Criando chave de autenticação..." "STEP"
if (Test-Path $KeyFile) {
    Write-Log "Arquivo $KeyFile já existe. Fazendo backup..." "WARN"
    $backupName = "$KeyFile.backup.$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    Move-Item $KeyFile $backupName
}

Write-Log "Criando nova chave JSON..."
gcloud iam service-accounts keys create $KeyFile --iam-account=$saEmail
Write-Log "✅ Chave JSON criada: $KeyFile"

# Configurar variáveis de ambiente
Write-Log "Configurando variáveis de ambiente..." "STEP"
if (-not (Test-Path $EnvFile)) {
    Write-Log "Criando arquivo $EnvFile..."
    New-Item -ItemType File -Name $EnvFile | Out-Null
}

# Verificar se já existe
$envContent = Get-Content $EnvFile -ErrorAction SilentlyContinue
if ($envContent -notmatch "GOOGLE_CLOUD_PROJECT_ID") {
    Add-Content $EnvFile ""
    Add-Content $EnvFile "# Vertex AI (Google Cloud)"
    Add-Content $EnvFile "GOOGLE_CLOUD_PROJECT_ID=$ProjectId"
    Add-Content $EnvFile "GOOGLE_APPLICATION_CREDENTIALS=./$KeyFile"
    Write-Log "✅ Configurações adicionadas ao $EnvFile"
} else {
    Write-Log "✅ Configurações já existem no $EnvFile"
}

# Testar configuração
Write-Log "Testando configuração..." "STEP"
Write-Log "Testando autenticação da service account..."
gcloud auth activate-service-account --key-file=$KeyFile

Write-Log "Verificando APIs habilitadas..."
gcloud services list --enabled --filter="name:aiplatform.googleapis.com"
Write-Log "✅ Configuração testada com sucesso"

# Instalar dependências se necessário
Write-Log "Verificando dependências..." "STEP"
if (Test-Path "package.json") {
    Write-Log "Instalando dependência @google-cloud/vertexai..."
    npm install @google-cloud/vertexai
    Write-Log "✅ Dependência instalada"
}

# Configurar Firebase Functions (se existir)
if (Test-Path "functions") {
    Write-Log "Configurando Firebase Functions..." "STEP"
    Push-Location functions
    
    if (Test-Path "package.json") {
        Write-Log "Instalando dependência nas functions..."
        npm install @google-cloud/vertexai
    }
    
    Pop-Location
    
    Write-Log "Configurando variáveis do Firebase..."
    firebase functions:config:set vertexai.project_id="$ProjectId"
    Write-Log "✅ Firebase Functions configurado"
}

# Criar arquivo de configuração para produção
Write-Log "Criando configuração para produção..." "STEP"
$configJson = @{
    project_id = $ProjectId
    location = $Location
    service_account_email = $saEmail
    key_file = $KeyFile
    apis_enabled = $apis
    setup_date = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
    status = "ready"
} | ConvertTo-Json -Depth 3

$configJson | Out-File -FilePath $ProdConfig -Encoding UTF8
Write-Log "✅ Configuração salva em $ProdConfig"

# Resumo final
Write-Host ""
Write-Host "🎉 =========================================" -ForegroundColor Green
Write-Host "   SETUP CONCLUÍDO COM SUCESSO!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Resumo da configuração:" -ForegroundColor White
Write-Host "   • Projeto: $ProjectId" -ForegroundColor Gray
Write-Host "   • Service Account: $saEmail" -ForegroundColor Gray
Write-Host "   • Chave JSON: $KeyFile" -ForegroundColor Gray
Write-Host "   • Localização: $Location" -ForegroundColor Gray
Write-Host ""
Write-Host "🔧 Próximos passos:" -ForegroundColor White
Write-Host "   1. Teste localmente: npm run dev" -ForegroundColor Gray
Write-Host "   2. Verifique se o chat funciona" -ForegroundColor Gray
Write-Host "   3. Deploy: npm run build:firebase && firebase deploy" -ForegroundColor Gray
Write-Host ""
Write-Host "📊 Monitoramento:" -ForegroundColor White
Write-Host "   • Console: https://console.cloud.google.com/vertex-ai" -ForegroundColor Gray
Write-Host "   • Logs: gcloud logging read 'resource.type=aiplatform.googleapis.com/Model'" -ForegroundColor Gray
Write-Host ""
Write-Host "💰 Custos estimados:" -ForegroundColor White
Write-Host "   • ~$0.001-0.005 por conversa" -ForegroundColor Gray
Write-Host "   • Monitoramento recomendado" -ForegroundColor Gray
Write-Host ""
Write-Host "📚 Documentação:" -ForegroundColor White
Write-Host "   • docs/VERTEX-AI-SETUP.md" -ForegroundColor Gray
Write-Host "   • docs/VERTEX-AI-IMPROVEMENTS.md" -ForegroundColor Gray
Write-Host ""

# Verificar se tudo está funcionando
Write-Log "Verificação final..." "STEP"
if ((Test-Path $KeyFile) -and (Test-Path $EnvFile) -and (Test-Path $ProdConfig)) {
    Write-Log "✅ Todos os arquivos de configuração foram criados"
    Write-Log "✅ Setup completo! O Vertex AI está pronto para uso."
} else {
    Write-Log "❌ Alguns arquivos de configuração estão faltando" "ERROR"
    exit 1
}

Write-Host ""
Write-Host "🚀 Para testar, execute: npm run dev" -ForegroundColor Cyan
Write-Host "🤖 O chat estará disponível apenas em produção (NODE_ENV=production)" -ForegroundColor Yellow 
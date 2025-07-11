# Makefile para Cerrado App
.PHONY: help build clean deploy dev mobile firebase

# Variáveis
APP_NAME = cerrado-app
NODE_ENV = production

# Comandos principais
help: ## Mostra esta ajuda
	@echo "Comandos disponíveis:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

build: ## Faz o build de produção
	@echo "🔨 Fazendo build de produção..."
	npm run build
	@echo "✅ Build concluído!"

clean: ## Limpa caches e arquivos temporários
	@echo "🧹 Limpando caches..."
	rm -rf .next
	rm -rf out
	rm -rf node_modules/.cache
	rm -rf .turbo
	find . -name "._*" -delete
	find . -name ".DS_Store" -delete
	@echo "✅ Limpeza concluída!"

dev: ## Inicia servidor de desenvolvimento
	@echo "🚀 Iniciando servidor de desenvolvimento..."
	npm run dev

mobile: ## Inicia servidor para desenvolvimento mobile
	@echo "📱 Iniciando servidor mobile..."
	npm run dev:mobile

firebase: ## Deploy para Firebase
	@echo "🔥 Fazendo deploy para Firebase..."
	npm run build
	firebase deploy

deploy: build ## Deploy completo (build + deploy)
	@echo "🚀 Deploy completo iniciado..."
	@echo "✅ Deploy concluído!"

# Comandos de deploy específicos
deploy-hosting: build ## Deploy apenas do hosting
	@echo "🌐 Fazendo deploy do hosting..."
	firebase deploy --only hosting
	@echo "✅ Deploy do hosting concluído!"

deploy-functions: ## Deploy apenas das functions
	@echo "⚙️ Fazendo deploy das functions..."
	cd functions && npm run build
	firebase deploy --only functions
	@echo "✅ Deploy das functions concluído!"

deploy-firestore: ## Deploy apenas das regras do Firestore
	@echo "📊 Fazendo deploy das regras do Firestore..."
	firebase deploy --only firestore:rules
	@echo "✅ Deploy do Firestore concluído!"

deploy-storage: ## Deploy apenas das regras de storage
	@echo "💾 Fazendo deploy das regras de storage..."
	firebase deploy --only storage
	@echo "✅ Deploy do storage concluído!"

# Comandos de manutenção
install: ## Instala dependências
	@echo "📦 Instalando dependências..."
	npm install

update: ## Atualiza dependências
	@echo "🔄 Atualizando dependências..."
	npm update

lint: ## Executa linting
	@echo "🔍 Executando linting..."
	npm run lint

test: ## Executa testes
	@echo "🧪 Executando testes..."
	npm test

# Comandos de backup
backup: ## Cria backup do projeto
	@echo "💾 Criando backup..."
	tar -czf backup-$(shell date +%Y%m%d-%H%M%S).tar.gz --exclude=node_modules --exclude=.next --exclude=.git .

# Comandos de produção
start: ## Inicia servidor de produção
	@echo "🏁 Iniciando servidor de produção..."
	npm start

export: ## Exporta para arquivos estáticos
	@echo "📤 Exportando para arquivos estáticos..."
	npm run export

# Comandos de desenvolvimento
dev-clean: clean dev ## Limpa e inicia desenvolvimento
	@echo "🧹 Desenvolvimento limpo iniciado!"

build-clean: clean build ## Limpa e faz build
	@echo "🧹 Build limpo concluído!"

# Comandos de monitoramento
monitor: ## Monitora mudanças nos arquivos
	@echo "👀 Monitorando mudanças..."
	node change-monitor.js

# Comandos de segurança
security: ## Executa verificações de segurança
	@echo "🔒 Verificando segurança..."
	node security-checks.js

# Comandos de PWA
pwa-build: ## Build específico para PWA
	@echo "📱 Fazendo build PWA..."
	npm run pwa:build

pwa-test: ## Testa PWA
	@echo "🧪 Testando PWA..."
	npm run pwa:test

# Comandos de gamificação
gamification: ## Importa dados de gamificação
	@echo "🎮 Importando gamificação..."
	node scripts/import-gamification.js

# Comandos de Firebase
firebase-init: ## Inicializa Firebase
	@echo "🔥 Inicializando Firebase..."
	firebase init

firebase-serve: ## Serve localmente Firebase
	@echo "🔥 Servindo Firebase localmente..."
	firebase serve

# Comandos de desenvolvimento rápido
quick: clean build ## Build rápido limpo
	@echo "⚡ Build rápido concluído!"

all: clean install build ## Limpa, instala e faz build completo
	@echo "🎯 Processo completo concluído!" 
.PHONY: help clean install build deploy

help: ## Mostra esta ajuda
	@echo "Comandos disponíveis:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

clean: ## Limpa caches e arquivos temporários
	@echo "🧹 Limpando caches..."
	rm -rf dist
	rm -rf build
	rm -rf node_modules/.cache
	rm -rf .firebase
	rm -rf coverage
	rm -rf .nyc_output
	find . -name "._*" -delete
	find . -name ".DS_Store" -delete
	find . -name "*.log" -delete
	find . -name "*.tsbuildinfo" -delete
	@echo "✅ Limpeza concluída!"

install: ## Instala dependências
	@echo "📦 Instalando dependências..."
	npm install

build: ## Faz build do projeto
	@echo "🔨 Fazendo build..."
	npm run build

deploy: ## Deploy das functions
	@echo "☁️  Fazendo deploy..."
	npm run deploy:functions

dev: ## Executa em modo desenvolvimento
	@echo "🚀 Iniciando desenvolvimento..."
	npm run dev 
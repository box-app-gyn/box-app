# Criar script de limpeza
cat > scripts/cleanup-macos.sh << 'EOF'
#!/bin/bash
echo "🧹 Limpando arquivos do macOS..."

# Remover arquivos ._ 
find . -name "._*" -delete

# Remover .DS_Store
find . -name ".DS_Store" -delete

# Remover arquivos de cache
find . -name "*.tmp" -delete

echo "✅ Limpeza concluída!"
EOF

# Tornar executável
chmod +x scripts/cleanup-macos.sh

# Executar
./scripts/cleanup-macos.sh
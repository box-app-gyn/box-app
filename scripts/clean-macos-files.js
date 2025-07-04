#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function cleanMacOSFiles() {
  console.log('🧹 Limpando arquivos ocultos do macOS...');
  
  try {
    // Remover arquivos ._* em todo o projeto
    const findCommand = 'find . -name "._*" -delete';
    execSync(findCommand, { stdio: 'inherit' });
    
    // Remover .DS_Store
    const dsStoreCommand = 'find . -name ".DS_Store" -delete';
    execSync(dsStoreCommand, { stdio: 'inherit' });
    
    // Remover outros arquivos ocultos
    const otherHiddenCommand = 'find . -name ".Spotlight-V100" -o -name ".Trashes" -o -name "ehthumbs.db" -o -name "Thumbs.db" | xargs rm -rf 2>/dev/null || true';
    execSync(otherHiddenCommand, { stdio: 'inherit' });
    
    console.log('✅ Arquivos ocultos removidos com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao limpar arquivos:', error.message);
  }
}

function preventMacOSFiles() {
  console.log('🛡️ Configurando proteção contra arquivos macOS...');
  
  try {
    // Criar arquivo .gitattributes para configurar comportamento
    const gitattributesContent = `# Configurações para evitar arquivos macOS
* text=auto eol=lf
*.{cmd,[cC][mM][dD]} text eol=crlf
*.{bat,[bB][aA][tT]} text eol=crlf

# Ignorar metadados do macOS
*/.DS_Store binary
*/.AppleDouble binary
*/LSOverride binary
`;
    
    fs.writeFileSync('.gitattributes', gitattributesContent);
    console.log('✅ Arquivo .gitattributes criado');
    
  } catch (error) {
    console.error('❌ Erro ao criar .gitattributes:', error.message);
  }
}

// Verificar argumentos
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'clean':
    cleanMacOSFiles();
    break;
    
  case 'prevent':
    preventMacOSFiles();
    break;
    
  case 'all':
    cleanMacOSFiles();
    preventMacOSFiles();
    break;
    
  default:
    console.log('🛠️ Script para gerenciar arquivos macOS');
    console.log('\n📖 Uso:');
    console.log('   node scripts/clean-macos-files.js clean    # Limpar arquivos existentes');
    console.log('   node scripts/clean-macos-files.js prevent  # Configurar proteção');
    console.log('   node scripts/clean-macos-files.js all      # Limpar + configurar');
} 
#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('🧹 Iniciando limpeza do projeto...\n');

// Função para remover arquivo/diretório
function removeFileOrDir(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      if (fs.lstatSync(filePath).isDirectory()) {
        fs.rmSync(filePath, { recursive: true, force: true });
        console.log(`✅ Removido diretório: ${filePath}`);
      } else {
        fs.unlinkSync(filePath);
        console.log(`✅ Removido arquivo: ${filePath}`);
      }
    }
  } catch (error) {
    console.log(`⚠️  Erro ao remover ${filePath}: ${error.message}`);
  }
}

// Função para encontrar arquivos por padrão
function findFilesByPattern(dir, pattern) {
  const files = [];
  
  function scan(currentDir) {
    try {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scan(fullPath);
        } else if (pattern.test(item)) {
          files.push(fullPath);
        }
      }
    } catch {
    }
  }
  scan(dir);
  return files;
}

// Lista de arquivos e diretórios para remover
const filesToRemove = [
  // Logs do Firebase
  'firebase-debug.log',
  'firebase-debug 2.log',
  'firebase-debug 3.log',
  'firebase-debug 4.log',
  'firebase-debug 5.log',
  'firebase-debug-*.log',
  
  // Logs do PGLite
  'pglite-debug.log',
  
  // Arquivos temporários do macOS
  '.DS_Store',
  '._*',
  
  // Arquivos de backup
  'middleware.ts.bak',
  
  // Arquivos de teste
  'test-*.js',
  'test-*.html',
  'test-*.ts',
  'test-*.tsx',
  
  // Build outputs
  '.next',
  'out',
  'build',
  'dist',
  
  // Cache directories
  '.cache',
  '.temp',
  '.tmp',
  
  // Firebase cache
  '.firebase',
  
  // Node modules (opcional)
  // 'node_modules',
  
  // Package lock files (opcional)
  // 'package-lock.json',
];

// Lista de diretórios para limpar
const dirsToRemove = [
  '.next',
  'out',
  'build',
  'dist',
  '.cache',
  '.temp',
  '.tmp',
  '.firebase',
];

// Lista de padrões de arquivos para remover
const patternsToRemove = [
  /^\.DS_Store$/,
  /^\._/,
  /^firebase-debug.*\.log$/,
  /^pglite-debug.*\.log$/,
  /^test-.*\.(js|html|ts|tsx)$/,
  /.*\.bak$/,
  /.*\.tmp$/,
  /.*\.temp$/,
  /.*\.log$/,
  /.*\.map$/,
];

console.log('📁 Removendo arquivos específicos...');
filesToRemove.forEach(file => {
  if (file.includes('*')) {
    // Padrão com wildcard
    const pattern = new RegExp(file.replace(/\*/g, '.*'));
    const matchingFiles = findFilesByPattern('.', pattern);
    matchingFiles.forEach(f => removeFileOrDir(f));
  } else {
    removeFileOrDir(file);
  }
});

console.log('\n📂 Removendo diretórios...');
dirsToRemove.forEach(dir => {
  removeFileOrDir(dir);
});

console.log('\n🔍 Procurando arquivos por padrões...');
patternsToRemove.forEach(pattern => {
  const files = findFilesByPattern('.', pattern);
  files.forEach(file => {
    // Não remover arquivos importantes
    if (!file.includes('node_modules') && 
        !file.includes('.git') && 
        !file.includes('package.json') &&
        !file.includes('README.md') &&
        !file.includes('tsconfig.json') &&
        !file.includes('next.config.js') &&
        !file.includes('firebase.json') &&
        !file.includes('firestore.rules') &&
        !file.includes('storage.rules')) {
      removeFileOrDir(file);
    }
  });
});

console.log('\n🧹 Limpando cache do npm...');
try {
  execSync('npm cache clean --force', { stdio: 'inherit' });
  console.log('✅ Cache do npm limpo');
} catch (error) {
  console.log('⚠️  Erro ao limpar cache do npm:', error.message);
}

console.log('\n🧹 Limpando cache do Next.js...');
try {
  execSync('npx next clean', { stdio: 'inherit' });
  console.log('✅ Cache do Next.js limpo');
} catch (error) {
  console.log('⚠️  Erro ao limpar cache do Next.js:', error.message);
}

console.log('\n🧹 Limpando cache do Firebase...');
try {
  execSync('firebase use --clear', { stdio: 'inherit' });
  console.log('✅ Cache do Firebase limpo');
} catch (error) {
  console.log('⚠️  Erro ao limpar cache do Firebase:', error.message);
}

// Verificar tamanho do projeto
console.log('\n📊 Verificando tamanho do projeto...');
try {
  const result = execSync('du -sh .', { encoding: 'utf8' });
  console.log(`📁 Tamanho atual do projeto: ${result.trim()}`);
} catch (error) {
  console.log('⚠️  Erro ao verificar tamanho do projeto:', error.message);
}

console.log('\n🎉 Limpeza concluída!');
console.log('\n💡 Dicas:');
console.log('   - Execute "npm install" se precisar reinstalar dependências');
console.log('   - Execute "firebase login" se precisar fazer login novamente');
console.log('   - Execute "npm run dev" para testar se tudo está funcionando'); 
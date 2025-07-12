const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Verificar se o arquivo de credenciais existe
const credentialsPath = path.join(__dirname, 'firebase-admin-key.json');

if (!fs.existsSync(credentialsPath)) {
  console.log('❌ Arquivo de credenciais não encontrado!');
  console.log('📋 Para obter as credenciais:');
  console.log('1. Acesse: https://console.firebase.google.com/project/interbox-app-8d400/settings/serviceaccounts/adminsdk');
  console.log('2. Clique em "Gerar nova chave privada"');
  console.log('3. Baixe o arquivo JSON');
  console.log('4. Renomeie para "firebase-admin-key.json"');
  console.log('5. Coloque o arquivo na pasta scripts/');
  process.exit(1);
}

// Carregar credenciais do arquivo JSON
const serviceAccount = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://cerrado-interbox-default-rtdb.firebaseio.com"
  });
}

const db = admin.firestore();

// 🏆 CATEGORIAS DE COMPETIÇÃO ATUALIZADAS
const categoriasCompeticao = {
  INICIANTE: {
    value: 'Iniciante',
    label: 'Iniciante',
    description: '0-1 ano de CrossFit',
    icon: '🏃‍♂️',
    color: '#6B7280',
    minExperience: 0,
    maxExperience: 1,
    isActive: true
  },
  SCALE: {
    value: 'Scale',
    label: 'Scale',
    description: '1-2 anos de CrossFit',
    icon: '⚡',
    color: '#10B981',
    minExperience: 1,
    maxExperience: 2,
    isActive: true
  },
  AMADOR: {
    value: 'Amador',
    label: 'Amador',
    description: '2-3 anos de CrossFit',
    icon: '🏆',
    color: '#F59E0B',
    minExperience: 2,
    maxExperience: 3,
    isActive: true
  },
  MASTER_145: {
    value: 'Master 145+',
    label: 'Master 145+',
    description: 'Atletas 45+ anos',
    icon: '👑',
    color: '#8B5CF6',
    minAge: 45,
    isActive: true
  },
  RX: {
    value: 'RX',
    label: 'RX',
    description: '3+ anos de CrossFit',
    icon: '🔥',
    color: '#EF4444',
    minExperience: 3,
    isActive: true
  }
};

// 👥 TIPOS DE USUÁRIO
const tiposUsuario = {
  ATLETA: {
    value: 'atleta',
    label: 'Atleta',
    description: 'Participante da competição',
    icon: '🏃‍♂️',
    color: '#10B981',
    canCreateTeam: true,
    canJoinTeam: true,
    isActive: true
  },
  JUDGE: {
    value: 'judge',
    label: 'Judge',
    description: 'Juiz da competição',
    icon: '⚖️',
    color: '#F59E0B',
    canCreateTeam: false,
    canJoinTeam: false,
    isActive: true
  },
  ESPECTADOR: {
    value: 'espectador',
    label: 'Espectador',
    description: 'Acompanhante do evento',
    icon: '👥',
    color: '#6B7280',
    canCreateTeam: false,
    canJoinTeam: false,
    isActive: true
  },
  MIDIA: {
    value: 'midia',
    label: 'Mídia',
    description: 'Profissional de comunicação',
    icon: '📸',
    color: '#8B5CF6',
    canCreateTeam: false,
    canJoinTeam: false,
    isActive: true
  }
};

async function updateCategories() {
  console.log('🏆 Atualizando categorias de competição no Firebase...');

  try {
    // 1. Criar/atualizar configuração de categorias
    console.log('📋 Criando configuração de categorias...');
    await db.collection('config').doc('categorias_competicao').set({
      categorias: categoriasCompeticao,
      tiposUsuario: tiposUsuario,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      version: '2.0'
    });
    console.log('✅ Configuração de categorias criada!');

    // 2. Criar/atualizar configuração de tipos de usuário
    console.log('👥 Criando configuração de tipos de usuário...');
    await db.collection('config').doc('tipos_usuario').set({
      tipos: tiposUsuario,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      version: '2.0'
    });
    console.log('✅ Configuração de tipos de usuário criada!');

    // 3. Atualizar estatísticas de times por categoria
    console.log('📊 Atualizando estatísticas de times...');
    const statsData = {
      timesPorCategoria: {
        'Iniciante': 0,
        'Scale': 0,
        'Amador': 0,
        'Master 145+': 0,
        'RX': 0
      },
      atletasPorCategoria: {
        'Iniciante': 0,
        'Scale': 0,
        'Amador': 0,
        'Master 145+': 0,
        'RX': 0
      },
      receitaPorCategoria: {
        'Iniciante': 0,
        'Scale': 0,
        'Amador': 0,
        'Master 145+': 0,
        'RX': 0
      },
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('config').doc('dashboard_stats').set(statsData, { merge: true });
    console.log('✅ Estatísticas de times atualizadas!');

    // 4. Verificar se há times existentes que precisam ser migrados
    console.log('🔄 Verificando times existentes...');
    const teamsSnapshot = await db.collection('teams').get();
    let teamsToUpdate = 0;

    teamsSnapshot.forEach(doc => {
      const teamData = doc.data();
      if (teamData.categoria && !categoriasCompeticao[teamData.categoria.toUpperCase()]) {
        teamsToUpdate++;
        console.log(`⚠️  Time ${teamData.nome} tem categoria inválida: ${teamData.categoria}`);
      }
    });

    if (teamsToUpdate > 0) {
      console.log(`⚠️  ${teamsToUpdate} times precisam ter suas categorias atualizadas manualmente`);
    } else {
      console.log('✅ Todos os times têm categorias válidas!');
    }

    // 5. Criar documento de configuração geral
    console.log('⚙️ Criando configuração geral...');
    const generalConfig = {
      eventInfo: {
        name: 'CERRADØ INTERBOX 2025',
        date: '2025-07-13',
        location: 'Goiânia, GO',
        maxTeams: 120,
        teamSize: 4,
        categories: Object.keys(categoriasCompeticao),
        userTypes: Object.keys(tiposUsuario)
      },
      registration: {
        isOpen: false,
        expectedOpenDate: '2025-01-15',
        lotes: ['pre_venda', 'primeiro', 'segundo', 'terceiro', 'quarto', 'quinto']
      },
      gamification: {
        enabled: true,
        currency: '$BOX',
        levels: ['iniciante', 'bronze', 'prata', 'ouro', 'platina', 'diamante']
      },
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      version: '2.0'
    };

    await db.collection('config').doc('general').set(generalConfig);
    console.log('✅ Configuração geral criada!');

    // 6. Resumo final
    console.log('\n🎯 RESUMO DA ATUALIZAÇÃO:');
    console.log(`✅ ${Object.keys(categoriasCompeticao).length} categorias de competição configuradas`);
    console.log(`✅ ${Object.keys(tiposUsuario).length} tipos de usuário configurados`);
    console.log('✅ Estatísticas de times atualizadas');
    console.log('✅ Configuração geral criada');
    
    if (teamsToUpdate > 0) {
      console.log(`⚠️  ${teamsToUpdate} times precisam de atualização manual`);
    }

    console.log('\n📋 CATEGORIAS DISPONÍVEIS:');
    Object.values(categoriasCompeticao).forEach(cat => {
      console.log(`  ${cat.icon} ${cat.label} - ${cat.description}`);
    });

    console.log('\n👥 TIPOS DE USUÁRIO:');
    Object.values(tiposUsuario).forEach(tipo => {
      console.log(`  ${tipo.icon} ${tipo.label} - ${tipo.description}`);
    });

    console.log('\n✅ Atualização concluída com sucesso!');

  } catch (error) {
    console.error('❌ Erro durante atualização:', error);
  } finally {
    process.exit(0);
  }
}

// Executar atualização
updateCategories(); 
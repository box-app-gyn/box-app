// SCRIPT PARA CORRIGIR DADOS DO FIRESTORE
// Execute este código no console do Firebase (Firestore > Regras > Console)

console.log('Iniciando correção dos dados do Firestore...');

// Função para corrigir dados do Firestore
async function corrigirDadosFirestore() {
  try {
    // 1. CORRIGIR CONFIGURAÇÃO DO SISTEMA
    console.log('\nCorrigindo configuração do sistema...');
    const sistemaRef = db.collection('sistema').doc('SiY3O8vl33cpuM21LQLx');
    await sistemaRef.update({
      loteAtual: 'lote1', // Corrigir de string multivalorada para string única
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    console.log('Configuração do sistema corrigida');

    // 2. CORRIGIR DOCUMENTO DE TIME
    console.log('\nCorrigindo documento de time...');
    const teamRef = db.collection('teams').doc('uVFR1oL5NsX2MeIGbstt');
    await teamRef.update({
      categoria: 'Iniciante', // Corrigir de string multivalorada para string única
      lote: 'lote1', // Corrigir de string multivalorada para string única
      status: 'pending', // Corrigir de string multivalorada para string única
      statusPagamento: 'pending', // Corrigir de string multivalorada para string única
      atletas: [], // Corrigir de string para array vazio (será preenchido depois)
      quantidade: 4, // Garantir que seja number
      valorTotal: 394.95, // Garantir que seja number
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    console.log('Documento de time corrigido');

    // 3. CORRIGIR DOCUMENTO DE ATLETA
    console.log('\nCorrigindo documento de atleta...');
    const atletaRef = db.collection('atletas').doc('0vDKF7Y7rxrnDMYbk6gq');
    await atletaRef.update({
      categoria: 'Iniciante', // Corrigir de string multivalorada para string única
      status: 'pending', // Corrigir de string multivalorada para string única
      genero: 'masculino', // Corrigir de string multivalorada para string única
      camiseta: 'masc', // Corrigir de string multivalorada para string única
      tamanho: 'M', // Corrigir de string multivalorada para string única
      idade: 28, // Corrigir de string para number
      resultados: [], // Corrigir de string para array vazio
      // Remover campo user_id_1 que está incorreto
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    console.log('Documento de atleta corrigido');

    // 4. CORRIGIR ESTRUTURA DE ESTATÍSTICAS
    console.log('\nCorrigindo estrutura de estatísticas...');
    const estatisticasRef = db.collection('estatisticas').doc('lotes');
    await estatisticasRef.update({
      estatisticasPorCategoria: {
        'RX': { times: 0, atletas: 0 },
        'Scaled': { times: 0, atletas: 0 },
        'Master 145+': { times: 0, atletas: 0 },
        'Amador': { times: 0, atletas: 0 },
        'Scale': { times: 0, atletas: 0 },
        'Iniciante': { times: 0, atletas: 0 }
      },
      estatisticasPorLote: {
        'lote1': { times: 0, valor: 0, kitEspecial: 0 },
        'lote2': { times: 0, valor: 0 },
        'lote3': { times: 0, valor: 0 }
      },
      estatisticasPorEstado: {},
      timesRX: 0, // Corrigir de boolean para number
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    console.log('Estrutura de estatísticas corrigida');

    // 5. CRIAR DOCUMENTO DE LOTE 2 E 3
    console.log('\nCriando documentos de lotes 2 e 3...');
    
    // Lote 2
    await db.collection('lotes').doc('lote2').set({
      id: 'lote2',
      nome: 'Lote 2',
      ativo: false,
      dataInicio: firebase.firestore.Timestamp.fromDate(new Date('2025-07-25')),
      dataFim: firebase.firestore.Timestamp.fromDate(new Date('2025-08-16')),
      limiteTimes: 180, // Total geral
      valores: {
        'RX': 49495,
        'Master 145+': 39495,
        'Amador': 39495,
        'Scale': 39495,
        'Iniciante': 39495
      },
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    // Lote 3
    await db.collection('lotes').doc('lote3').set({
      id: 'lote3',
      nome: 'Lote 3',
      ativo: false,
      dataInicio: firebase.firestore.Timestamp.fromDate(new Date('2025-08-17')),
      dataFim: firebase.firestore.Timestamp.fromDate(new Date('2025-09-30')),
      limiteTimes: 180, // Total geral
      valores: {
        'RX': 49495,
        'Master 145+': 39495,
        'Amador': 39495,
        'Scale': 39495,
        'Iniciante': 39495
      },
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    console.log('Documentos de lotes 2 e 3 criados');

    // 6. CORRIGIR CATEGORIAS
    console.log('\nCorrigindo categorias...');
    const categorias = ['RX', 'Scaled', 'Master 145+', 'Amador', 'Scale', 'Iniciante'];
    
    for (const categoria of categorias) {
      const categoriaRef = db.collection('categorias').doc(categoria);
      await categoriaRef.set({
        id: categoria,
        nome: categoria,
        descricao: categoria,
        ativa: true,
        contaParaKitEspecial: categoria !== 'RX', // RX não conta para kit especial
        disponivelLote1: categoria !== 'RX', // RX não disponível no lote 1
        ordem: categorias.indexOf(categoria) + 1,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    }
    console.log('Categorias corrigidas');

    console.log('\nCorreção dos dados concluída com sucesso!');
    console.log('\nResumo das correções:');
    console.log('- Configuração do sistema: loteAtual corrigido');
    console.log('- Time: campos multivalorados corrigidos');
    console.log('- Atleta: campos multivalorados e tipos corrigidos');
    console.log('- Estatísticas: estrutura corrigida');
    console.log('- Lotes 2 e 3: criados com configurações corretas');
    console.log('- Categorias: estrutura padronizada');

  } catch (error) {
    console.error('Erro durante a correção:', error);
    throw error;
  }
}

// Executar correção
corrigirDadosFirestore()
  .then(() => {
    console.log('\nScript executado com sucesso!');
  })
  .catch((error) => {
    console.error('\nErro no script:', error);
  }); 
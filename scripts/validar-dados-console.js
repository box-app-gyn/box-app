// SCRIPT PARA VALIDAR DADOS DO FIRESTORE
// Execute este código no console do Firebase (Firestore > Regras > Console)

console.log('Iniciando validação dos dados do Firestore...');

// Função para validar dados do Firestore
async function validarDadosFirestore() {
  const erros = [];
  const avisos = [];

  try {
    // 1. VALIDAR CONFIGURAÇÃO DO SISTEMA
    console.log('\nValidando configuração do sistema...');
    const sistemaDoc = await db.collection('sistema').doc('SiY3O8vl33cpuM21LQLx').get();
    
    if (sistemaDoc.exists) {
      const data = sistemaDoc.data();
      
      // Validar loteAtual
      if (typeof data.loteAtual !== 'string' || data.loteAtual.includes(',')) {
        erros.push('loteAtual deve ser string única, não multivalorada');
      } else {
        console.log('loteAtual: OK');
      }
      
      // Validar campos obrigatórios
      const camposObrigatorios = ['inscricoesAbertas', 'limiteLote1', 'limiteTotal', 'dataEvento'];
      camposObrigatorios.forEach(campo => {
        if (data[campo] === undefined) {
          erros.push(`Campo obrigatório ausente: ${campo}`);
        } else {
          console.log(`${campo}: OK`);
        }
      });
    } else {
      erros.push('Documento de configuração do sistema não encontrado');
    }

    // 2. VALIDAR DOCUMENTO DE TIME
    console.log('\nValidando documento de time...');
    const teamDoc = await db.collection('teams').doc('uVFR1oL5NsX2MeIGbstt').get();
    
    if (teamDoc.exists) {
      const data = teamDoc.data();
      
      // Validar campos que devem ser strings únicas
      const camposString = ['categoria', 'lote', 'status', 'statusPagamento'];
      camposString.forEach(campo => {
        if (typeof data[campo] !== 'string' || data[campo].includes(',')) {
          erros.push(`${campo} deve ser string única, não multivalorada`);
        } else {
          console.log(`${campo}: OK`);
        }
      });
      
      // Validar array de atletas
      if (!Array.isArray(data.atletas)) {
        erros.push('atletas deve ser array');
      } else {
        console.log('atletas: OK (array)');
      }
      
      // Validar números
      if (typeof data.quantidade !== 'number') {
        erros.push('quantidade deve ser number');
      } else {
        console.log('quantidade: OK');
      }
      
      if (typeof data.valorTotal !== 'number') {
        erros.push('valorTotal deve ser number');
      } else {
        console.log('valorTotal: OK');
      }
    } else {
      erros.push('Documento de time não encontrado');
    }

    // 3. VALIDAR DOCUMENTO DE ATLETA
    console.log('\nValidando documento de atleta...');
    const atletaDoc = await db.collection('atletas').doc('0vDKF7Y7rxrnDMYbk6gq').get();
    
    if (atletaDoc.exists) {
      const data = atletaDoc.data();
      
      // Validar campos que devem ser strings únicas
      const camposString = ['categoria', 'status', 'genero', 'camiseta', 'tamanho'];
      camposString.forEach(campo => {
        if (typeof data[campo] !== 'string' || data[campo].includes(',')) {
          erros.push(`${campo} deve ser string única, não multivalorada`);
        } else {
          console.log(`${campo}: OK`);
        }
      });
      
      // Validar idade como number
      if (typeof data.idade !== 'number') {
        erros.push('idade deve ser number');
      } else {
        console.log('idade: OK');
      }
      
      // Validar resultados como array
      if (!Array.isArray(data.resultados)) {
        erros.push('resultados deve ser array');
      } else {
        console.log('resultados: OK (array)');
      }
      
      // Verificar se user_id_1 foi removido
      if (data.user_id_1 !== undefined) {
        avisos.push('Campo user_id_1 ainda presente (deveria ser removido)');
      } else {
        console.log('user_id_1: OK (removido)');
      }
    } else {
      erros.push('Documento de atleta não encontrado');
    }

    // 4. VALIDAR ESTRUTURA DE ESTATÍSTICAS
    console.log('\nValidando estrutura de estatísticas...');
    const estatisticasDoc = await db.collection('estatisticas').doc('lotes').get();
    
    if (estatisticasDoc.exists) {
      const data = estatisticasDoc.data();
      
      // Validar estatisticasPorCategoria
      if (typeof data.estatisticasPorCategoria === 'object' && data.estatisticasPorCategoria !== null) {
        console.log('estatisticasPorCategoria: OK (objeto)');
      } else {
        erros.push('estatisticasPorCategoria deve ser objeto');
      }
      
      // Validar estatisticasPorLote
      if (typeof data.estatisticasPorLote === 'object' && data.estatisticasPorLote !== null) {
        console.log('estatisticasPorLote: OK (objeto)');
      } else {
        erros.push('estatisticasPorLote deve ser objeto');
      }
      
      // Validar timesRX como number
      if (typeof data.timesRX !== 'number') {
        erros.push('timesRX deve ser number');
      } else {
        console.log('timesRX: OK');
      }
    } else {
      erros.push('Documento de estatísticas não encontrado');
    }

    // 5. VALIDAR LOTES
    console.log('\nValidando lotes...');
    const lotes = ['lote1', 'lote2', 'lote3'];
    
    for (const loteId of lotes) {
      const loteDoc = await db.collection('lotes').doc(loteId).get();
      
      if (loteDoc.exists) {
        const data = loteDoc.data();
        console.log(`${loteId}: OK`);
        
        // Validar valores como objeto
        if (typeof data.valores !== 'object' || data.valores === null) {
          erros.push(`valores em ${loteId} deve ser objeto`);
        }
      } else {
        erros.push(`Documento de ${loteId} não encontrado`);
      }
    }

    // 6. VALIDAR CATEGORIAS
    console.log('\nValidando categorias...');
    const categorias = ['RX', 'Scaled', 'Master 145+', 'Amador', 'Scale', 'Iniciante'];
    
    for (const categoria of categorias) {
      const categoriaDoc = await db.collection('categorias').doc(categoria).get();
      
      if (categoriaDoc.exists) {
        const data = categoriaDoc.data();
        console.log(`${categoria}: OK`);
        
        // Validar campos obrigatórios
        if (typeof data.contaParaKitEspecial !== 'boolean') {
          erros.push(`contaParaKitEspecial em ${categoria} deve ser boolean`);
        }
        
        if (typeof data.disponivelLote1 !== 'boolean') {
          erros.push(`disponivelLote1 em ${categoria} deve ser boolean`);
        }
      } else {
        erros.push(`Documento de categoria ${categoria} não encontrado`);
      }
    }

    // RESUMO
    console.log('\nRESUMO DA VALIDAÇÃO:');
    
    if (erros.length === 0 && avisos.length === 0) {
      console.log('TODOS OS DADOS ESTAO CORRETOS!');
    } else {
      if (erros.length > 0) {
        console.log('\nERROS ENCONTRADOS:');
        erros.forEach(erro => console.log(erro));
      }
      
      if (avisos.length > 0) {
        console.log('\nAVISOS:');
        avisos.forEach(aviso => console.log(aviso));
      }
    }

    return { erros, avisos };

  } catch (error) {
    console.error('Erro durante a validação:', error);
    throw error;
  }
}

// Executar validação
validarDadosFirestore()
  .then(({ erros, avisos }) => {
    if (erros.length === 0) {
      console.log('\nValidação concluída com sucesso!');
    } else {
      console.log('\nValidação falhou com erros!');
    }
  })
  .catch((error) => {
    console.error('\nErro na validação:', error);
  }); 
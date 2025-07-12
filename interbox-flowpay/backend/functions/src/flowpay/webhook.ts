import { Request, Response } from 'express';
import { Firestore, FieldValue } from 'firebase-admin/firestore';
import { enviaEmailPagamento } from '../../legacy/emails';

export async function processFlowPayWebhook(
  req: Request,
  res: Response,
  db: Firestore
): Promise<void> {
  console.log('Payload recebido:', JSON.stringify(req.body, null, 2));

  const ref =
    req.body?.charge?.reference ||
    req.body?.reference ||
    req.body?.custom_id ||
    null;

  if (!ref) {
    res.status(400).send('Referência não encontrada no payload');
    return;
  }

  // Verificar se é um time ou audiovisual
  const teamDoc = await db.collection('teams').doc(ref).get();
  const audiovisualDoc = await db.collection('audiovisual').doc(ref).get();

  if (teamDoc.exists) {
    const teamData = teamDoc.data();
    
    // Atualizar status do pagamento
    await db.collection('teams').doc(ref).update({
      statusPagamento: 'paid',
      updatedAt: FieldValue.serverTimestamp(),
      paidAt: FieldValue.serverTimestamp()
    });
    
    console.log(`Pagamento confirmado para time: ${ref}`);
    
    // Enviar email de confirmação
    if (teamData?.email && teamData?.nome) {
      try {
        await enviaEmailPagamento({
          userEmail: teamData.email,
          userName: teamData.nome,
          tipo: 'pagamento',
          dadosAdicionais: {
            tipo: 'Inscrição de Time',
            valor: teamData.valor?.toFixed(2) || '0,00',
            metodo: 'PIX',
            data: new Date().toLocaleDateString('pt-BR'),
            categoria: teamData.categoria,
            time: teamData.nome
          }
        });
        console.log(`Email de confirmação enviado para: ${teamData.email}`);
      } catch (error) {
        console.error('Erro ao enviar email de confirmação:', error);
      }
    }
    
  } else if (audiovisualDoc.exists) {
    const audiovisualData = audiovisualDoc.data();
    
    // Atualizar status do pagamento
    await db.collection('audiovisual').doc(ref).update({
      statusPagamento: 'paid',
      updatedAt: FieldValue.serverTimestamp(),
      paidAt: FieldValue.serverTimestamp()
    });
    
    console.log(`Pagamento confirmado para audiovisual: ${ref}`);
    
    // Enviar email de confirmação
    if (audiovisualData?.email && audiovisualData?.nome) {
      try {
        await enviaEmailPagamento({
          userEmail: audiovisualData.email,
          userName: audiovisualData.nome,
          tipo: 'pagamento',
          dadosAdicionais: {
            tipo: 'Inscrição Audiovisual',
            valor: audiovisualData.valor?.toFixed(2) || '29,90',
            metodo: 'PIX',
            data: new Date().toLocaleDateString('pt-BR'),
            area: audiovisualData.area
          }
        });
        console.log(`Email de confirmação enviado para: ${audiovisualData.email}`);
      } catch (error) {
        console.error('Erro ao enviar email de confirmação:', error);
      }
    }
    
  } else {
    console.error(`Documento não encontrado para referência: ${ref}`);
    res.status(404).send('Documento não encontrado');
    return;
  }

  res.status(200).send('OK');
} 
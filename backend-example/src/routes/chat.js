const express = require('express');
const { validateChatRequest } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');
const { ChatController } = require('../controllers/ChatController');
const { logger } = require('../utils/logger');

const router = express.Router();
const chatController = new ChatController();

// POST /api/chat/message - Enviar mensagem para IA
router.post('/message', validateChatRequest, async (req, res) => {
  try {
    const { message, context, userId, sessionId } = req.body;
    
    logger.info('Nova mensagem recebida', {
      userId,
      sessionId,
      messageLength: message.length
    });

    const response = await chatController.processMessage({
      message,
      context,
      userId,
      sessionId
    });

    res.json(response);
  } catch (error) {
    logger.error('Erro ao processar mensagem:', error);
    res.status(500).json({
      error: 'Erro ao processar mensagem',
      message: error.message
    });
  }
});

// POST /api/chat/stream - Chat com streaming (Server-Sent Events)
router.post('/stream', validateChatRequest, async (req, res) => {
  try {
    const { message, context, userId, sessionId } = req.body;
    
    // Configurar headers para SSE
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    logger.info('Iniciando chat streaming', { userId, sessionId });

    // Processar mensagem com streaming
    await chatController.processMessageStream({
      message,
      context,
      userId,
      sessionId,
      onChunk: (chunk) => {
        res.write(`data: ${JSON.stringify({ chunk, type: 'content' })}\n\n`);
      },
      onComplete: (fullResponse) => {
        res.write(`data: ${JSON.stringify({ 
          fullResponse, 
          type: 'complete',
          timestamp: new Date().toISOString()
        })}\n\n`);
        res.end();
      },
      onError: (error) => {
        res.write(`data: ${JSON.stringify({ 
          error: error.message, 
          type: 'error' 
        })}\n\n`);
        res.end();
      }
    });

  } catch (error) {
    logger.error('Erro no chat streaming:', error);
    res.write(`data: ${JSON.stringify({ 
      error: 'Erro interno', 
      type: 'error' 
    })}\n\n`);
    res.end();
  }
});

// GET /api/chat/history/:sessionId - Histórico de conversa
router.get('/history/:sessionId', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { userId } = req.user;

    const history = await chatController.getChatHistory(sessionId, userId);
    res.json({ history });
  } catch (error) {
    logger.error('Erro ao buscar histórico:', error);
    res.status(500).json({
      error: 'Erro ao buscar histórico',
      message: error.message
    });
  }
});

// POST /api/chat/session - Criar nova sessão
router.post('/session', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { context } = req.body;

    const session = await chatController.createSession(userId, context);
    res.json({ session });
  } catch (error) {
    logger.error('Erro ao criar sessão:', error);
    res.status(500).json({
      error: 'Erro ao criar sessão',
      message: error.message
    });
  }
});

// DELETE /api/chat/session/:sessionId - Encerrar sessão
router.delete('/session/:sessionId', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { userId } = req.user;

    await chatController.endSession(sessionId, userId);
    res.json({ message: 'Sessão encerrada com sucesso' });
  } catch (error) {
    logger.error('Erro ao encerrar sessão:', error);
    res.status(500).json({
      error: 'Erro ao encerrar sessão',
      message: error.message
    });
  }
});

// POST /api/chat/feedback - Avaliar resposta da IA
router.post('/feedback', authenticateToken, async (req, res) => {
  try {
    const { sessionId, messageId, rating, feedback } = req.body;
    const { userId } = req.user;

    await chatController.saveFeedback({
      sessionId,
      messageId,
      userId,
      rating,
      feedback
    });

    res.json({ message: 'Feedback salvo com sucesso' });
  } catch (error) {
    logger.error('Erro ao salvar feedback:', error);
    res.status(500).json({
      error: 'Erro ao salvar feedback',
      message: error.message
    });
  }
});

module.exports = router; 
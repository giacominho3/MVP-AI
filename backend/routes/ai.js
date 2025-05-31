const express = require('express');
const router = express.Router();
const claudeService = require('../services/claudeService');

// Test Claude connection
router.get('/test', async (req, res) => {
  try {
    const result = await claudeService.testConnection();
    res.json({
      status: 'success',
      message: 'Claude API connection successful',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to connect to Claude API',
      error: error.message
    });
  }
});

// Send message to Claude - NO VALIDATION
router.post('/chat', async (req, res) => {
  try {
    console.log('📨 Received chat request:', JSON.stringify(req.body, null, 2));
    
    const { message, context } = req.body;
    
    // Simple check - no Joi validation
    if (!message) {
      console.log('❌ No message provided');
      return res.status(400).json({
        status: 'error',
        message: 'Message is required',
        received: req.body
      });
    }
    
    console.log('✅ Processing message:', message);
    
    const response = await claudeService.sendMessage(message, context);
    
    console.log('✅ Claude response received, length:', response.length);
    
    res.json({
      status: 'success',
      data: {
        response,
        timestamp: new Date().toISOString(),
        model: 'claude-3-5-sonnet',
        context: context || null
      }
    });

  } catch (error) {
    console.error('❌ AI chat route error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to process AI request',
      error: error.message
    });
  }
});

module.exports = router;
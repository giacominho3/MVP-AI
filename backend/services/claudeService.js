const Anthropic = require('@anthropic-ai/sdk');
const logger = require('../utils/logger');

class ClaudeService {
  constructor() {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is required');
    }
    
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    
    this.maxTokens = 1000;
    this.model = 'claude-3-5-sonnet-20241022';
  }

  async testConnection() {
    try {
      const response = await this.sendMessage('Hello! Just testing the connection.');
      return { success: true, response: response.substring(0, 100) + '...' };
    } catch (error) {
      logger.error('Claude API test failed:', error);
      throw error;
    }
  }

  async sendMessage(message, context = null) {
    try {
      let systemPrompt = this.buildSystemPrompt(context);
      
      const response = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: message
          }
        ]
      });

      const content = response.content[0].text;
      
      logger.info(`Claude API call successful. Input: ${message.substring(0, 50)}...`);
      
      return content;
    } catch (error) {
      logger.error('Claude API error:', error);
      throw new Error(`Claude API failed: ${error.message}`);
    }
  }

  buildSystemPrompt(context) {
    return `
Sei un assistente AI specializzato in automazione e analisi dati aziendali.

COMPETENZE PRINCIPALI:
- Analisi di fogli di calcolo e database
- Automazione di processi aziendali
- Generazione di report e insight
- Gestione documentale
- Ottimizzazione workflow

PERSONALITÀ:
- Professionale ma accessibile
- Proattivo nel suggerire miglioramenti
- Orientato all'efficienza
- Preciso e dettagliato nelle analisi

FORMATO RISPOSTE:
- Usa markdown per formattazione
- Includi sempre azioni concrete
- Suggerisci prossimi passi
- Evidenzia insight importanti con emoji
`;
  }
}

module.exports = new ClaudeService();
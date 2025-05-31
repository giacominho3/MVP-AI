const express = require('express');
const router = express.Router();

router.get('/status', (req, res) => {
  res.json({
    status: 'ok',
    integrations: {
      'google-sheets': { status: 'pending', message: 'Not yet implemented' },
      'google-drive': { status: 'pending', message: 'Not yet implemented' },
      'claude-ai': { status: 'active', message: 'Connected' }
    }
  });
});

module.exports = router;
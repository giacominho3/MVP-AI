const express = require('express');
const router = express.Router();

router.get('/status', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Auth service ready',
    authenticated: false
  });
});

module.exports = router;
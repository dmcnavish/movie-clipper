const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    errors: []  // Placeholder — later we can add error logging
  });
});

module.exports = router;
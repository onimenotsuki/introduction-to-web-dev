const express = require('express');
const router = express.Router();
require('dotenv').config();

/* GET home page. */
router.get('/privacy', (req, res, next) => {
  res.render('privacy');
});

module.exports = router;

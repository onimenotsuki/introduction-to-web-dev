const express = require('express');
const router = express.Router();
require('dotenv').config();

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', { user: req.user });
});

module.exports = router;

const express = require('express');
const router = express.Router();
require('dotenv').config();

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', { title: `${ process.env.HELLO  } Express` });
});

module.exports = router;

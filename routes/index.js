var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Main menu' });
});
router.get('/training', function(req, res, next) {
  res.render('training', { title: 'Training' });
});

module.exports = router;

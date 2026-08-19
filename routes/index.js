var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Pagrindinis puslapis' });
});
router.get('/training', function(req, res, next) {
  res.render('training', { title: 'Sportas' });
});
router.get('/books', function(req, res, next) {
  res.render('books', { title: 'Knygos' });
});
router.post('/books', function(req, res, next) {
  const bookTitle = req.body.title;
  const bookAuthor = req.body.author;
  const bookGenre = req.body.genre;
  console.log(`Book Title: ${bookTitle}, Author: ${bookAuthor}, Genre: ${bookGenre}`);
  res.redirect('/books');
});

module.exports = router;

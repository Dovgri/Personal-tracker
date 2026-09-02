var express = require('express');
var router = express.Router();
var db = require('../config/db');

router.get('/', function (req, res, next) {
  res.render('index', { title: 'Pagrindinis puslapis' });
});

router.get('/training', function (req, res, next) {
  res.render('training', { title: 'Sportas' });
});

function formatDate(date) {
  return date.toISOString().slice(0, 10).replace(/-/g, ' ');
}

router.get('/books', async (req, res) => {
  const result = await db.query('SELECT * FROM books ORDER BY book_id');
  const books = result.rows.map(book => ({
    ...book,
    book_read_date: book.book_read_date ? formatDate(book.book_read_date) : null,
    status: book.status === 'finished' ? 'Perskaityta' : book.status === 'reading' ? 'Skaitoma' : 'Neperskaityta'
  }));
  res.render('books', { books });
});

router.post('/books', function (req, res, next) {
  const bookTitle = req.body.title;
  const bookAuthor = req.body.author;
  const bookGenre = req.body.genre;
  const bookReadDate = req.body.readDate;
  const bookStatus = req.body.status;

  const fields = {
    title: bookTitle,
    author: bookAuthor,
    genre: bookGenre,
    book_read_date: bookReadDate || null,
    status: bookStatus,
  };

  const columns = Object.keys(fields).filter(
    (key) => fields[key] !== null && fields[key] !== undefined && fields[key] !== ''
  );
  const values = columns.map((key) => fields[key]);
  const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
  const query = `INSERT INTO books (${columns.join(', ')}) VALUES (${placeholders})`;

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error inserting book into database:', err);
      res.status(500).send('Error inserting book into database');
    } else {
      console.log('Book inserted successfully');
      res.redirect('/books');
    }
  });
});

router.put('/books/:bookId', function (req, res, next) {
  const bookId = req.params.bookId;

  const bookTitle = req.body.title;
  const bookAuthor = req.body.author;
  const bookGenre = req.body.genre;
  const bookReadDate = req.body.readDate;
  const bookStatus = req.body.status;

  const fields = {
    title: bookTitle,
    author: bookAuthor,
    genre: bookGenre,
    book_read_date: bookReadDate || null,
    status: bookStatus,
  };

  const columns = Object.keys(fields).filter(
    (key) => fields[key] !== null && fields[key] !== undefined && fields[key] !== ''
  );
  const values = columns.map((key) => fields[key]);

  const setClause = columns.map((col, i) => `${col} = $${i + 1}`).join(', ');
  const query = `UPDATE books SET ${setClause} WHERE book_id = $${columns.length + 1}`;
  db.query(query, [...values, bookId], (err, result) => {
    if (err) {
      console.error('Error updating book:', err);
      res.status(500).send('Error updating book');
    } else if (result.rowCount === 0) {
      console.log('No book found with that id');
      res.status(404).send('Book not found');
    } else {
      console.log('Book updated successfully');
      res.status(200).send('Book updated');
    }
  });
});

router.delete('/books/:bookId', function(req, res, next){
  const bookId = req.params.bookId;

   db.query('DELETE FROM books WHERE book_id = $1', [bookId], (err, result) => {
    if (err) {
      console.error('Error deleting book:', err);
      res.status(500).send('Error deleting book');
    } else if (result.rowCount === 0) {
      console.log('No book found with that id');
      res.status(404).send('Book not found');
    } else {
      console.log('Book deleted successfully');
      res.status(200).send('Book deleted');
    }
  });
});

module.exports = router;

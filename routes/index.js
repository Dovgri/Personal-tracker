var express = require('express');
var router = express.Router();
var db = require('../config/db');

/*router.get('/', (req, res, next) => {
  res.render('index', { title: 'Pagrindinis puslapis' });
});*/

router.get('/training', (req, res, next) => {
  res.render('training', { title: 'Sportas' });
});

router.get('/books', async (req, res) => {
  const result = await db.query('SELECT * FROM books ORDER BY book_id');
  const books = result.rows.map(book => ({
    ...book,
    book_read_date: book.book_read_date ? formatDate(book.book_read_date) : null,
    status: book.status === 'finished' ? 'Perskaityta' : book.status === 'reading' ? 'Skaitoma' : 'Neperskaityta'
  }));
  res.render('books', { books });
});

router.get('/projects', async (req, res) => {
  const allProjects = await db.query('SELECT * FROM projects')
  res.render('allProjects', {
      title: 'Programavimas',
      projects: allProjects.rows
    });
});

router.get('/projects/create', (req, res) => {
  res.render('project', {
    title: 'Projektas',
    isNew: true,
    project: {},
    action: '/projects',
    error: null
  })
});

// router.get('/projects/project/:projectId', async(req, res, next) => {
//   const projectId = req.params.projectId;
//   const result = await db.query('SELECT * FROM projects WHERE id = $1',[req.params.projectId]);
//   const project = result.rows[0];
//   if (!project) return res.status(404).send('Projektas nerastas');
//   res.render('project', {
//     title: 'Projektas',
//     project: project,
//     inNew: false,
//     action: `/projects/project/${projectId}`,
//     error: null
//   })
// });

router.post('/books', (req, res, next) => {
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

router.post('/projects',(req, res) => {
  const name = req.body.name;
  const description = req.body.description;
  const url = req.body.url;
  const github_url = req.body.github;

  db.query('INSERT INTO projects (name, description, url, github_url) VALUES ($1, $2, $3, $4)',[name, description, url, github_url],(err,result)=>{
    if(err){
      console.error('Error inserting values into projects', err);
      res.status(500).send('Error inserting project into database');
    }
    else{
      console.log('Succesfully inserted project into database');
      res.redirect('/projects');
    }
  })
});

router.post('/books/:bookId', (req, res, next) => {
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

router.post('/projects/project/:projectId', (req, res) => {
  const projectId = req.params.projectId;
  const name = req.body.name;
  const description = req.body.description;
  const url = req.body.url;
  const github_url = req.body.github;

  db.query('UPDATE projects SET name = $1, description = $2, url = $3, github_url = $4 WHERE id = $5',[name, description, url, github_url, projectId],(err,result)=>{
    if(err){
      console.error('Error inserting values into projects', err);
      res.status(500).send('Error inserting project into database');
    }
    else{
      console.log('Succesfully inserted project into database');
      res.redirect('/projects');
    }
  })
});

router.delete('/books/:bookId', async(req, res, next) => {
  const bookId = req.params.bookId;

   await db.query('DELETE FROM books WHERE book_id = $1', [bookId], (err, result) => {
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

router.post('/projects/:projectId/delete', async(req, res) => {
  const projectId = req.params.projectId;
  await db.query('DELETE FROM projects WHERE id = $1', [projectId], (err, result) =>{
    if (err) {
      console.error('Error deleting project:', err);
      res.status(500).send('Error deleting project');
    } else if (result.rowCount === 0) {
      console.log('No project found with that id');
      res.status(404).send('Project not found');
    } else {
      console.log('Project deleted successfully');
      res.redirect('/projects');
    }
  });
});

router.get('/', async (req, res) => {
  try {
    const { rows: projects } = await db.query(
      'SELECT * FROM projects ORDER BY id DESC LIMIT 3'
    );
    res.render('index', { title: 'Dovydas Griškevičius', active: 'projects', projects });
  } catch (err) {
    console.error('Error loading homepage projects', err);
    res.render('index', { title: 'Tomas Petraitis', active: 'projects', projects: [] });
  }
});

router.get('/about', (req, res) => {
  res.render('about', { title: 'About — Tomas Petraitis', active: 'about' });
});

router.get('/contact', (req, res) => {
  res.render('contact', { title: 'Contact — Tomas Petraitis', active: 'contact' });
});

function formatDate(date) {
  return date.toISOString().slice(0, 10).replace(/-/g, ' ');
}

function requireAuth(req, res, next) {
  if (req.session && req.session.isAdmin) {
    return next();
  }
  res.redirect('login');
}

router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  // check against your stored (hashed) admin credentials here
  const valid = username === process.env.ADMIN_USER && await bcrypt.compare(password, process.env.ADMIN_PASS_HASH);

  if (!valid) {
    return res.render('login', { error: 'Incorrect username or password.' });
  }
  req.session.isAdmin = true;
  res.redirect('/admin/projects');
});

router.get('/projects/project/:projectId', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM projects WHERE id = $1', [req.params.projectId]);
    if (!rows.length) return res.status(404).send('Projektas nerastas');
    res.render('viewProject', { title: rows[0].name, project: rows[0] });
  } catch (err) {
    console.error('Error loading project', err);
    res.status(500).send('Klaida įkeliant projektą');
  }
});

module.exports = router;


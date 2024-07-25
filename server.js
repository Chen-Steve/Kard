const express = require('express');
const next = require('next');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const port = 3000;
const db = new sqlite3.Database(':memory:');

app.prepare().then(() => {
  const server = express();

  server.use(bodyParser.json());
  server.use(express.json());

  // Check and create schema if it doesn't exist
  db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS decks (id INTEGER PRIMARY KEY, name TEXT)', (err) => {
      if (err) {
        console.error('Error creating decks table:', err.message);
      } else {
        db.get('SELECT COUNT(*) AS count FROM decks', (err, row) => {
          if (err) {
            console.error('Error counting rows:', err.message);
          } else if (row.count === 0) {
            db.run('INSERT INTO decks (name) VALUES ("Sample Deck")');
          }
        });
      }
    });

    db.run('CREATE TABLE IF NOT EXISTS flashcards (id INTEGER PRIMARY KEY, question TEXT, answer TEXT, `order` INTEGER, deck_id INTEGER, FOREIGN KEY(deck_id) REFERENCES decks(id))', (err) => {
      if (err) {
        console.error('Error creating flashcards table:', err.message);
      } else {
        db.get('SELECT COUNT(*) AS count FROM flashcards', (err, row) => {
          if (err) {
            console.error('Error counting rows:', err.message);
          } else if (row.count === 0) {
            db.run('INSERT INTO flashcards (question, answer, `order`, deck_id) VALUES ("What is 2 + 2?", "4", 0, 1)');
            db.run('INSERT INTO flashcards (question, answer, `order`, deck_id) VALUES ("What is the capital of France?", "Paris", 1, 1)');
          }
        });
      }
    });
  });

  // Endpoint to get all decks
  server.get('/decks', (req, res) => {
    db.all('SELECT * FROM decks', (err, rows) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.json(rows);
      }
    });
  });

  // Endpoint to get flashcards for a specific deck
  server.get('/decks/:deckId/flashcards', (req, res) => {
    const { deckId } = req.params;
    db.all('SELECT * FROM flashcards WHERE deck_id = ? ORDER BY `order` ASC', [deckId], (err, rows) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.json(rows);
      }
    });
  });

  // Existing flashcard endpoints
  server.get('/flashcards', (req, res) => {
    db.all('SELECT * FROM flashcards ORDER BY `order` ASC', (err, rows) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.json(rows);
      }
    });
  });

  server.post('/flashcards', (req, res) => {
    const { question, answer, deckId } = req.body;
    db.get('SELECT MAX(`order`) AS maxOrder FROM flashcards WHERE deck_id = ?', [deckId], (err, row) => {
      if (err) {
        res.status(500).send(err);
      } else {
        const newOrder = row.maxOrder !== null ? row.maxOrder + 1 : 0;
        db.run('INSERT INTO flashcards (question, answer, `order`, deck_id) VALUES (?, ?, ?, ?)', [question, answer, newOrder, deckId], function (err) {
          if (err) {
            res.status(500).send(err);
          } else {
            res.status(201).json({ id: this.lastID, question, answer, order: newOrder });
          }
        });
      }
    });
  });

  server.put('/flashcards/:id', (req, res) => {
    const { id } = req.params;
    const { question, answer } = req.body;
    db.run('UPDATE flashcards SET question = ?, answer = ? WHERE id = ?', [question, answer, id], function (err) {
      if (err) {
        res.status(500).send(err);
      } else if (this.changes === 0) {
        res.status(404).send('Flashcard not found');
      } else {
        res.status(200).send('Flashcard updated');
      }
    });
  });

  server.post('/update-order', (req, res) => {
    const flashcards = req.body;
    const updatePromises = flashcards.map(flashcard => {
      return new Promise((resolve, reject) => {
        db.run('UPDATE flashcards SET `order` = ? WHERE id = ?', [flashcard.order, flashcard.id], function (err) {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    });

    Promise.all(updatePromises)
      .then(() => res.status(200).send('Order updated'))
      .catch(err => res.status(500).send(err));
  });

  server.delete('/flashcards/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM flashcards WHERE id = ?', [id], function(err) {
      if (err) {
        res.status(500).send(err);
      } else if (this.changes === 0) {
        res.status(404).send('Flashcard not found');
      } else {
        res.status(200).send('Flashcard deleted');
      }
    });
  });

  server.all('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`Server running at http://localhost:${port}`);
  });
});

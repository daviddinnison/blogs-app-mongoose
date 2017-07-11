'use strict';
const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const {PORT, DATABASE_URL} = require('./config');
const {Blogs} = require('./models');

const app = express();
app.use(bodyParser.json());

//GET all
app.get('/posts', (req, res) => {
  Blogs
    .find()
    .limit(10)
    .exec()
    .then(blogs => {
      res.json(blogs);
})
    .catch(err => {console.error(err);
      res.status(500).json({message:'Internal Server Error'});
    })
});

//GET id
// app.get('/posts/:id', (req, res) => {
//   Blogs
//     .find({})
// })


//POST
app.post('/posts', (req, res) => {
  const requiredFields = ['title', 'author', 'content'];
  for(let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if(!(field in req.body)) {
      const message = `Missing ${field} in request.`
      console.error(message);
      return res.status(400).send(message);
    }
  }
  Blogs.create({
    title: req.body.title,
    author: req.body.author,
    content: req.body.content
  })
    .then(blog => res.status(201).send().json(blog))
    .catch(err => {console.error(err);
      res.status(500).json({message: 'Internal Server Error'});
    });
});



//PUT
// not working yet
app.put('/blogs/:id', (req, res) => {
  if (!(req.params.id&& req.body.id && req.params.id === req.body.id)) {
    const message = (
      `Request path id(${req.params.id}) and request body id
      (${req.bod.id} must match`);
      console.error(message);
      res.status(400).json({message: message});
  }
  const toUpdate = {};
  const updateableFields = ['title','author','content'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

  Blogs
    .findByIdAndUpdate(req.params._id, {$set: toUpdate})
    .exec()
    .then(blogs => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});




//DELETE
// findById needs the work
app.delete('/blogs/:id', (req, res) => {
  Blogs
    .findByIdAndRemove(req.params.id)
    .exec()
    .then(blogs => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});






//Server stuff
app.use('*', function(req, res) {
  res.status(404).json({message: 'Not Found'});
});

let server;

function runServer(databaseUrl=DATABASE_URL, port=PORT) {

  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer().catch(err => console.error(err));
};

module.exports = {app, runServer, closeServer};
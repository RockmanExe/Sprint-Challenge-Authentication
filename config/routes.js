const axios = require('axios');
const bcrypt= require('bcryptjs');
const jwt= require('jsonwebtoken');
const db= require('../database/dbConfig');
const secret=require('../_secrets/keys');

const { authenticate } = require('./middlewares');

module.exports = server => {
  server.post('/api/register', register);
  server.post('/api/login', login);
  server.get('/api/jokes', authenticate, getJokes);
};

function register(req, res) {
  // implement user registration
  const user=req.body;
  const hash=bcrypt.hashSync(user.password, 10);
  user.password=hash;

  db('users')
  .insert(user)
  .then(function(ids){
    db('users')
    .where({id:ids[0]})
    .first()
    .then(user=>{
      const token=generateToken(user);
      res.status(200).json({token})
    });
  })
  .catch(error => {
    res.status(500).json(error)
  })
}

function generateToken(user){
  const payload={
    username: user.username,
  };
  const options={
    expiresIn:'2h',
    jwtid:'jkl;'
  };
  return jwt.sign(payload, secret, options);
};

function login(req, res) {
  // implement user login
  const credentials=req.body;
  db('users')
  .where({username:credentials.username})
  .first()
  .then(function (user){
    if (user && bcrypt.compareSync(credentials.password, username.password)){
      const token =generateToken(user);
      res.send(`${user.username} signed in`);
    } else {
      return res.status(401).json({error:'Username or password incorrect'});
    }
  })
  .catch(function(error){
    res.status(500).json({error});
  });
};

function getJokes(req, res) {
  axios
    .get(
      'https://08ad1pao69.execute-api.us-east-1.amazonaws.com/dev/random_ten'
    )
    .then(response => {
      res.status(200).json(response.data);
    })
    .catch(err => {
      res.status(500).json({ message: 'Error Fetching Jokes', error: err });
    });
}

var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');
var passport	  = require('passport');

// get db config file
var config      = require('./config/database'); 

//get routes file
var userRoute = require('./app/routes/user');
var bookRoute   = require('./app/routes/book');
var authorRoute = require('./app/routes/author');
var buzzRoute   = require('./app/routes/buzzlist');

var port 	      = process.env.PORT || 8081;

// get our request parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// log to console
app.use(morgan('dev'));

// demo Route (GET http://localhost:8080)
app.get('/', function(req, res) {
  res.send('Hello! The API is at http://localhost:' + port + '/api');
});

// connect to database
mongoose.connect(config.database);

//connect to routes
app.use('/api/users', userRoute);
app.use('/api/books', bookRoute);
app.use('/api/authors', authorRoute);
app.use('/api/buzzlist', buzzRoute);

//var https = require('https');
//var fs = require('fs');

// var options = {
//   key: fs.readFileSync('./config/key.pem'),
//   cert: fs.readFileSync('./config/key-cert.pem')
// };


// https.createServer(options, app).listen(8080);

// Start the server
app.listen(port);
console.log('There will be dragons: http://localhost:' + port);

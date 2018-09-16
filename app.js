// INITIAL DECLARATIONS
const Review = require('./models/review');
const Comment = require('./models/comment');

const reviews = require('./controllers/reviews'); // initialize reveiws
const mongoose = require('mongoose'); // once was const or var...let is used
const express = require('express');
const methodOverride = require('method-override');
const bodyParser = require('body-parser'); // initialize body-parser

const app = express(); // include express.js stuff... adding dots after app (eg app.???)!
let exphbs = require('express-handlebars');

// MAGIC HAPPENS HERE
mongoose.connect('mongodb://localhost/rotten-potatoes', { useNewUrlParser: true });
mongoose.connect(process.env.'mongodb://heroku_12345678:random_password@ds029017.mLab.com:29017/heroku_12345678' || 'mongodb://localhost/rotten-potatoes', { useNewUrlParser: true });
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
// override with POST having ?_method=DELETE or ?_method=PUT
app.use(methodOverride('_method'))

	/*	Now we get		/
 /	to the meat of /
/		the project. */


// READY TO USE BODY-PARSER
app.use(bodyParser.urlencoded({ extended: true }));

// ROUTES
reviews(app);
require('./controllers/comments')(app);

// LISTEN
if (require.main === module ) {
	app.listen(3000, () => {
		console.log('App listening on port 3000!')
	})
}

module.exports = app;

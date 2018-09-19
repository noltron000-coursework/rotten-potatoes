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
const MONGODB_URI = "mongodb://heroku_nsl02xj6:vgqnm4njauqak2rb3qc078qi05@ds259802.mlab.com:59802/heroku_nsl02xj6"

// MAGIC HAPPENS HERE
mongoose.connect('mongodb://localhost/rotten-potatoes', { useNewUrlParser: true });
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/rotten-potatoes', { useNewUrlParser: true });
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

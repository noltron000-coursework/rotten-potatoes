// INITIAL DECLARATIONS
const Review = require('./models/review');
const Comment = require('./models/comment');

const reviews = require('./controllers/reviews'); // initialize reviews
const movies = require('./controllers/movies'); // initialize movies
const admin = require('./controllers/admin'); //initialize admin

const mongoose = require('mongoose'); // once was const or var...let is used
const express = require('express');
const methodOverride = require('method-override');
const bodyParser = require('body-parser'); // initialize body-parser

const app = express(); // include express.js stuff... adding dots after app (eg app.???)!
let exphbs = require('express-handlebars');

const connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/rotten-potatoes';
const port = process.env.PORT || 3000;

// connect to mongoose
mongoose.connect(connectionString, { useNewUrlParser: true });
// set up handlebars
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
// override with POST having ?_method=DELETE or ?_method=PUT
app.use(express.static('public'));
app.use(methodOverride('_method'));

  /*  Now we get     /
 /  to the brunt of /
/   the project.  */

// READY TO USE BODY-PARSER
app.use(bodyParser.urlencoded({ extended: true }));

// ROUTES
movies(app);
reviews(app);
admin(app);
require('./controllers/comments')(app);

// LISTEN
if (require.main === module) {
	app.listen(port, () => {
		console.log(`App listening on port ${port}!`)
	})
}

module.exports = app;

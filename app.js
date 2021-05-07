// Require local models & controllers
const Review = require('./models/review')
const Comment = require('./models/comment')

const movies = require('./controllers/movies')
const reviews = require('./controllers/reviews')
const comments = require('./controllers/comments')
/*
const admin = require('./controllers/admin') //initialize admin
 */

// Require other npm features.
// Here, mongoose interacts with the mongodb database.
const mongoose = require('mongoose')

// Here, express deals with various CRUD operations.
const express = require('express')
const expressHbs = require('express-handlebars')

// Here, other important packages are added.
const bodyParser = require('body-parser')
const methodOverride = require('method-override')

// Initialize express app.
const app = express()

// Set up handlebars
app.engine('hbs', expressHbs({
	'defaultLayout': 'main',
	'extname': '.hbs',
	'helpers': {
		json: (context) => (JSON.stringify(context, null, '\t')),
		equals: (context, value) => (context === value),
		join: (string, value) => ([string, value].join('')),
	}
}))
app.set('view engine', 'hbs')

// Connect to mongoose.
const connectionString = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/rotten-potatoes'
const port = process.env.PORT ?? 3000

mongoose.connect(connectionString, {
	'useNewUrlParser': true,
	'useUnifiedTopology': true,
	'useFindAndModify': false,
})

// Serve static files from the public folder.
app.use(express.static('public'))

// Override with operations like those with DELETE or PUT.
app.use(methodOverride('_method'))

// This parses the request data under req.body into objects.
app.use(bodyParser.urlencoded({extended: true}))

// ROUTES
movies(app)
reviews(app)
comments(app)
/*
admin(app)
*/

// LISTEN
if (require.main === module) {
	app.listen(port, () => {
		console.log(
			`App listening on port ${port}!`
			+ '\nhttp://localhost:3000/'
		)
	})
}

module.exports = app

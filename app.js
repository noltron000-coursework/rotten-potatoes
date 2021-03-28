// Require local models & controllers
const Review = require('./models/review')
const Comment = require('./models/comment')

const movies = require('./controllers/movies')
const reviews = require('./controllers/reviews')
/*
const admin = require('./controllers/admin') //initialize admin
const comments = require('./controllers/comments')
 */

// Require other npm features.
// Here, mongoose interacts with the mongodb database.
const mongoose = require('mongoose')

// Here, express deals with various CRUD operations.
const express = require('express')
const exphbs = require('express-handlebars')

const methodOverride = require('method-override')
const bodyParser = require('body-parser')

// Initialize express app.
const app = express()

// Set up handlebars
app.engine('handlebars', exphbs({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')

// Connect to mongoose.
const connectionString = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/rotten-potatoes'
const port = process.env.PORT ?? 3000

mongoose.connect(connectionString, { useNewUrlParser: true })

// Serve static files from the public folder.
app.use(express.static('public'))

// Override with operations like those with DELETE or PUT.
app.use(methodOverride('_method'))

// READY TO USE BODY-PARSER
app.use(bodyParser.urlencoded({ extended: true }))

// ROUTES
movies(app)
reviews(app)
/*
admin(app)
comments(app)
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

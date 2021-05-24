// Require local models & controllers
import Review from './models/review.js'
import Comment from './models/comment.js'

import movies from './controllers/movies.js'
import reviews from './controllers/reviews.js'
import comments from './controllers/comments.js'
/*
import admin from './controllers/admin.js' //initialize admin
 */

// Require other npm features.
// Here, mongoose interacts with the mongodb database.
import mongoose from 'mongoose'

// Here, express deals with various CRUD operations.
import express from 'express'
import expressHbs from 'express-handlebars'

// Here, other important packages are added.
import bodyParser from 'body-parser'
import methodOverride from 'method-override'

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
app.listen(port, () => {
	console.info(
		`App listening on port ${port}!`
		+ '\nhttp://localhost:3000/'
	)
})

export default app

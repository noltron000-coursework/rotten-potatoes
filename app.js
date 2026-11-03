// Require local models & controllers
// Models
import ReviewModel from './models/review.js'
import CommentModel from './models/comment.js'

import root from './controllers/root.js'
// ⚠️ import admin from './controllers/admin.js' //initialize admin
import movies from './controllers/movies.js'
import reviews from './controllers/reviews.js'
import comments from './controllers/comments.js'

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
		repeat: (from, to, block) => {

			if (to === undefined) {
				to = from
				from = 0
			}

			let accumulator = ''
			let index = 0
			let condition = ( ) => { }
			let increment = ( ) => { }

			if (from <= to) {
				index = from
				condition = ( ) => (index <= to)
				increment = ( ) => {index += 1}
			}

			else if (from > to) {
				index = from
				condition = ( ) => (index >= to)
				increment = ( ) => {index -= 1}
			}

			for (index; condition( ); increment( )) {
				block.data.index = index
				block.data.first = index === 0
				block.data.last  = index === (to - 1)
				accumulator += block.fn(index)
			}

			return accumulator
		}
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
root(app)
// ⚠️ admin(app)
movies(app)
reviews(app)
comments(app)

// LISTEN
app.listen(port, ( ) => {
	console.info(
		`App listening on port ${port}!`
		+ '\nhttp://localhost:3000/'
	)
})

export default app

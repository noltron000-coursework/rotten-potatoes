// Require local models & controllers
// Models
import ReviewModel from './models/review.mjs'
import CommentModel from './models/comment.mjs'

import root from './controllers/root.mjs'
// ⚠️ import admin from './controllers/admin.mjs' //initialize admin
import movies from './controllers/movies.mjs'
import reviews from './controllers/reviews.mjs'
import comments from './controllers/comments.mjs'

// Require other npm features.
// Here, mongoose interacts with the mongodb database.
import mongoose from 'mongoose'
import {watch as watchFileChanges} from 'node:fs'

// Here, express deals with various CRUD operations.
import express from 'express'
import {engine as expressHbs} from 'express-handlebars'

// Here, other important packages are added.
import methodOverride from 'method-override'

// Initialize express app.
const app = express()
app.locals.devMode = process.env.NODE_ENV === 'development'

const reloadClients = new Set()

if (app.locals.devMode) {
	app.get('/__dev/reload', (req, res) => {
		res.setHeader('Content-Type', 'text/event-stream')
		res.setHeader('Cache-Control', 'no-cache')
		res.setHeader('Connection', 'keep-alive')
		res.flushHeaders()

		reloadClients.add(res)
		req.on('close', () => reloadClients.delete(res))
	})

	let reloadTimer
	const broadcastReload = () => {
		clearTimeout(reloadTimer)
		reloadTimer = setTimeout(() => {
			for (const client of reloadClients) {
				client.write('data: reload\n\n')
			}
		}, 100)
	}

	for (const directory of ['source', 'views', 'public']) {
		watchFileChanges(directory, {recursive: true}, () => broadcastReload())
	}
}

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

const connectionString = process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/rotten-potatoes'
const port = process.env.PORT ?? 3000

// Serve static files from the public folder.
app.use(express.static('public'))

// Override with operations like those with DELETE or PUT.
app.use(methodOverride('_method'))

// This parses the request data under req.body into objects.
app.use(express.urlencoded({extended: true}))

// ROUTES
root(app)
// ⚠️ admin(app)
movies(app)
reviews(app)
comments(app)

// Connect before accepting requests so database-backed routes are ready.
const start = async ( ) => {
	try {
		await mongoose.connect(connectionString)
	}
	catch (err) {
		console.error(`MongoDB connection failed: ${err.message}`)
		process.exitCode = 1
		return
	}

	// LISTEN
	app.listen(port, ( ) => {
		console.info(
			`App listening on port ${port}!`
			+ `\nhttp://localhost:${port}/`
		)
	})
}

start( )

export default app

import ReviewModel from '../models/review.js'
import CommentModel from '../models/comment.js'
import {Config, Movie, Review} from '../helpers/classes/source/main.mjs'

import {MovieDb} from 'moviedb-promise'
const moviedb = new MovieDb('3a1d8db55135a8ae41b2314190591157')

const eject = (instance) => JSON.parse(JSON.stringify(instance))

/*** REVIEW ROUTES CONTROLLER ******************************

[GET] Routes
============

/reviews?language&movieId&page
------------------------------
INDEX all reviews, filtered by movie id and paginated by page.

/reviews/new
------------
Display a NEW review creation form displayed.

/reviews/:id?source
-------------------
SHOW one review in great detail.

/reviews/:id/edit
-----------------
Display an EDIT form for an existant review.

[POST] Routes
=============

/reviews
--------
CREATE a review from given information.

[PUT] Routes
============

/reviews/:id
------------
UPDATE a review with given information.

[DELETE] Routes
===============

/reviews/:id
------------
DELETE a review from the database.

...detailed further in README.md
***********************************************************/

const controller = (app) => {
	//+ INDEX of reviews +//
	app.get('/reviews', async (req, res) => {
		try {
			// ℹ️ queries -> ?movieId &language &page
			let {
				fragment,
				movieId: id,
				language,
				page,
				source = 'api'
			} = req.query

			// refer to main page on an invalid id entry.
			if (id == undefined) {res.redirect('/')}

			// set parameters from the inputs.
			const parameters = {id, language, page}

			let reviews
			let pagination
			if (source === 'api') {
				// 📥️ fetch info from the api.
				let apiConfig = moviedb.configuration( )
				let apiReviews = moviedb.movieReviews(parameters)

				// ⏱️ await fetched resources.
				apiConfig = await apiConfig
				apiReviews = await apiReviews

				// 📇 wrap the resposes into well-structured json.
				pagination = {
					page: apiReviews.page,
					results: apiReviews.results.length,
					totalPages: apiReviews.total_pages,
					totalResults: apiReviews.total_results,
				}

				apiReviews = apiReviews.results.map((apiReview) => {
					return eject(new Review({
						config: apiConfig,
						review: apiReview,
					}))
				})

				reviews = apiReviews
			}
			else if (source === 'db') {
				// 📥️ fetch info from the db.
				let dbReviews = ReviewModel.find({movie: {ids: {api: id}}})

				// ⏱️ await fetched resources.
				dbReviews = await dbReviews

				// 📇 wrap the resposes into well-structured json.
				dbReviews = dbReviews.map((dbReview) => {
					return eject(new Review({review: dbReview}))
				})

				reviews = dbReviews
			}

			// 📤️ send the data to the frontend.
			if (fragment) {
				res.render(
					'partials/reviews-list',
					{template: false, reviews}
				)
			}
			else {
				res.json({reviews: reviews, pagination})
			}
		}
		catch (err) {
			console.error(err.message)
			res.status(400).send({err})
		}
	})

	//+ NEW review fillout-form +//
	app.get('/reviews/new', async (req, res) => {
		try {
			// ℹ️ queries -> ?movieId
			let {/*fragment,*/ movieId} = req.query

			// 📥️ fetch info from the api.
			let apiConfig = moviedb.configuration( )
			let apiMovie = moviedb.movieInfo({id: movieId})

			// ⏱️ await fetched resources.
			apiConfig = await apiConfig
			apiMovie = await apiMovie

			// 📇 wrap the resposes into well-structured json.
			apiMovie = eject(new Movie({
				config: apiConfig,
				movie: apiMovie,
			}))

			// 📤️ send the data to the frontend.
			res.render('reviews-new', {movie: apiMovie})
		}
		catch (err) {
			console.error(err.message)
			res.status(400).send({err})
		}
	})

	//+ SHOW review details +//
	app.get('/reviews/:id', async (req, res) => {
		try {
			// ℹ️ params -> :id
			let {id} = req.params
			// ℹ️ queries -> ?source
			let {source} = req.query

			// 📥️ fetch info from the api.
			let apiConfig = moviedb.configuration( )

			// decide the source to fetch from.
			let dbComments, dbReview, apiMovie, apiReview, review
			if (source === 'db') {
				dbReview = ReviewModel.findById(id).lean()
				dbComments = CommentModel.find({db_review_id: id}).lean( )  // ⚠️ KEY NAME MAY CHANGE IN DB
				review = dbReview
			}

			else if (source === 'api') {
				apiReview = moviedb.review({id})
				dbComments = CommentModel.find({api_review_id: id}).lean( )  // ⚠️ KEY NAME MAY CHANGE IN DB
				review = apiReview
			}

			// ⏱️ await fetched resources.
			review = await review
			apiMovie = moviedb.movieInfo({id: review.media_id})
			dbComments = await dbComments
			apiConfig = await apiConfig
			apiMovie = await apiMovie

			// 📇 wrap the resposes into well-structured json.
			apiConfig = new Config({
				config: apiConfig,
			})

			apiMovie = new Movie({
				config: apiConfig,
				movie: apiMovie,
			})

			review = new Review({
				config: apiConfig,
				comments: dbComments, // ⚠️ TAKE IN COMMENTS FOR REVIEW OBJECT
				review,
			})

			apiConfig = eject(apiConfig)
			apiMovie = eject(apiMovie)
			review = eject(review)

			// 📤️ send the data to the frontend.
			res.render('reviews-show', {
				movie: apiMovie,
				review: review,
			})
		}
		catch (err) {
			console.error(err.message)
			res.status(400).send({err})
		}
	})

	//+ EDIT review fillout-form +//
	// ⚠️ Route only functional for db-based reviews!
	app.get('/reviews/:id/edit', async (req, res) => {
		try {
			// ℹ️ params -> :id
			let {id} = req.params

			// 📥️ fetch info from the api.
			let dbReview = ReviewModel.findById(id).lean( )

			// ⏱️ await fetched resources.
			dbReview = await dbReview
			let apiMovie = moviedb.movieInfo({id: dbReview.api_movie_id})  // ⚠️ KEY NAME MAY CHANGE IN DB
			apiMovie = await apiMovie

			// 📇 wrap the resposes into well-structured json.
			dbReview = eject(new Review({review: dbReview}))
			apiMovie = eject(new Movie({movie: apiMovie}))

			// 📤️ send the data to the frontend.
			res.render('reviews-edit', {
				review: dbReview,
				movie: apiMovie,
			})
		}
		catch (err) {
			console.error(err.message)
			res.status(400).send({err})
		}
	})

	//+ CREATE a review from given information +//
	app.post('/reviews', async (req, res) => {
		try {
			// ℹ️ body -> content, rating, title, movieId, authorName, authorAvatar
			let {authorAvatar, authorName, content, movieId, rating, title} = req.body

			// 📥️ fetch info from the api.
			let apiMovie = moviedb.movieInfo({id: review.media_id})

			// ⏱️ await needed resources.
			apiMovie = await apiMovie

			// 📇 wrap the body into well-structured json.
			apiMovie = new Movie({movie: apiMovie})

			let dbReview = {
				api_movie_id: movieId,
				author: {
					avatar_path: authorAvatar,
					name: authorName,
				},
				content,
				created_at: Date.now( ),
				rating,
				//// revised_at: Date.now( ),
				title,
			}

			dbReview = eject(new Review({
				review: dbReview,
				movie: apiMovie,
			}))
			apiMovie = eject(apiMovie)

			// 💾 save to database
			dbReview = ReviewModel.create(dbReview)

			// ⏱️ await fetched resources.
			dbReview = await dbReview

			// 📇 wrap the resposes into well-structured json.
			dbReview = eject(new Review({review: dbReview}))

			// 📤️ send the data to the frontend.
			res.redirect(`/reviews/${dbReview.ids.db}?source=db`)
		}
		catch (err) {
			console.error(err.message)
			res.status(400).send({err})
		}
	})

	//+ UPDATE a review with given information +//
	app.put('/reviews/:id', async (req, res) => {
		try {
			// ℹ️ body -> content, rating, title, movieId, authorName, authorAvatar
			let {authorAvatar, authorName, content, movieId, rating, title} = req.body
			// ℹ️ params -> :id
			let {id} = req.params

			// 📥️ fetch info from the api.
			let apiMovie = moviedb.movieInfo({id: review.media_id})

			// ⏱️ await needed resources.
			apiMovie = await apiMovie

			// 📇 wrap the body into well-structured json.
			apiMovie = new Movie({movie: apiMovie})

			let dbReview = {
				api_movie_id: movieId,
				author: {
					avatar_path: authorAvatar,
					name: authorName,
				},
				content,
				//// created_at: Date.now( )
				rating,
				revised_at: Date.now( ),
				title,
			}

			dbReview = eject(new Review({
				review: dbReview,
				movie: apiMovie,
			}))
			apiMovie = eject(apiMovie)

			// 💾 save to database
			dbReview = ReviewModel.findByIdAndUpdate(id, dbReview)

			// ⏱️ await fetched resources.
			dbReview = await dbReview

			// 📇 wrap the resposes into well-structured json.
			dbReview = eject(new Review({review: dbReview}))

			// 📤️ send the data to the frontend.
			res.redirect(`/reviews/${dbReview.ids.db}?source=db`)
		}
		catch (err) {
			console.error(err.message)
			res.status(400).send({err})
		}
	})

	//+ DELETE a review +//
	app.delete('/reviews/:id', async (req, res) => {
		try {
			// ℹ️ params -> :id
			let {id} = req.params

			// 💾 save to database.
			let dbReview = ReviewModel.findByIdAndRemove(id)

			// ⏱️ await fetched resources.
			dbReview = await dbReview
			let {movieId} = dbReview

			/*
			// == TODO ==
			// Reenable admin functionality below.
			if (req.body.admin !== undefined) {
				res.redirect('/admin')
			}
			else { }
			*/

			// 📤️ send the data to the frontend.
			res.redirect(`/movies/${movieId}`)
		}
		catch (err) {
			console.error(err.message)
			res.status(400).send({err})
		}
	})
}

export default controller

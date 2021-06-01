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

/reviews/:id?source
-------------------

/reviews/:id/edit
------------------------

...detailed further in README.md
***********************************************************/

const controller = (app) => {
	//+ INDEX of reviews +//
	app.get('/reviews', async (req, res) => {
		try {
			// ℹ️ queries -> ?movieId &language &page
			let {/*fragment,*/ movieId: id, language, page} = req.query

			// refer to main page on an invalid id entry.
			if (id == undefined) {res.redirect('/')}

			// set parameters from the inputs.
			const parameters = {id, language, page}

			// 📥️ fetch info from the api.
			let apiConfig = moviedb.configuration( )
			let apiReviews = moviedb.movieReviews(parameters)

			// ⏱️ await fetched resources.
			apiConfig = await apiConfig
			apiReviews = await apiReviews

			// 📇 wrap the resposes into well-structured json.
			const pagination = {
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

			// 📤️ send the data to the frontend.
			res.json({reviews: apiReviews, pagination})
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

	/*
	// == SUBMIT A CREATED REVIEW ==
	// This controls new review submissions.
	app.post('/reviews', async (req, res) => {
		try {
			const reviewData = { }
			reviewData.rating = req.body.rating
			reviewData.title = req.body.title
			reviewData.content = req.body.content
			reviewData.api_movie_id = req.body.api_movie_id
			reviewData.author = { }
			reviewData.author.name = reviewData.author.username = req.body.author_username
			reviewData.author.avatar_path = req.body.author_avatar_path
			reviewData.created_at = Date.now()

			let review = Review.create(reviewData)
			review = await review

			res.redirect(`/reviews/${review._id}?source=db`)
		}

		catch (err) {
			console.error(err.message)
		}
	})

	// == SUBMIT AN UPDATED REVIEW ==
	// This controls review-edit submissions.
	app.put('/reviews/:id', async (req, res) => {
		try {
			const reviewData = { }
			reviewData.rating = req.body.rating
			reviewData.title = req.body.title
			reviewData.content = req.body.content
			reviewData.api_movie_id = req.body.api_movie_id
			reviewData.author = { }
			reviewData.author.name = reviewData.author.username = req.body.author_username
			reviewData.author.avatar_path = req.body.author_avatar_path
			reviewData.revised_at = Date.now()

			let review = ReviewModel.findByIdAndUpdate(req.params.id, reviewData)
			review = await review

			res.redirect(`/reviews/${review._id}?source=db`)
		}

		catch (err) {
			console.error(err.message)
		}
	})

	// == SUBMIT A REVIEW DELETION ==
	// This controls review-deletion submissions.
	app.delete('/reviews/:id', async (req, res) => {
		try {
			let review = ReviewModel.findByIdAndRemove(req.params.id)
			review = await review

				// // == TODO ==
				// // Reenable admin functionality below.

				// if (req.body.admin !== undefined) {
				// 	res.redirect('/admin')
				// }
				// else { }


			res.redirect(`/movies/${review.api_movie_id}`)
		}

		catch (err) {
			console.error(err.message)
		}
	})
	*/
}


export default controller

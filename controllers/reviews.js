import ReviewModel from '../models/review.js'
import CommentModel from '../models/comment.js'
import {Review} from '../helpers/classes/source/main.mjs'

import {MovieDb} from 'moviedb-promise'
const moviedb = new MovieDb('3a1d8db55135a8ae41b2314190591157')

const eject = (instance) => JSON.parse(JSON.stringify(instance))

/*** REVIEW ROUTES CONTROLLER ******************************

[GET] Routes
============

/reviews?language&movieId&page
------------------------------
INDEX all reviews, filtered by movie id and paginated by page.

/reviews/:id&movieId
------------

...detailed further in README.md
***********************************************************/

const controller = (app) => {
	//+ INDEX of reviews +//
	app.get('/reviews', async (req, res) => {
		try {
			// ℹ️ queries -> ?language
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
			// ℹ️ queries -> ?language
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

/*
	// == SHOW ONE REVIEW ==
	// Show a single selected review with great detail.
	//
	// == SHOW ALL COMMENTS ==
	// ...for a particular parent review.
	app.get('/reviews/:id', async (req, res) => {
		try {
			let apiConfig = moviedb.configuration( )
			let dbComments
			let review

			if (req.query.source === 'db') {
				let dbReview = ReviewModel.findById(req.params.id).lean()
				dbComments = Comment.find({db_review_id: req.params.id}).lean()
				dbReview = await dbReview
				review = cleanReview(dbReview).fromDb( )
			}

			else if (req.query.source === 'api') {
				let apiReview = moviedb.review({id: req.params.id})
				dbComments = Comment.find({api_review_id: req.params.id}).lean()
				apiReview = await apiReview
				review = cleanReview(apiReview).fromApi( )
			}

			// We'll have to wait for the review object results,
			// 	it stores the apiMovieId that we'll be needing.
			let movie = moviedb.movieInfo({id: review.api_movie_id})

			apiConfig = await apiConfig
			apiConfig = cleanConfig(apiConfig)

			movie = await movie
			dbComments = await dbComments

			res.render('reviews-show', {
				'movie': movie,
				'review': review,
				'comments': dbComments,
			})
		}

		catch (err) {
			console.error(err.message)
		}
	})

	// == SHOW EDIT REVIEW FORM ==
	// This shows the form for updating some review.
	app.get('/reviews/:id/edit', async (req, res) => {

		try {
			let dbReview = ReviewModel.findById(req.params.id).lean()
			dbReview = await dbReview
			const review = cleanReview(dbReview).fromDb( )

			let apiMovie = moviedb.movieInfo({id: review.api_movie_id})
			apiMovie = await apiMovie
			const movie = cleanMovie(apiMovie).light( )

			res.render('reviews-edit', {
				'review': review,
				'movie': movie,
			})
		}

		catch (err) {
			console.error(err.message)
		}
	})

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

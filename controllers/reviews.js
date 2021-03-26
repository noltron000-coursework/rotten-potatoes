const Review = require('../models/review')
const Comment = require('../models/comment')
const { MovieDb } = require('moviedb-promise')
const moviedb = new MovieDb('3a1d8db55135a8ae41b2314190591157')

function reviews(app) {
	// // INDEX => SHOW ALL REVIEW
	// // COMMENTING OUT REVIEWS LANDING - SHOULD BE MOVIES LANDING
	// app.get('/reviews', (req, res) => {
	// 	res.render('reviews-index')
	// 	Review.find()
	// 	.then(reviews => {
	// 		res.render('reviews-index', { reviews: reviews })
	// 	})
	// 	.catch(err => {
	// 		console.log(err)
	// 	})
	// })

	/*********************************************************
		== SHOW ONE REVIEW ==
		Show a single selected review with great detail.
	*********************************************************/
	app.get('/reviews/:id', (req, res) => {
		try {
			let movie = moviedb.movieInfo({id: req.params.id})
			let review = Review.findById(req.params.id)
			let comments = Comment.find({reviewId: req.params.id})

			movie = await movie
			review = await review
			comments = await comments

			res.render('reviews-show', {
				'movie': movie,
				'review': review,
				'comments': comments,
			})
		}

		catch (err) {
			// catch errors
			console.error(err)
			next(err)
		}
	})
	})

	// NEW => SHOW REVIEW CREATION FORM
	// == movie route ==
	// /movies/:id/reviews/new
	app.get('/movies/:movieId/reviews/new', (req, res) => {
		const movie = moviedb.movieInfo(req.params.movieId)
			.then(movie => {
				res.render('reviews-new', { movieId: req.params.movieId, movie: movie })
			})
	})

	// EDIT => SHOW EDIT FORM FOR SINGLE REVIEW
	// == movie route ==
	// /movies/:id/reviews/:id/edit
	app.get('/reviews/:id/edit', function (req, res) {
		Review.findById(req.params.id, function (err, review) {
			res.render('reviews-edit', { review: review })
		})
	})

	// CREATE REVIEW
	// == movie route ==
	// /movies/:id/reviews/new
	app.post('/movies/:movieId/reviews', (req, res) => {
		Review.create(req.body)
			.then((review) => {
				console.log(review)
				res.redirect(`/movies/${review.movieId}/reviews/${review._id}`) // Redirect to reviews/:id
			})
			.catch((err) => {
				console.log(err.message)
			})
	})

	// UPDATE SINGLE REVIEW
	// == movie route ==
	// /movies/:id/reviews/:id
	app.put('/reviews/:id', (req, res) => {
		Review.findByIdAndUpdate(req.params.id, req.body)
			.then(review => {
				res.redirect(`/movies/${review.movieId}/reviews/${review._id}`)
			}).catch(err => {
				console.log(err.message)
			})
	})

	// DELETE SINGLE REVIEW
	// == movie route ==
	// /movies/:id/reviews/:id
	app.delete('/reviews/:id', function (req, res) {
		console.log("DELETE review")
		Review.findByIdAndRemove(req.params.id).then((review) => {
			if (req.body.admin !== undefined) {
				res.redirect("/admin")
			}
			else {
				res.redirect(`/movies/${review.movieId}`)
			}
		}).catch((err) => {
			console.log(err.message)
		})
	})
}

module.exports = reviews

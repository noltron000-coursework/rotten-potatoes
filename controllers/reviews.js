const Review = require('../models/review')
const Comment = require('../models/comment')
const { MovieDb } = require('moviedb-promise')
const moviedb = new MovieDb('3a1d8db55135a8ae41b2314190591157')

const controller = (app) => {
	/*********************************************************
		== SHOW INDEX OF ALL REVIEWS ==
		List out an overview of every review ever, one-by-one.

		== TODO ==
		How should it be sorted in the view?
		By date? By review helpfulness? Or by some calculation?

		== TODO ==
		Requires implementation.
	*********************************************************/
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
	app.get('/reviews/:id', async (req, res) => {
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
			console.error(err)
			next(err)
		}
	})

	/*********************************************************
		== SHOW NEW REVIEW FORM ==
		This shows the form for creating a new form.
		It can have a query string that pre-defines the movie.
	*********************************************************/
	app.get('/reviews/new', (req, res) => {
		try {
			res.render('reviews-new', {
				'movieId': req.query.movieId ?? null,
			})
		}

		catch (err) {
			console.error(err)
			next(err)
		}
	})

	/*********************************************************
		== SHOW EDIT REVIEW FORM ==
		This shows the form for updating some review.
	*********************************************************/
	app.get('/reviews/:id/edit', async (req, res) => {
		try {
			let review = Review.findById(req.params.id)
			review = await review

			res.render('reviews-edit', {
				'review': review
			})
		}

		catch (err) {
			console.error(err)
			next(err)
		}
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

module.exports = controller

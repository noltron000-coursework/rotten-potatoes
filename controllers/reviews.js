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
			console.error(err.message)
		}
	})

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
			console.error(err.message)
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
			console.error(err.message)
		}
	})

	/*********************************************************
		== SUBMIT A CREATED REVIEW ==
		This controls new review submissions.
	*********************************************************/
	app.post('/reviews', async (req, res) => {
		try {
			let review = Review.create(req.body)
			review = await review
			res.redirect(`/reviews/${review._id}`)
		}

		catch (err) {
			console.error(err.message)
		}
	})

	/*********************************************************
		== SUBMIT AN UPDATED MOVIE ==
		Normally, this controls movie-edit submissions.
		However there's no need with this API.
	*********************************************************/
	app.put('/reviews/:id', async (req, res) => {
		try {
			let review = Review.findByIdAndUpdate(req.params.id, req.body)
			review = await review

			res.redirect(`/reviews/${review._id}`)
		}

		catch (err) {
		 	console.log(err)
		}
	})

	/*********************************************************
		== SUBMIT A MOVIE DELETION ==
		Normally, this controls movie-deletion submissions.
		However there's no need with this API.
	*********************************************************/
	app.delete('/reviews/:id', async (req, res) => {
		try {
			let review = Review.findByIdAndRemove(req.params.id)
			review = await review

			/*
				== TODO ==
				Reenable admin functionality below.

				// if (req.body.admin !== undefined) {
				// 	res.redirect('/admin')
				// }
				// else { }
			*/

			res.redirect(`/movies/${review.movieId}`)
		}

		catch (err) {
			console.error(err.message)
		}
	})
}

module.exports = controller

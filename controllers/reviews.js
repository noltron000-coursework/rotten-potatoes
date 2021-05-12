const Review = require('../models/review')
const Comment = require('../models/comment')
const {MovieDb} = require('moviedb-promise')
const moviedb = new MovieDb('3a1d8db55135a8ae41b2314190591157')


const controller = (app) => {
	/*********************************************************
		== SHOW INDEX OF ALL REVIEWS ==
		List out an overview of every review ever, one-by-one.

		== TODO ==
		How should it be sorted in the view?
		By date? By review helpfulness? Or by some calculation?
	*********************************************************/
	app.get('/reviews', async (req, res) => {
		try {
			let reviews = Review.find( )
			reviews = await reviews

			res.render('reviews-index', {reviews})
		}

		catch (err) {
			console.error(err.message)
		}
	})

	/*********************************************************
		== SHOW NEW REVIEW FORM ==
		This shows the form for creating a new review.
		It can have a query string that pre-defines the movie.
	*********************************************************/
	app.get('/reviews/new', (req, res) => {
		try {
			res.render('reviews-new', {
				'apiMovieId': req.query.apiMovieId ?? null,
			})
		}

		catch (err) {
			console.error(err.message)
		}
	})

	/*********************************************************
		== SHOW ONE REVIEW ==
		Show a single selected review with great detail.

		== SHOW ALL COMMENTS ==
		...for a particular parent review.
	*********************************************************/
	app.get('/reviews/:id', async (req, res) => {
		try {
			let review = Review.findById(req.params.id).lean()
			let comments = Comment.find({reviewId: req.params.id}).lean()

			// We'll have to wait for the review object results,
			// 	it stores the movieId that we'll be needing.
			review = await review
			let movie = moviedb.movieInfo({id: review.movieId})

			movie = await movie
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
			let review = Review.findById(req.params.id).lean()
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
		== SUBMIT AN UPDATED REVIEW ==
		This controls review-edit submissions.
	*********************************************************/
	app.put('/reviews/:id', async (req, res) => {
		try {
			let review = Review.findByIdAndUpdate(req.params.id, req.body)
			review = await review

			res.redirect(`/reviews/${review._id}`)
		}

		catch (err) {
			console.error(err.message)
		}
	})

	/*********************************************************
		== SUBMIT A REVIEW DELETION ==
		This controls review-deletion submissions.
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

			res.redirect(`/movies/${review.apiMovieId}`)
		}

		catch (err) {
			console.error(err.message)
		}
	})
}


module.exports = controller

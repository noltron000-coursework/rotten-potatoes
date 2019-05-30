const Review = require('../models/review');
const Comment = require('../models/comment');
const MovieDB = require('moviedb-promise');
const moviedb = new MovieDB('3a1d8db55135a8ae41b2314190591157');

function reviews(app) {
	// // INDEX => SHOW ALL REVIEW
	// // COMMENTING OUT REVIEWS LANDING - SHOULD BE MOVIES LANDING
	// app.get('/reviews', (req, res) => {
	// 	res.render('reviews-index');
	// 	Review.find()
	// 	.then(reviews => {
	// 		res.render('reviews-index', { reviews: reviews });
	// 	})
	// 	.catch(err => {
	// 		console.log(err);
	// 	})
	// })

	// NEW => SHOW REVIEW CREATION FORM
	// == movie route ==
	// /movies/:id/reviews/new
	app.get('/movies/:movieId/reviews/new', (req, res) => {
		const movie = moviedb.movieInfo(req.params.movieId)
			.then(movie => {
				res.render('reviews-new', { movieId: req.params.movieId, movie: movie })
			});
	});

	// SHOW SINGLE REVIEW
	// == movie route ==
	// /movies/:id/reviews/:id
	app.get('/movies/:movieId/reviews/:id', (req, res) => {
		Review.findById(req.params.id).then(review => {
			Comment.find({ reviewId: req.params.id }).then(comments => {
				res.render('reviews-show', { review: review, comments: comments })
			})
		}).catch((err) => {
			// catch errors
			console.log(err.message)
		});
	});

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

	// EDIT => SHOW EDIT FORM FOR SINGLE REVIEW
	// == movie route ==
	// /movies/:id/reviews/:id/edit
	app.get('/reviews/:id/edit', function (req, res) {
		Review.findById(req.params.id, function (err, review) {
			res.render('reviews-edit', { review: review });
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


	// DELETE SINGLE REVIEW
	// == movie route ==
	// /movies/:id/reviews/:id
	app.delete('/reviews/:id', function (req, res) {
		console.log("DELETE review")
		Review.findByIdAndRemove(req.params.id).then((review) => {
			if (req.body.admin !== undefined) {
				res.redirect("/admin");
			}
			else {
				res.redirect(`/movies/${review.movieId}`);
			}
		}).catch((err) => {
			console.log(err.message);
		})
	})
}

module.exports = reviews

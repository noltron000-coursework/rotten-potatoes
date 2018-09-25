const Review = require('../models/review');
const Comment = require('../models/comment');

function reviews (app) {
	// // INDEX => SHOW ALL REVIEW
	// // COMMENTING OUT REVIEWS LANDING - SHOULD BE MOVIES LANDING
	// app.get('/', (req, res) => {
	// 	req.render('movies-index');
	// 	Review.find()
	// 	.then(reviews => {
	// 		res.render('reviews-index', { reviews: reviews });
	// 	})
	// 	.catch(err => {
	// 		console.log(err);
	// 	})
	// })

	// NEW => SHOW REVIEW CREATION FORM
	// refactored for movies
	app.get('/movies/:movieId/reviews/new', (req, res) => {
		res.render('reviews-new', { movieId: req.params.movieId }) //RES render?
	})

	// SHOW SINGLE REVIEW
	app.get('/reviews/:id', (req, res) => {
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
	app.put('/reviews/:id', (req, res) => {
		Review.findByIdAndUpdate(req.params.id, req.body)
		.then(review => {
			res.redirect(`/reviews/${review._id}`)
		}).catch(err => {
			console.log(err.message)
		})
	})

	// EDIT => SHOW EDIT FORM FOR SINGLE REVIEW
	app.get('/reviews/:id/edit', function (req, res) {
		Review.findById(req.params.id, function(err, review) {
			res.render('reviews-edit', {review: review});
		})
	})

	// CREATE NEW REVIEW
	app.post('/movies/:movieId/reviews', (req, res) => {
		Review.create(req.body).then((review) => {
			console.log(review)
			res.redirect(`/reviews/${review._id}`) // Redirect to reviews/:id
		}).catch((err) => {
			console.log(err.message)
		})
	})


	// DELETE SINGLE REVIEW
	app.delete('/reviews/:id', function (req, res) {
		console.log("DELETE review")
		Review.findByIdAndRemove(req.params.id).then((review) => {
			res.redirect('/');
		}).catch((err) => {
			console.log(err.message);
		})
	})
}

module.exports = reviews

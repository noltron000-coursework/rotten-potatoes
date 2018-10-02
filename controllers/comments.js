const Comment = require('../models/comment');


module.exports = function(app) {

// comments.js

	// CREATE Comment
	app.post('/reviews/comments', (req, res) => {
		Comment.create(req.body)
		.then(comment => {
			res.status(200)
			.send({ comment: comment });
		}).catch((err) => {
			res.status(400)
			.send({ err: err })
		})
	})

	// // CREATE Comment
	// app.post('/reviews/comments', (req, res) => {
	// 	Comment.create(req.body)
	// 	.then(comment => {
	// 		res.redirect(`/movies/${comment.movieId}/reviews/${comment.reviewId}`);
	// 		////// !!! Comment.MovieId invalid form...creates undefined !!! \\\\\\\
	// 	}).catch((err) => {
	// 		console.log(err.message);
	// 	});
	// });


	// NEW Comment
	app.post('/reviews/comments/', (req, res) => {
		res.send('reviews comment');
	});

	// DELETE
	app.delete('/reviews/comments/:id', function (req, res) {
		Comment.findByIdAndRemove(req.params.id)
		.then((comment) => {
			res.redirect(`/reviews/${comment.reviewId}`);
		}).catch((err) => {
			console.log(err.message);
		});
	});
};

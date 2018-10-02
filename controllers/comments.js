const Comment = require('../models/comment');

module.exports = function(app) {

	// CREATE Comment
	app.post('/reviews/comments', (req, res) => {
		console.log("CREATE comment");
		Comment.create(req.body)
		.then(comment => {
			res.status(200)
			.send({comment: comment});
		}).catch((err) => {
			res.status(400)
			.send({err: err});
		});
	});

	// DELETE
	app.delete('/reviews/comments/:id', function (req, res) {
		console.log("DELETE comment");
		Comment.findByIdAndRemove(req.params.id)
		.then(comment => {
			res.status(200)
			.send({comment: comment});
		}).catch((err) => {
			console.log(err.message);
			res.status(400)
			.send({err: err});
		});
	});
};


// // OLD Vanilla Routes (no AJAX)

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

// // DELETE Comment
// app.delete('/reviews/comments/:id', function (req, res) {
// 	console.log("DELETE comment")
// 	Comment.findByIdAndRemove(req.params.id)
// 	.then((comment) => {
// 		res.redirect(`/reviews/${comment.reviewId}`);
// 	}).catch((err) => {
// 		console.log(err.message);
// 	});
// });

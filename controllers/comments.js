const Comment = require('../models/comment');

module.exports = function(app) {

	// CREATE Comment
	app.post('/reviews/comments', (req, res) => {
		console.log('test1');
		Comment.create(req.body).then(comment => {
			res.redirect(`/reviews/${comment.reviewId}`);
		}).catch((err) => {
			console.log(err.message);
		});
	});

	// NEW Comment
	app.post('/reviews/comments/', (req, res) => {
		console.log('test2');
		res.send('reviews comment');
	});

	// DELETE
	app.delete('/reviews/comments/:id', function (req, res) {
		console.log("DELETE comment")
		Comment.findByIdAndRemove(req.params.id).then((comment) => {
			res.redirect(`/reviews/${comment.reviewId}`);
		}).catch((err) => {
			console.log(err.message);
		});
	});
};

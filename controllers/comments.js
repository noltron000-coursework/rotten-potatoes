const Comment = require('../models/comment')

module.exports = (app) => {

	// CREATE Comment
	app.post('/reviews/comments', async (req, res) => {
		try {
			let comment = Comment.create(req.body)
			comment = await comment
			res.status(200).send({comment})
		}
		catch (err) {
			console.error(err.message)
			res.status(400).send({err})
		}
	})

	// DELETE
	app.delete('/reviews/comments/:id', async (req, res) => {
		try {
			let comment = Comment.findByIdAndRemove(req.params.id)
			comment = await comment
			res.status(200).send({comment: comment});
		}
		catch (err) {
			console.log(err.message);
			res.status(400).send({err})
		}
	})
}

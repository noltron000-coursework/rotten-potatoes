const Review = require('../models/review')

const controller = (app) => {

	// NEW Comment
	app.get('/admin', (req, res) => {
		Review.find()
		.then(reviews => {
			res.render('admin', { reviews: reviews })
		}).catch(error => {
			console.log(error)
		})
	})
}

module.exports = controller

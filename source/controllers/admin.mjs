import Review from '../models/review.mjs'

const controller = (app) => {

	// NEW Comment
	app.get('/admin', (req, res) => {
		Review.find()
		.then(reviews => {
			res.render('admin', { reviews: reviews })
		}).catch(error => {
			console.error(error)
		})
	})
}

export default controller

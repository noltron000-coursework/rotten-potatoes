const Review = require('../models/review')

module.exports = function(app) {

	// NEW Comment
	app.get('/admin', (req, res) => {
		Review.find()
		.then(reviews => {
			res.render('admin', { reviews: reviews });
		}).catch(error => {
			console.log(error);
		});
	});
}
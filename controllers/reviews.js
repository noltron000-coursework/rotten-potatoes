//
// https://github.com/MakeSchool-Tutorials/Node-Rotten-Potatoes/issues/3
//
// const Review = require('./models/review');
//
// export default function (app) {
// 	app.get('/', (req, res) => {
// 		Review.find().then(reviews => {
// 				res.render('reviews-index', {
// 					reviews: reviews
// 				})
// 			}).catch(err => {
// 				console.log(err)
// 			})
// 	})
// }

module.exports = function (app, Review) {

	app.get('/', (req, res) => {
		Review.find()
			.then(reviews => {
				res.render('reviews-index', {reviews: reviews});
			})
			.catch(err => {
				console.log(err);
			});
	});

}

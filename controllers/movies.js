const Review = require('../models/review')
const Comment = require('../models/comment')
const { MovieDb } = require('moviedb-promise')
const moviedb = new MovieDb('3a1d8db55135a8ae41b2314190591157')

function movies (app) {

	// INDEX => SHOW ALL MOVIES
	app.get('/', (req, res) => {
		moviedb.movieNowPlaying()
		.then(response => {
			res.render('movies-index', {
				movies: response.results
			})
			// console.log(response.results)
		}).catch((err) => {
			console.log(err.message)
		})
	})

	// NEW => SHOW MOVIE CREATION FORM
	// There is no need to create new movies!

	// SHOW ROUTE? ADDING BEFORE SHOW SINGLE. IT WORKS. MK!
	app.get('/movies/:id', (req, res) => {
		moviedb.movieInfo({ id: req.params.id }).then(movie => {
			Review.find({ movieId: req.params.id }).then(reviews => {
				// // AUTO POPULATE MONGOOSE
				// // FERDINAND
				// console.log(reviews)
				// for (var review in reviews) {
				// 	Comment.find({}).then(comments => {
				// 		review.comments = comments
				// 		console.log(review._id)
				// 		console.log(comments)
				// 	}).catch(console.error)
				// }
				res.render('movies-show', { movie: movie, reviews: reviews })
			})
		}).catch(console.error)
	})


	// SHOW SINGLE MOVIE
	app.get('/movies/:id', (req, res) => {
		moviedb.movieInfo({
			id: req.params.id
		}).then(movie => {
			// if (movie.video) {
				moviedb.movieVideos({
					id: req.params.id
				}).then(videos => {
					movie.trailer_youtube_id = videos.results[0].key
					renderTemplate(movie)
				})
			function renderTemplate(movie) {
				Review.find({
					movieId: req.params.id
				}).then(reviews => {
					res.render('movies-show', {
						movie: movie,
						reviews: reviews
					})
				})
			}
		}).catch(console.error)
	})


	// UPDATE MOVIE
	// There is no need to update movies!

	// EDIT MOVIE
	// There is no need to edit movies!

	// CREATE MOVIE
	// There is no need to create movies!

	// DELETE MOVIE
	// There is no need to delete movies!
}


module.exports = movies

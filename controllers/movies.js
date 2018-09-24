const MovieDb = require('moviedb-promise')
const moviedb = new MovieDb('3a1d8db55135a8ae41b2314190591157')

function movies (app) {

	// INDEX => SHOW ALL MOVIES
	app.get('/', (req, res) => {
		moviedb.miscNowPlayingMovies()
		.then(response => {
			res.render('movies-index', {
				movies: response.results
			});
		}).catch((err) => {
			console.log(err.message);
		});
	});


	app.get('/movies/:id', (req, res) => {
		moviedb.movieInfo({id: req.params.id})
		.then(movie => {
			res.render('movies-show', {
				movie: movie
			});
		}).catch((err) => {
			console.log(err.message);
		});
	});


	// app.get('/movies/:id', (req, res) => {
	// 	moviedb.movieInfo({ id: req.params.id })
	// 	.then(movie => {
	// 		if (movie.video) {
	// 			moviedb.movieVideos({ id: req.params.id }).then(videos => {
	// 				movie.trailer_youtube_id = videos.results[0].key
	// 				renderTemplate(movie)
	// 			})
	// 		} else {
	// 			renderTemplate(movie)
	// 		}
	// 		function renderTemplate(movie) {
	// 			res.render('movies-show', { movie: movie });
	// 		}
	// 	}).catch(console.error)
	// })

	// // SHOW SINGLE REVIEW
	// app.get('/reviews/:id', (req, res) => {
	// 	Review.findById(req.params.id)
	// 	.then(review => {
	// 		Comment.find({ reviewId: req.params.id })
	// 		.then(comments => {
	// 			res.render('reviews-show', {
	// 				review: review,
	// 				comments: comments
	// 			});
	// 		})
	// 	}).catch((err) => {
	// 		console.log(err.message)
	// 	});
	// });
}


module.exports = movies
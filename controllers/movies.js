const Review = require('../models/review')
const Comment = require('../models/comment')
const { MovieDb } = require('moviedb-promise')
const moviedb = new MovieDb('3a1d8db55135a8ae41b2314190591157')

const movies = (app) => {
	/*********************************************************
		== INDEX ALL MOVIES ==
		List out an overview of all movies one-by-one.
	*********************************************************/
	app.get('/', (req, res) => {
		moviedb.movieNowPlaying()
		.then(response => {
			res.render('movies-index', {
				movies: response.results
			})
		}).catch((err) => {
			console.log(err.message)
		})
	})

	/*********************************************************
		== SHOW ONE MOVIE ==
		Show a single selected movie with great detail.
	*********************************************************/
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

	/*********************************************************
		== SHOW NEW MOVIE FORM ==
		Normally, this shows the form for creating a new movie.
		However there's no need with this API.
	*********************************************************/

	/*********************************************************
		== SHOW EDIT MOVIE FORM ==
		Normally, this shows the form for updating some movie.
		However there's no need with this API.
	*********************************************************/

	/*********************************************************
		== SUBMIT A CREATED MOVIE ==
		Normally, this controls new movie submissions.
		However there's no need with this API.
	*********************************************************/

	/*********************************************************
		== SUBMIT AN UPDATED MOVIE ==
		Normally, this controls movie-edit submissions.
		However there's no need with this API.
	*********************************************************/

	/*********************************************************
		== SUBMIT A MOVIE DELETION ==
		Normally, this controls movie-deletion submissions.
		However there's no need with this API.
	*********************************************************/
}

module.exports = movies

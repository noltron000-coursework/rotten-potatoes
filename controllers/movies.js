const Review = require('../models/review')
const Comment = require('../models/comment')
const { MovieDb } = require('moviedb-promise')
const moviedb = new MovieDb('3a1d8db55135a8ae41b2314190591157')


const controller = (app) => {
	/*********************************************************
		== INDEX ALL MOVIES ==
		List out an overview of all movies one-by-one.
	*********************************************************/
	app.get('/', async (req, res) => {

		try {
			let movies = moviedb.movieNowPlaying()

			movies = await movies

			res.render('movies-index', {
				'movies': movies.results
			})
		}

		catch {
			return next(error)
		}
	})

	/*********************************************************
		== SHOW ONE MOVIE ==
		Show a single selected movie with great detail.
	*********************************************************/
	app.get('/movies/:id', async (req, res) => {
		try {
			let movie = moviedb.movieInfo({'id': req.params.id})
			let videos = moviedb.movieVideos({'id': req.params.id})
			let reviews = Review.find({'movieId': req.params.id})

			movie = await movie
			videos = await videos
			reviews = await reviews

			// for some reason, movie.video is always false.
			delete movie.video

			// instead, set the given videos into the object.
			movie.videos = { }
			movie.videos.featured_video = videos.results.shift()
			movie.videos.other_videos = videos.results

			// render movie results
			res.render('movies-show', {
				'movie': movie,
				'reviews': reviews,
			})
		}

		catch {
			return next(error)
		}
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

module.exports = controller

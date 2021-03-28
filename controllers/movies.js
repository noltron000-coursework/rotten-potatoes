const Review = require('../models/review')
const Comment = require('../models/comment')
const { MovieDb } = require('moviedb-promise')
const moviedb = new MovieDb('3a1d8db55135a8ae41b2314190591157')


const controller = (app) => {
	/*********************************************************
		== SHOW INDEX OF ALL MOVIES ==
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

		catch (err) {
			console.error(err.message)
		}
	})


	/*********************************************************
		== SHOW NEW MOVIE FORM ==
		Normally, this shows the form for creating a new movie.
		However there's no need with this API.
	*********************************************************/
	// nothing to show here!


	/*********************************************************
		== SHOW ONE MOVIE ==
		Show a single selected movie with great detail.
		This route is also the root for reviews of one movie.
	*********************************************************/
	app.get('/movies/:id', async (req, res) => {
		try {
			let movie = moviedb.movieInfo({id: req.params.id})
			let videos = moviedb.movieVideos({id: req.params.id})
			let reviews = Review.find({movieId: req.params.id}).lean()
			movie = await movie
			videos = await videos
			reviews = await reviews

			/*
				== TODO ==
				This part for videos is a bit hacky.
				Maybe it should also be passed into render?
			*/

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

		catch (err) {
			console.error(err.message)
		}
	})


	/*********************************************************
		== SHOW EDIT MOVIE FORM ==
		Normally, this shows the form for updating some movie.
		However there's no need with this API.
	*********************************************************/
	// nothing to show here!


	/*********************************************************
		== SUBMIT A CREATED MOVIE ==
		Normally, this controls new movie submissions.
		However there's no need with this API.
	*********************************************************/
	// nothing to show here!


	/*********************************************************
		== SUBMIT AN UPDATED MOVIE ==
		Normally, this controls movie-edit submissions.
		However there's no need with this API.
	*********************************************************/
	// nothing to show here!


	/*********************************************************
		== SUBMIT A MOVIE DELETION ==
		Normally, this controls movie-deletion submissions.
		However there's no need with this API.
	*********************************************************/
	// nothing to show here!
}

module.exports = controller

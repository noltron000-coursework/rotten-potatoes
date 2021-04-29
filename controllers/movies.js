const Review = require('../models/review')
const Comment = require('../models/comment')

const { MovieDb } = require('moviedb-promise')
const moviedb = new MovieDb('3a1d8db55135a8ae41b2314190591157')

// Helpers for certain API calls.
const { cleanMovie } = require('../helpers/response-cleaners/movie.js')


const controller = (app) => {
	/*********************************************************
		== SHOW INDEX OF ALL MOVIES ==
		List out an overview of all movies one-by-one.
	*********************************************************/
	app.get('/', (req, res) => {
		res.render('homepage')
	})

	app.get('/movies', async (req, res) => {

		try {
			// Determine which movie list to use and grab it.
			let apiMovieList
			let selection

			if (req.query.show === 'popular') {
				apiMovieList = moviedb.moviePopular( )
				selection = 'Popular Movies'
			}
			else if (req.query.show === 'top-rated') {
				apiMovieList = moviedb.movieTopRated( )
				selection = 'Top Rated Movies'
			}
			else if (req.query.show === 'upcoming') {
				apiMovieList = moviedb.upcomingMovies( )
				selection = 'Upcoming Movies'
			}
			else { // if (req.query.show === 'now-playing') {
				apiMovieList = moviedb.movieNowPlaying( )
				selection = 'Movies Playing Now'
			}

			// await the promised list.
			apiMovieList = await apiMovieList
			apiMovieList.results = apiMovieList.results.map(
				(movie) => cleanMovie(movie).light( )
			)

			res.render('movies-index', {movieList: apiMovieList, selection})
		}

		catch (err) {
			console.error(err.message)
			res.status(400).send({err})
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
			let apiMovie = moviedb.movieInfo({id: req.params.id})
			let apiReviews = moviedb.movieReviews({id: req.params.id})
			let apiReleases = moviedb.movieReleaseDates({id: req.params.id})
			let apiVideos = moviedb.movieVideos({id: req.params.id})
			let dbReviews = Review.find({movieId: req.params.id}).lean()

			apiReviews = await apiReviews
			// apiReviews only has a couple of reviews per page.
			// however, we want all of the reviews.
			// we'll have to iteratively make promises for each page,
			// and then resolve all of them.
			{
				// initialize aethereal variables
				const apiReviewsCollections = { }
				const apiReviewsResults = [ ]

				// get promises per-page
				for (let page = 1; page <= apiReviews.total_pages; page++) {
					apiReviewsPage = moviedb.movieReviews({id: req.params.id, page: page})
					apiReviewsCollections[page] = apiReviewsPage
				}

				// resolve promises per-page
				for (let page = 1; page <= apiReviews.total_pages; page++) {
					apiReviewsCollections[page] = await apiReviewsCollections[page]
					apiReviewsResults.push(...apiReviewsCollections[page].results)
				}

				// apply modifications
				apiReviews.results = apiReviewsResults
			}

			apiMovie = await apiMovie
			apiVideos = await apiVideos
			apiReleases = await apiReleases
			dbReviews = await dbReviews

			// Use helpers to clean the movie data.
			const movie = cleanMovie(apiMovie).heavy({
				apiReviews,
				apiVideos,
				apiReleases,
				dbReviews,
			})

			// Send the markup to the frontend javascript.
			res.render('movies-show', {movie})
		}

		catch (err) {
			console.error(err.message)
			res.status(400).send({err})
		}
	})


	/*********************************************************
		== FLASH ONE MOVIE ==
		the flash route is used for a "lighter" focused look within the index.
		its like show, but renders only a partial to be used within the document.
	*********************************************************/
	app.get('/movie/:id/flash', async (req, res) => {
		try {
			let apiMovie = moviedb.movieInfo({id: req.params.id})
			let apiReviews = moviedb.movieReviews({id: req.params.id})
			let apiVideos = moviedb.movieVideos({id: req.params.id})
			let apiReleases = moviedb.movieReleaseDates({id: req.params.id})
			let dbReviews = Review.find({movieId: req.params.id}).lean()

			apiMovie = await apiMovie
			apiReviews = await apiReviews
			apiVideos = await apiVideos
			apiReleases = await apiReleases
			dbReviews = await dbReviews

			// Use helpers to clean the movie data.
			const movie = cleanMovie(apiMovie).heavy({
				apiReviews,
				apiVideos,
				apiReleases,
				dbReviews,
			})

			// Send the markup to the frontend javascript.
			res.render('partials/movies-index/movie-details', {layout: false, movie})
		}

		catch (err) {
			console.error(err.message)
			res.status(400).send({err})
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

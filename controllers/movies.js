import ReviewModel from '../models/review.js'
import {Movie} from '../helpers/classes/source/main.mjs'

import {MovieDb} from 'moviedb-promise'
const moviedb = new MovieDb('3a1d8db55135a8ae41b2314190591157')

const eject = (instance) => JSON.parse(JSON.stringify(instance))

/*** MOVIE ROUTES CONTROLLER *******************************

[GET] Routes
============

/movies?sortby&page&language&region
-----------------------------------
INDEX all movies, sorting by given parameter.

/movies/:id
-----------
SHOW one movie in detail.


/meta/movies/:id/details
------------------------------
This route obtains a document fragment of a movie's details.

/meta/movies/:id/reviews/page?pages
-----------------------------------
This route calls ".../page/:page" for each given parameter.

/meta/movies/:id/reviews/page/:page
-----------------------------------
This route obtains a document fragment of review cards.

...detailed further in README.md
***********************************************************/

const controller = (app) => {
	app.get('/', (req, res) => {
		res.render('homepage')
	})

	//+ INDEX of movies +//
	app.get('/movies', async (req, res) => {
		try {
			// ℹ️ queries -> ?sortby &page &language &region
			let {sortby, page, language, region} = req.query
			const parameters = {page, language, region}

			// 📥️ fetch info from the api.
			let apiConfig = moviedb.configuration( )

			// decide the title string & which movie list to fetch.
			let apiMovies, title
			if (sortby === 'popular') {
				apiMovies = moviedb.moviePopular(parameters)
				title = 'Popular Movies'
			}
			else if (sortby === 'top-rated') {
				apiMovies = moviedb.movieTopRated(parameters)
				title = 'Top Rated Movies'
			}
			else if (sortby === 'upcoming') {
				apiMovies = moviedb.upcomingMovies(parameters)
				title = 'Upcoming Movies'
			}
			else { // if (sortby === 'now-playing') {
				apiMovies = moviedb.movieNowPlaying(parameters)
				title = 'Movies Playing Now'
			}

			// ⏱️ await fetched resources.
			apiConfig = await apiConfig
			apiMovies = await apiMovies

			// 📇 wrap the resposes into well-structured json.
			const pagination = {
				page: apiMovies.page,
				results: apiMovies.results.length,
				totalPages: apiMovies.total_pages,
				totalResults: apiMovies.total_results,
			}

			apiMovies = apiMovies.results.map((apiMovie) => {
				return eject(new Movie({
					config: apiConfig,
					movie: apiMovie,
				}))
			})

			// 📤️ send the data to the frontend.
			res.render('movies-index', {apiMovies, pagination, title})
		}
		catch (err) {
			console.error(err.message)
			res.status(400).send({err})
		}
	})

	//+ SHOW movie details +//
	app.get('/movies/:id', async (req, res) => {
		try {
			let apiMovie = moviedb.movieInfo({id: req.params.id})
			let apiReviews = moviedb.movieReviews({id: req.params.id})
			let apiReleases = moviedb.movieReleaseDates({id: req.params.id})
			let apiVideos = moviedb.movieVideos({id: req.params.id})
			let apiImages = moviedb.movieImages({id: req.params.id})
			let dbReviews = ReviewModel.find({api_movie_id: req.params.id}).lean()
			let apiConfig = moviedb.configuration( )

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
					const apiReviewsPage = moviedb.movieReviews({id: req.params.id, page: page})
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

			apiConfig = await apiConfig
			apiMovie = await apiMovie
			apiVideos = await apiVideos
			apiImages = await apiImages
			apiReleases = await apiReleases
			dbReviews = await dbReviews

			// Use helpers to clean the movie data.
			let movie = new Movie({
				config: apiConfig,
				movie: apiMovie,
				reviews: [...dbReviews, ...apiReviews],
				videos: apiVideos,
				images: apiImages,
				releases: apiReleases,
			})

			// Eject to work-around handlebars not-own properties.
			movie = eject(movie)

			// Send the markup to the frontend javascript.
			res.render('movies-show', {movie})
		}

		catch (err) {
			console.error(err.message)
			res.status(400).send({err})
		}
	})

	//+ get the details fragment for index +//
	app.get('/movies/:id/flash', async (req, res) => {
		try {
			let apiMovie = moviedb.movieInfo({id: req.params.id})
			let apiReviews = moviedb.movieReviews({id: req.params.id})
			let apiVideos = moviedb.movieVideos({id: req.params.id})
			let apiImages = moviedb.movieImages({id: req.params.id})
			let apiReleases = moviedb.movieReleaseDates({id: req.params.id})
			let dbReviews = ReviewModel.find({api_movie_id: req.params.id}).lean()

			apiMovie = await apiMovie
			apiReviews = await apiReviews
			apiVideos = await apiVideos
			apiImages = await apiImages
			apiReleases = await apiReleases
			dbReviews = await dbReviews

			// Use helpers to clean the movie data.
			let movie = new Movie({
				config: apiConfig,
				movie: apiMovie,
				reviews: apiReviews,
				videos: apiVideos,
				posters: apiImages.posters,
				backdrops: apiImages.backdrops,
				releases: apiReleases,
				// dbReviews,
			})

			movie = eject(movie)

			// Send the markup to the frontend javascript.
			res.render('partials/movie-card/details', {layout: false, movie})
		}

		catch (err) {
			console.error(err.message)
			res.status(400).send({err})
		}
	})
}


export default controller

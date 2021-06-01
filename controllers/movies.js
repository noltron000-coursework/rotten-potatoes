import ReviewModel from '../models/review.js'
import {Movie} from '../helpers/classes/source/main.mjs'

import {MovieDb} from 'moviedb-promise'
const moviedb = new MovieDb('3a1d8db55135a8ae41b2314190591157')

const eject = (instance) => JSON.parse(JSON.stringify(instance))

/*** MOVIE ROUTES CONTROLLER *******************************

[GET] Routes
============

/movies?sortBy&page&language&region
-----------------------------------
INDEX all movies, sorting by given parameter.

/movies/:id
-----------
SHOW one movie in detail.

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
			// ℹ️ queries -> ?sortBy &page &language &region
			let {sortBy, page, language, region} = req.query

			// set parameters from the inputs.
			const parameters = {page, language, region}

			// 📥️ fetch info from the api.
			let apiConfig = moviedb.configuration( )

			// decide the title string & which movie list to fetch.
			let apiMovies, title
			if (sortBy === 'popular') {
				apiMovies = moviedb.moviePopular(parameters)
				title = 'Popular Movies'
			}
			else if (sortBy === 'top-rated') {
				apiMovies = moviedb.movieTopRated(parameters)
				title = 'Top Rated Movies'
			}
			else if (sortBy === 'upcoming') {
				apiMovies = moviedb.upcomingMovies(parameters)
				title = 'Upcoming Movies'
			}
			else { // if (sortBy === 'now-playing') {
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
			res.render('movies-index', {movies: apiMovies, pagination, title})
		}
		catch (err) {
			console.error(err.message)
			res.status(400).send({err})
		}
	})

	//+ SHOW movie details +//
	app.get('/movies/:id', async (req, res) => {
		try {
			// ℹ️ params -> :id
			let {id} = req.params
			// ℹ️ queries -> ?language &fragment
			let {fragment, language} = req.query

			// set parameters from the inputs.
			const parameters = {
			 	append_to_response: 'images,releases,reviews,videos',
				id,
				language,
			}

			// 📥️ fetch info from the api.
			let apiConfig = moviedb.configuration( )
			let apiMovie = moviedb.movieInfo(parameters)
			// ⚠️ INCLUDE THE DB REVIEW
			// dbReviews = ReviewModel.find({api_movie_id: req.params.id}).lean()

			// ⏱️ await fetched resources.
			apiConfig = await apiConfig
			apiMovie = await apiMovie

			// 📇 wrap the resposes into well-structured json.
			apiMovie = eject(new Movie({
				config: apiConfig,
				movie: apiMovie,
			}))

			// 📤️ send the data to the frontend.
			if (fragment === 'details') {
				res.render('partials/movie-card/details', {layout: false, movie: apiMovie})
			}
			else {
				res.render('movies-show', {movie: apiMovie})
			}
		}
		catch (err) {
			console.error(err.message)
			res.status(400).send({err})
		}
	})
}


export default controller

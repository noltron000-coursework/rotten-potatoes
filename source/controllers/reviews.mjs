import ReviewModel from '../models/review.mjs'
import CommentModel from '../models/comment.mjs'
import {Config, Movie, Review} from '../api/main.mjs'
import moviedb from '../helpers/movie-db.mjs'

const eject = (instance) => JSON.parse(JSON.stringify(instance))

/*** REVIEW ROUTES CONTROLLER ******************************

[GET] Routes
============

/reviews?language&movieId&page
------------------------------
INDEX all reviews, filtered by movie id and paginated by page.

/reviews/new
------------
Display a NEW review creation form displayed.

/reviews/:id?source
-------------------
SHOW one review in great detail.

/reviews/:id/edit
-----------------
Display an EDIT form for an existant review.

[POST] Routes
=============

/reviews
--------
CREATE a review from given information.

[PUT] Routes
============

/reviews/:id
------------
UPDATE a review with given information.

[DELETE] Routes
===============

/reviews/:id
------------
DELETE a review from the database.

...detailed further in README.md
***********************************************************/

const controller = (app) => {
	//+ INDEX of reviews +//
	app.get('/reviews', async (req, res) => {
		try {
			// ℹ️ queries -> ?movieId &language &page
			let {
				fragment,
				movieId: id,
				language,
				page,
				source = 'api'
			} = req.query

			// refer to main page on an invalid id entry.
			if (id == undefined) {
				res.redirect('/')
				return // dont mess with headers anymore
			}

			// set parameters from the inputs.
			const parameters = {id, language, page}

			let reviews
			let pagination
			if (source === 'api') {
				// 📥️ fetch info from the api.
				let apiConfig = moviedb.configuration( )
				let apiReviews = moviedb.movieReviews(parameters)

				// ⏱️ await fetched resources.
				apiConfig = await apiConfig
				apiReviews = await apiReviews

				// 📇 wrap the resposes into well-structured json.
				pagination = {
					page: apiReviews.page,
					results: apiReviews.results.length,
					totalPages: apiReviews.total_pages,
					totalResults: apiReviews.total_results,
				}

				apiReviews = apiReviews.results.map((apiReview) => {
					return eject(new Review({
						config: apiConfig,
						review: apiReview,
					}))
				})

				reviews = apiReviews
			}
			else if (source === 'db') {
				// 📥️ fetch info from the db.
				let dbReviews = ReviewModel.find({api_movie_id: id})

				// ⏱️ await fetched resources.
				dbReviews = await dbReviews

				// 📇 wrap the resposes into well-structured json.
				dbReviews = dbReviews.map((dbReview) => {
					return eject(new Review({review: dbReview}))
				})

				reviews = dbReviews
			}

			// 📤️ send the data to the frontend.
			if (fragment) {
				res.render(
					'partials/reviews-list',
					{template: false, reviews}
				)
			}
			else {
				res.json({reviews: reviews, pagination})
			}
		}
		catch (err) {
			console.error(err.message)
			res.status(400).send({err})
		}
	})

	//+ NEW review fillout-form +//
	app.get('/reviews/new', async (req, res) => {
		try {
			// ℹ️ queries -> ?movieId
			let {/*fragment,*/ movieId} = req.query

			// 📥️ fetch info from the api.
			let apiConfig = moviedb.configuration( )
			let apiMovie = moviedb.movieInfo({id: movieId})

			// ⏱️ await fetched resources.
			apiConfig = await apiConfig
			apiMovie = await apiMovie

			// 📇 wrap the resposes into well-structured json.
			apiMovie = eject(new Movie({
				config: apiConfig,
				movie: apiMovie,
			}))

			// 📤️ send the data to the frontend.
			res.render('reviews-new', {movie: apiMovie})
		}
		catch (err) {
			console.error(err.message)
			res.status(400).send({err})
		}
	})

	//+ SHOW review details +//
	app.get('/reviews/:id', async (req, res) => {
		/*
			Reviews have two independent sources. A database review is looked
			up by its MongoDB id and links to a movie by api_movie_id. An API
			review is looked up by its TMDB review id and links to a movie by
			media_id. Both helpers return the same view data shape so the route
			does not need to know how either source is fetched or parsed.
		*/
		const getReviewFromDb = async (id) => {
			// A missing database review is a normal not-found result; the route
			// turns null into an HTTP 404 response.
			const review = await ReviewModel.findById(id).lean()
			if (!review) return null
			const movieId = review.api_movie_id

			// Load data for the config, the movie, and comments.
			const [
				apiMovie,
				apiConfig,
				dbComments,
			] = await Promise.all([
				moviedb.movieInfo({id: movieId}),
				moviedb.configuration(),
				// Load DB comments from their DB review ID.
				CommentModel.find({db_review_id: id}).lean(),
			])


			// Normalize DB movie/review payloads before passing them to the shared template.
			const config = new Config({config: apiConfig})
			const movie = new Movie({config, movie: apiMovie})

			// Normalize the stored review with the same wrapper used for API reviews.
			const parsedReview = new Review({
				config,
				// The Review wrapper currently ignores comments; retain this
				// input for when comment support is wired into that class.
				comments: dbComments,
				review,
			})

			return {
				movie: eject(movie),
				review: eject(parsedReview),
			}
		}

		const getReviewFromApi = async (id) => {
			// Fetch the TMDB review first because its media_id identifies the
			// movie whose details are needed for the page.
			const review = await moviedb.review({id})
			const movieId = review.media_id

			// Load data for the config, the movie, and comments.
			const [
				apiConfig,
				apiMovie,
				dbComments,
			] = await Promise.all([
				moviedb.configuration(),
				moviedb.movieInfo({id: movieId}),
				// Load DB comments from their API review ID.
				CommentModel.find({api_review_id: id}).lean(),
			])

			// Normalize TMDB movie/review payloads before passing them to the shared template.
			const config = new Config({config: apiConfig})
			const movie = new Movie({config, movie: apiMovie})

			const parsedReview = new Review({
				config,
				// The Review wrapper currently ignores comments; retain this
				// input for when comment support is wired into that class.
				comments: dbComments,
				review,
			})

			return {
				movie: eject(movie),
				review: eject(parsedReview),
			}
		}

		try {
			const {id} = req.params
			const {source} = req.query

			// Do not infer the source from the id: MongoDB and TMDB ids belong to
			// separate namespaces and can have different formats.
			let getReview = undefined
			if (source === 'db') getReview = getReviewFromDb
			else if (source === 'api') getReview = getReviewFromApi
			else {
				res.status(400).send({err: 'Review source must be "db" or "api"'})
				return
			}

			// Both helpers share the same not-found contract despite fetching
			// from different systems.
			const reviewData = await getReview(id)
			if (!reviewData) {
				res.status(404).send({err: 'Review not found'})
				return
			}

			res.render('reviews-show', reviewData)
		}
		catch (err) {
			console.error(err.message)
			res.status(400).send({err})
		}
	})

	//+ EDIT review fillout-form +//
	// ⚠️ Route only functional for db-based reviews!
	app.get('/reviews/:id/edit', async (req, res) => {
		try {
			// ℹ️ params -> :id
			let {id} = req.params

			// 📥️ fetch info from the api.
			let dbReview = ReviewModel.findById(id).lean( )

			// ⏱️ await fetched resources.
			dbReview = await dbReview
			if (!dbReview) {
				res.status(404).send({err: 'Review not found'})
				return
			}

			let apiMovie = moviedb.movieInfo({id: dbReview.api_movie_id})  // ⚠️ KEY NAME MAY CHANGE IN DB
			apiMovie = await apiMovie

			// 📇 wrap the resposes into well-structured json.
			dbReview = eject(new Review({review: dbReview}))
			apiMovie = eject(new Movie({movie: apiMovie}))

			// 📤️ send the data to the frontend.
			res.render('reviews-edit', {
				review: dbReview,
				movie: apiMovie,
			})
		}
		catch (err) {
			console.error(err.message)
			res.status(400).send({err})
		}
	})

	//+ CREATE a review from given information +//
	app.post('/reviews', async (req, res) => {
		try {
			// ℹ️ body -> content, rating, title, movieId, authorName, authorAvatar
			let {authorAvatar, authorName, content, movieId, rating, title} = req.body

			// 📥️ fetch info from the api.
			let apiMovie = moviedb.movieInfo({id: movieId})

			// ⏱️ await needed resources.
			apiMovie = await apiMovie

			// 🚧 Have to set things up in the submodule here!!!!

			// 📇 wrap the body into well-structured json.
			apiMovie = new Movie({movie: apiMovie})

			let dbReview = {
				api_movie_id: movieId,
				author: {
					avatar_path: authorAvatar,
					username: authorName,
				},
				content,
				created_at: Date.now( ),
				rating,
				//// revised_at: Date.now( ),
				title,
			}

			dbReview = eject(new Review({
				review: dbReview,
				movie: apiMovie,
			}))
			dbReview.api_movie_id = movieId
			apiMovie = eject(apiMovie)

			// 💾 save to database
			dbReview = ReviewModel.create(dbReview)

			// ⏱️ await fetched resources.
			dbReview = await dbReview

			// 📇 wrap the resposes into well-structured json.
			dbReview = eject(new Review({review: dbReview}))

			// 📤️ send the data to the frontend.
			res.redirect(`/reviews/${dbReview.ids.db}?source=db`)
		}
		catch (err) {
			console.error(err.message)
			res.status(400).send({err})
		}
	})

	//+ UPDATE a review with given information +//
	app.put('/reviews/:id', async (req, res) => {
		try {
			// ℹ️ body -> content, rating, title, movieId, authorName, authorAvatar
			let {authorAvatar, authorName, content, movieId, rating, title} = req.body
			// ℹ️ params -> :id
			let {id} = req.params

			// 📥️ fetch info from the api.
			let apiMovie = moviedb.movieInfo({id: movieId})

			// ⏱️ await needed resources.
			apiMovie = await apiMovie

			// 📇 wrap the body into well-structured json.
			apiMovie = new Movie({movie: apiMovie})

			let dbReview = {
				api_movie_id: movieId,
				author: {
					avatar_path: authorAvatar,
					username: authorName,
				},
				content,
				//// created_at: Date.now( )
				rating,
				revised_at: Date.now( ),
				title,
			}

			dbReview = eject(new Review({
				review: dbReview,
				movie: apiMovie,
			}))
			apiMovie = eject(apiMovie)

			// 💾 save to database
			dbReview = ReviewModel.findByIdAndUpdate(id, dbReview)

			// ⏱️ await fetched resources.
			dbReview = await dbReview
			if (!dbReview) {
				res.status(404).send({err: 'Review not found'})
				return
			}

			// 📇 wrap the resposes into well-structured json.
			dbReview = eject(new Review({review: dbReview}))

			// 📤️ send the data to the frontend.
			res.redirect(`/reviews/${dbReview.ids.db}?source=db`)
		}
		catch (err) {
			console.error(err.message)
			res.status(400).send({err})
		}
	})

	//+ DELETE a review +//
	app.delete('/reviews/:id', async (req, res) => {
		try {
			// ℹ️ params -> :id
			let {id} = req.params

			// 💾 save to database.
			let dbReview = ReviewModel.findByIdAndRemove(id)

			// ⏱️ await fetched resources.
			dbReview = await dbReview
			if (!dbReview) {
				res.status(404).send({err: 'Review not found'})
				return
			}
			let {api_movie_id: movieId} = dbReview

			/*
			// == TODO ==
			// Reenable admin functionality below.
			if (req.body.admin !== undefined) {
				res.redirect('/admin')
			}
			else { }
			*/

			// 📤️ send the data to the frontend.
			res.redirect(`/movies/${movieId}`)
		}
		catch (err) {
			console.error(err.message)
			res.status(400).send({err})
		}
	})
}

export default controller

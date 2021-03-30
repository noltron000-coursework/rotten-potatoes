const Review = require('../models/review')
const Comment = require('../models/comment')
const { MovieDb } = require('moviedb-promise')
const moviedb = new MovieDb('3a1d8db55135a8ae41b2314190591157')


const controller = (app) => {
	/*********************************************************
		== SHOW INDEX OF ALL MOVIES ==
		List out an overview of all movies one-by-one.
	*********************************************************/
	app.get('/', (req, res) => {
		res.redirect('/movies')
	})

	app.get('/movies', async (req, res) => {

		try {
			// Get the movies first.
			const promisedMovies = moviedb.movieNowPlaying()
			const responseMovies = await promisedMovies
			const movies = responseMovies.results

			/*
				We'll be needing videos and ratings for each movie.
				Those features aren't included in the movie object.
				Because I don't want to modify that object,
					I'll have to forge a helper object for metadata.
			*/

			// Set up a mapper function, it will take in a movie,
			// 	but will return a promise that resolves to metadata.
			const metadataMapper = async (movie) => {
				// Set up a returnable metadata entry.
				// Notice it *only* has one key: the movie ID.
				// It will later be merged with other movies,
				// 	so the movie ID is important.
				const metadata = {
					[movie.id]: {
						'featured_video': '',
						'number_of_ratings': 0,
						'sum_total_rating': 0,
						'average_rating': 0,
					},
				}

				// Find any and all videos and reviews for this movie.
				// This is where the bulk of the promises will happen.
				const promisedVideos = moviedb.movieVideos({id: movie.id})
				const promisedReviews = Review.find({movieId: movie.id}).lean( )
				const responseVideos = await promisedVideos
				const responseReviews = await promisedReviews

				/* Deal with Videos */
				// Set video to first (most recent) posting.
				metadata[movie.id].featured_video = responseVideos.results[0]

				/* Deal with Reviews/Ratings */
				// Create a reducer to determine aggregated movie rating.
				const ratingsReducer = (ratingSummary, review) => {
					if (typeof review.rating === 'number') {
						ratingSummary.number_of_ratings += 1
						ratingSummary.sum_total_rating += review.rating
					}
				}
				// Utilize the reducer on the metadata object to modify it directly.
				responseReviews.reduce(ratingsReducer, metadata[movie.id])

				// Determine if existing movie data is worth adding.
				if (typeof movie.vote_count === 'number' && typeof movie.vote_avg === 'number') {
					// convert average from values of 1-10 to values of 0-5.
					const converted_average = ((movie.vote_avg * 11 / 10) - 1) / 2
					ratingSummary.number_of_ratings += movie.vote_count
					ratingSummary.sum_total_rating += movie.vote_count * converted_average
				}

				// This chunk of metadata is returned through a promise!
				// Once resolved, it will be ready to be used with the others.
				return metadata
			}


			// This map loop has a breadth of async promises.
			// All of them should be computing simultaneously.
			const promisedMetadata = movies.map(metadataMapper)

			// We'll also need the final output variable, an object.
			let metadata = { }

			// Finally, resolve all of the promises and assign them to metadata.
			const responseMetadata = await Promise.all(promisedMetadata)
			Object.assign(metadata, ...responseMetadata)

			res.render('movies-index', {movies, metadata})
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

			// render movie results
			res.render('movies-show', {
				'movie': movie,
				'reviews': reviews,
				'videos': videos.results,
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

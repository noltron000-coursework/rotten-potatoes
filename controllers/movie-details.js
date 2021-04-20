const { MovieDb } = require('moviedb-promise')
const moviedb = new MovieDb('3a1d8db55135a8ae41b2314190591157')

// Helpers for certain API calls.
const {
	cleanMovieData,
	convertToCertification,
} = require('../helpers/data-parser.js')

const controller = (app) => {
	/*********************************************************
		== SHOW INDEX OF ALL COMMENTS ==
		Normally lists out an overview of comments one-by-one.
		However, comments are special because they are
			displayed amongst their associated reviews.
	*********************************************************/
	// nothing to show here!


	/*********************************************************
		== SHOW NEW COMMENT FORM ==
		Normally shows shows the form to createe a new comment.
		It can have a query string that pre-defines the movie.
	*********************************************************/
	// nothing to show here!


	/*********************************************************
		== SHOW ONE COMMENT ==
		Normally Shows a single comment with great detail.
		However, comments are special because they are
			displayed amongst their associated reviews.
	*********************************************************/
	app.get('/movie-details/:id', async (req, res) => {
		try {
			let movie = moviedb.movieInfo({id: req.params.id})
			let videos = moviedb.movieVideos({id: req.params.id})
			let reviews = moviedb.movieReviews({id: req.params.id})
			let releaseData = moviedb.movieReleaseDates({id: req.params.id})

			movie = await movie
			videos = await videos
			reviews = await reviews
			releaseData = await releaseData

			// Use helpers to clean the movie data.
			const certification = convertToCertification(releaseData)
			cleanMovieData(movie)

			// Send the markup to the frontend javascript.
			res.render('partials/index-movie-details', {
				layout: false,
				movie,
				videos,
				reviews,
				certification,
			})
		}

		catch (err) {
			console.error(err.message)
			res.status(400).send({err})
		}
	})

	/*********************************************************
		== SHOW EDIT REVIEW FORM ==
		Normally this shows the form for updating some comment.
		However, comments are special because they are
			displayed amongst their associated reviews.
	*********************************************************/
	// nothing to show here!


	/*********************************************************
		== SUBMIT A CREATED COMMENT ==
		This controls new comment submissions.
	*********************************************************/
	// nothing to show here!


	/*********************************************************
		== SUBMIT AN UPDATED MOVIE ==
		This controls comment-edit submissions.
	*********************************************************/
	// nothing to show here!


	/*********************************************************
		== SUBMIT A COMMENT DELETION ==
		This controls review-deletion submissions.
	*********************************************************/
	// nothing to show here!
}


module.exports = controller

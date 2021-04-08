const { MovieDb } = require('moviedb-promise')
const moviedb = new MovieDb('3a1d8db55135a8ae41b2314190591157')
const handlebars = require('handlebars')

// Here we ultimately want the fs.readFile promise.
const fs = require('fs')
const {promisify} = require('util')
const pr = { }; pr.readFile = promisify(fs.readFile)

// Helpers for certain API calls.
const {cleanMovieData} = require('../helpers/data-parser.js')

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
			let rawTemplate = pr.readFile('./views/partials/movies-index-item.hbs', 'utf8')
			movie = await movie
			videos = await videos
			rawTemplate = await rawTemplate

			// Use helpers to clean the movie data.
			cleanMovieData(movie)

			// Parse through handlebars and create useable markup.
			const template = handlebars.compile(rawTemplate)
			const markup = template({movie, videos})

			// Send the markup to the frontend javascript.
			// Don't reload the page via res.render!
			res.status(200).send({markup})
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

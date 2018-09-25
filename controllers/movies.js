const MovieDB = require('moviedb-promise');
const moviedb = new MovieDB('3a1d8db55135a8ae41b2314190591157');

function movies (app) {

	// INDEX => SHOW ALL MOVIES
	app.get('/', (req, res) => {
		moviedb.miscNowPlayingMovies()
		.then(response => {
			res.render('movies-index', {
				movies: response.results
			});
		}).catch((err) => {
			console.log(err.message);
		});
	});

	// NEW => SHOW MOVIE CREATION FORM
	// There is no need to create new movies!

	// SHOW SINGLE MOVIE
	app.get('/movies/:id', (req, res) => {
		moviedb.movieInfo({ id: req.params.id })
		.then(movie => {
			if (movie.video) {
				moviedb.movieVideos({ id: req.params.id })
				.then(videos => {
					console.log("TRAILER PASSED") //Checking pass/fail status
					movie.trailer_youtube_id = videos.results[0].key
					renderTemplate(movie)
				})
			} else {
				console.log("TRAILER FAILED") //Checking pass/fail status
				renderTemplate(movie)
			}
			function renderTemplate(movie) {
				res.render('movies-show', { movie: movie });
			}
		}).catch(console.error)
	})



	// UPDATE MOVIE
	// There is no need to update movies!

	// EDIT MOVIE
	// There is no need to edit movies!

	// CREATE MOVIE
	// There is no need to create movies!

	// DELETE MOVIE
	// There is no need to delete movies!
}


module.exports = movies

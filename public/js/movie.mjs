// `reviewPagination` and `responseReviews` shall already be
// 	defined by a script that ran within `movies-show.hbs`.

// Track all reviews from the responses.
var reviewPages = [ ]

// Useful several times throughout application.
var movieId

// Leverage "Event Delegation".
// Use functions that return true when triggered.
var clickEventListeners = [ ]

//+ CREATE CLICK EVENT LISTENERS +//
const pageButtonClick = async (event) => {
	let response = false
	if (event.target.matches('#review-pagination button')) {
		response = true

		// set up local variables.
		const target = event.target
		const index = event.target.dataset.index
		const buttons = document.querySelectorAll('#review-pagination button')

		// enable all buttons, except for target.
		buttons.forEach((button) => {
			if (button === target) {
				button.disabled = true
			}
			else {
				button.disabled = false
			}
		})

		// determine if we have already have data on-hand.
		if (!(index in reviewPages)) {
			if (index == 0) {
				reviewPages[index] = await fetchReviews('db')
			}
			else {
				reviewPages[index] = await fetchReviews('api', index)
			}
		}
		// get the important elements for modification.
		const navElement = document.querySelector('#reviews-index')
		const reviewsList = navElement.getElementsByTagName('ul')[0]

		// convert response string into html, and cast aside the useless <html> and <body>.
		const parser = new DOMParser( )
		const newReviewsList = parser
		.parseFromString(reviewPages[index], 'text/html')
		.body.getElementsByTagName('ul')[0]

		navElement.replaceChild(newReviewsList, reviewsList)
	}
	return response
}

const loadMovieDetailsClick = async (event) => {
	const button = event.target.closest('[data-load-movie-details]')
	if (!button) {
		return false
	}

	const movie = button.closest('.movie')
	if (button.disabled) {
		return true
	}

	const willExpand = button.getAttribute('aria-expanded') !== 'true'
	if (willExpand && !movie.dataset.detailsLoaded) {
		button.disabled = true
		button.textContent = 'Loading Movie Details...'
		try {
			const response = await fetch(`/movies/${movie.dataset.movieId}?fragment=details`)
			if (!response.ok) {
				throw new Error(`Movie details request failed (${response.status})`)
			}

			const markup = await response.text()
			const parser = new DOMParser()
			const loadedMovie = parser.parseFromString(markup, 'text/html').querySelector('.movie')
			if (!loadedMovie) {
				throw new Error('Movie details response did not contain a movie card')
			}

			loadedMovie.querySelectorAll('.movie-details, .movie-trailer').forEach((element) => {
				element.hidden = false
			})
			movie.querySelector('.movie-details')?.replaceWith(
				loadedMovie.querySelector('.movie-details')
			)
			movie.querySelector('.movie-trailer')?.replaceWith(
				loadedMovie.querySelector('.movie-trailer')
			)
			movie.dataset.detailsLoaded = 'true'
		}
		catch (error) {
			console.error(error)
			button.textContent = 'Load Movie Details'
			button.disabled = false
			return true
		}
		button.disabled = false
	}

	movie.querySelectorAll('.movie-details, .movie-trailer').forEach((element) => {
		element.hidden = !willExpand
	})
	button.setAttribute('aria-expanded', String(willExpand))
	button.textContent = willExpand ? 'Hide Movie Details' : 'Load Movie Details'
	return true
}

// helper for above listener
const fetchReviews = async (source, index) => {
	// Use fetch to initialize a post request, and send it.
	const options = {
		'method': 'GET',
		'headers': {
			// Expect to send a URL-Encoded payload content.
			'Content-Type': 'application/x-www-form-urlencoded',
		}
	}

	let response
	if (source === 'db') {
		response = await fetch(`/reviews?movieId=${movieId}&source=${source}&fragment=true`, options)
	}
	else {
		response = await fetch(`/reviews?movieId=${movieId}&source=${source}&page=${index}&fragment=true`, options)
	}
	const blob = await response.blob( )
	const markup = await blob.text( )
	return markup
}

//+ ADD CLICK EVENT LISTENERS +//
clickEventListeners.push(pageButtonClick)
clickEventListeners.push(loadMovieDetailsClick)

//+ ONLOAD FUNCTION EXECUTION +//
const main = ( ) => {
	movieId = document.querySelector('.movie').dataset.movieId
	document.body.addEventListener('click', async (event) => {
		// sequentially awaiting seems slow at first,
		// 	but only successful results don't resolve immediately.
		for (let isValidListener of clickEventListeners) {
			const result = await isValidListener(event)
			if (result) {break}
		}
	})
}

window.onload = ( ) => {
	main( )
}

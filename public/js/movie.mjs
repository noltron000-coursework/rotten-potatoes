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
	if (willExpand) {
		document.querySelectorAll('[data-load-movie-details][aria-expanded="true"]').forEach((openButton) => {
			if (openButton === button) {
				return
			}

			const openMovie = openButton.closest('.movie')
			openMovie?.querySelectorAll('.movie-details, .movie-trailer').forEach((element) => {
				element.hidden = true
			})
			openMovie?.closest('li')?.classList.remove('is-expanded')
			openButton.setAttribute('aria-expanded', 'false')
			openButton.textContent = 'Load Movie Details'
		})
	}

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
	movie.closest('li')?.classList.toggle('is-expanded', willExpand)
	button.setAttribute('aria-expanded', String(willExpand))
	button.textContent = willExpand ? 'Hide Movie Details' : 'Load Movie Details'
	return true
}

const mediaPaginationClick = (event) => {
	const button = event.target.closest('[data-media-prev], [data-media-next]')
	if (!button) {
		return false
	}

	const gallery = button.closest('[data-media-gallery]')
	if (!gallery) {
		return false
	}

	const direction = button.matches('[data-media-next]') ? 1 : -1
	showMediaPage(gallery, Number(gallery.dataset.mediaPage || 0) + direction)
	return true
}

const showMediaPage = (gallery, pageIndex) => {
	const items = [...gallery.querySelectorAll('[data-media-item]')]
	if (!items.length) {
		const total = gallery.querySelector('[data-media-total]')
		const current = gallery.querySelector('[data-media-current]')
		const previous = gallery.querySelector('[data-media-prev]')
		const next = gallery.querySelector('[data-media-next]')
		if (total) {
			total.textContent = '0'
		}
		if (current) {
			current.textContent = '0'
		}
		if (previous) {
			previous.disabled = true
		}
		if (next) {
			next.disabled = true
		}
		return
	}

	const pageSize = 6
	const totalPages = Math.ceil(items.length / pageSize)
	const currentPage = Math.max(0, Math.min(pageIndex, totalPages - 1))
	const firstItem = currentPage * pageSize
	const lastItem = firstItem + pageSize

	items.forEach((item, index) => {
		item.hidden = index < firstItem || index >= lastItem
	})

	gallery.dataset.mediaPage = String(currentPage)
	const current = gallery.querySelector('[data-media-current]')
	const total = gallery.querySelector('[data-media-total]')
	const previous = gallery.querySelector('[data-media-prev]')
	const next = gallery.querySelector('[data-media-next]')

	if (current) {
		current.textContent = String(currentPage + 1)
	}
	if (total) {
		total.textContent = String(totalPages)
	}
	if (previous) {
		previous.disabled = currentPage === 0
	}
	if (next) {
		next.disabled = currentPage === totalPages - 1
	}
}

const initializeMediaGalleries = () => {
	document.querySelectorAll('[data-media-gallery]').forEach((gallery) => {
		showMediaPage(gallery, 0)
	})
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
clickEventListeners.push(mediaPaginationClick)
clickEventListeners.push(loadMovieDetailsClick)

//+ ONLOAD FUNCTION EXECUTION +//
const main = ( ) => {
	const movie = document.querySelector('.movie')
	if (movie) {
		movieId = movie.dataset.movieId
	}
	initializeMediaGalleries()
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

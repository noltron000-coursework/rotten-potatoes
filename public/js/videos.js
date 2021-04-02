const setupToggleActivate = ( ) => {
	const movieElements = document.querySelectorAll('article.movie')
	movieElements.forEach((movieElement) => {
		const toggleActivate = getToggleActivateFx(movieElement)
		const button = movieElement.querySelector('input.toggle-activate')
		button.addEventListener('click', toggleActivate)
	})
}

const addAttributes = (attributes) => {
	const toElement = (element) => {
		Object.entries(attributes).forEach(([name, value]) => {
			element.setAttribute(name, value)
		})
	}
	return {toElement}
}

const getToggleActivateFx = (movieElement) => {
	const movieId = movieElement.getAttribute('data-movie-id')
	const detailsElement = movieElement.querySelector('.movie-info .movie-details section')

	return async (event) => {
		if (movieElement.classList.contains('activated')) {
			// Remove activated mode.
			// Switch mode to was-activated.
			movieElement.classList.remove('activated')
			movieElement.classList.add('was-activated')
			return
		}
		else if (movieElement.classList.contains('was-activated')) {
			// Remove was-activated mode.
			// Switch mode to activated.
			movieElement.classList.remove('was-activated')
			movieElement.classList.add('activated')
			return
		}
		else {
			// Switch mode to activated,
			// and then load movie info.
			movieElement.classList.add('activated')
			const {movie, videos} = await fetchMovieInfo(movieId)
			const videoKey = videos[0].key

			// Make rating meter.
			const ratingElement = document.createElement('meter')
			const ratingAttributes = {
				'min': 0,
				'max': 5,
				'optimum': 5,
				'value': ((movie.vote_average * 11 / 10) - 1) / 2,
			}
			addAttributes(ratingAttributes).toElement(ratingElement)
			detailsElement.append(ratingElement)

			// Make genres.
			const genresList = Object.values(movie.genres).map(genre => genre.name)
			const genresListElement = document.createElement('ul')
			genresList.forEach((genre) => {
				genreItemElement = document.createElement('li')
				genreItemText = document.createTextNode(genre)
				genreItemElement.append(genreItemText)
				genresListElement.append(genreItemElement)
			})
			detailsElement.append(genresListElement)

			// Make description.
			const descriptionElement = document.createElement('p')
			const descriptionText = document.createTextNode(movie.overview)
			descriptionElement.append(descriptionText)
			detailsElement.append(descriptionElement)

			// Make video heading.
			const videoHeading = document.createElement('h4')
			const videoHeadingText = document.createTextNode('Trailer')
			videoHeading.append(videoHeadingText)
			detailsElement.append(videoHeading)

			// Make video element.
			const videoElement = document.createElement('iframe')
			const videoAttributes = {
				'width': 640,
				'height': 360,
				'src': `https://www.youtube.com/embed/${videoKey}?rel=0`,
				'title': 'YouTube video player',
				'frameborder': 0,
				'allow': 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
				'allowfullscreen': true,
			}
			addAttributes(videoAttributes).toElement(videoElement)
			detailsElement.append(videoElement)
		}
	}
}

const fetchMovieInfo = async (movieId) => {
	// Use fetch to initialize a post request, and send it.
	const options = {
		'method': 'GET',
		'headers': {
			// Expect a URL-Encoded payload content.
			'Content-Type': 'application/x-www-form-urlencoded',
		}
	}
	let response = fetch(`/movie-details/${movieId}`, options)
	response = await response

	// Determine the resulting movie data
	// 	by awaiting a json stream.
	const {movie, videos} = await response.json()

	return {movie, videos}
}

const prepareDetails = (movieElement, trailer) => {
	const videoKey = trailer.key
}

window.onload = ( ) => {
	setupToggleActivate( )
}

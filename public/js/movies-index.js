const setupToggleActivate = ( ) => {
	const movieElements = document.querySelectorAll('article.movie')
	movieElements.forEach((movieElement) => {
		const toggleActivate = getToggleActivateFx(movieElement)
		const button = movieElement.querySelector('.title button')
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
	const detailsElement = movieElement.querySelector('section.details')

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

			const {markup} = await fetchIndexItemHTML(movieId)
			detailsElement.innerHTML = markup
		}
	}
}



const fetchIndexItemHTML = async (movieId) => {
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
	const info = await response.json( )

	return info
}

const prepareDetails = (movieElement, trailer) => {
	const videoKey = trailer.key
}

window.onload = ( ) => {
	setupToggleActivate( )
}

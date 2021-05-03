const setupToggleActivate = ( ) => {
	const movieElements = document.querySelectorAll('article.movie')
	movieElements.forEach((movieElement) => {
		const toggleActivate = getToggleActivateFx(movieElement)
		const button = movieElement.querySelector('button.title')
		button.addEventListener('click', toggleActivate)
	})
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

			const markup = await fetchIndexItemHTML(movieId)
			const range = document.createRange( )
			const newDetailsElement = range.createContextualFragment(markup)
			movieElement.replaceChild(newDetailsElement, detailsElement)
		}
	}
}



const fetchIndexItemHTML = async (movieId) => {
	// Use fetch to initialize a post request, and send it.
	const options = {
		'method': 'GET',
		'headers': {
			// Expect to send a URL-Encoded payload content.
			'Content-Type': 'application/x-www-form-urlencoded',
		}
	}
	const response = await fetch(`/movie/${movieId}/flash`, options)
	const blob = await response.blob( )
	const markup = await blob.text( )

	return markup
}

window.onload = ( ) => {
	setupToggleActivate( )
}

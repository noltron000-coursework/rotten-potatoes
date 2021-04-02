const setupToggleActivate = ( ) => {
	const movieElements = document.querySelectorAll('article.movie')
	movieElements.forEach((movieElement) => {
		const toggleActivate = getToggleActivateFx(movieElement)
		const button = movieElement.querySelector('input.toggle-activate')
		button.addEventListener('click', toggleActivate)
	})
}

const getToggleActivateFx = (movieElement) => {
	return async (event) => {
		const movieId = movieElement.getAttribute('data-movie-id')
		const infoElement = movieElement.querySelector('movie-info')

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
		}
	}
}

const loadMovieInfo = async (movieId) => {

}

const addVideoEl = (parentElement) => {
	const addVideo = (event) => {
		const videoKey = event.target.getAttribute('data-video-key')

		parentElement.innerHTML = `
		<iframe
			width="800"
			height="450"
			src="https://www.youtube.com/embed/${videoKey}?rel=0"
			title="YouTube video player"
			frameborder="0"
			allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
			allowfullscreen
		></iframe>`
	}

	// notice we're returning a function that requires an event.
	return addVideo
}

window.onload = ( ) => {
	setupToggleActivate( )
}

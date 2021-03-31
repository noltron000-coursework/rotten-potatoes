const setupAddVideo = ( ) => {
	const placeholders = document.querySelectorAll('.movies-index .trailer-thumbnail')
	placeholders.forEach((element) => {
		element.addEventListener('click', addVideoEl(element))
	})
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
	setupAddVideo( )
}

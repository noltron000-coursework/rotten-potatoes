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
			activate( )
		}
	}

	async function activate ( ) {
		const {movie, videos} = await fetchMovieInfo(movieId)

		const videoKey = videos[0].key
		const rating = ((movie.vote_average * 11 / 10) - 1) / 2

		let showRating
		showRating = {
			'integer': Math.floor(rating),
			'fraction': rating % 1,
		}
		if (showRating.integer < 1 && showRating.fraction >= 1/8) {
			showRating.integer = ''
		}
		else {
			showRating.integer = showRating.integer.toString( )
		}
		if (showRating.fraction < 1/8) {
			showRating.fraction = ''
		}
		else if (showRating.fraction < 2/8) {
			showRating.fraction = '⅛'
		}
		else if (showRating.fraction < 3/8) {
			showRating.fraction = '¼'
		}
		else if (showRating.fraction < 4/8) {
			showRating.fraction = '⅜'
		}
		else if (showRating.fraction < 5/8) {
			showRating.fraction = '½'
		}
		else if (showRating.fraction < 6/8) {
			showRating.fraction = '⅝'
		}
		else if (showRating.fraction < 7/8) {
			showRating.fraction = '¾'
		}
		else {
			showRating.fraction = '⅞'
		}
		showRating = `${showRating.integer}${showRating.fraction}`

		const genres = movie.genres.map(genre => genre.name)
		const showStars = showRating + ' stars'
		const showNumVotes = movie.vote_count + ' votes'
		const showNumReviews = 0 + ' reviews'

		let showReleaseDate = new Date(movie.release_date)
		showReleaseDate = {
			'day': showReleaseDate.getDay( ),
			'month': showReleaseDate.toLocaleString('default', {month: 'long'}),
			'year': showReleaseDate.getFullYear( ),
		}
		showReleaseDate = `${showReleaseDate.day} ${showReleaseDate.month} ${showReleaseDate.year}`

		let showRuntime = movie.runtime
		showRuntime = {
			'minutes': showRuntime % 60,
			'hours': Math.floor(showRuntime / 60),
		}
		if (showRuntime.hours === 0) {
			showRuntime = `${showRuntime.minutes}min`
		}
		else if (showRuntime.minutes === 0) {
			showRuntime = `${showRuntime.hours}hr`
		}
		else {
			showRuntime = `${showRuntime.hours}hr ${showRuntime.minutes}min`
		}

		const clearElement = (element) => {
			while (element.firstChild) {
				element.removeChild(element.firstChild)
			}
		}

		const taglineEl = detailsElement.querySelector('.data-tagline')
		const taglineTx = document.createTextNode(movie.tagline)
		clearElement(taglineEl)
		taglineEl.append(taglineTx)

		const genresEl = detailsElement.querySelector('.data-genres')
		const genreChs = movie.genres.map(({name, id}) => {
			const genreCh = document.createElement('dd')
			const genreTx = document.createTextNode(name)
			genreCh.append(genreTx)
			return genreCh
		})
		clearElement(genresEl)
		genresEl.append(...genreChs)

		const ratingMeterEl = detailsElement.querySelector('.data-rating-meter')
		const ratingMeterCh = ratingMeterEl.querySelector('meter')
		ratingMeterCh.setAttribute('value', rating)

		const ratingEl = detailsElement.querySelector('.data-rating')
		const ratingTx = document.createTextNode(showStars)
		clearElement(ratingEl)
		ratingEl.append(ratingTx)

		const numVotesEl = detailsElement.querySelector('.data-num-votes')
		const numVotesTx = document.createTextNode(showNumVotes)
		clearElement(numVotesEl)
		numVotesEl.append(numVotesTx)

		const numReviewsEl = detailsElement.querySelector('.data-num-reviews')
		const numReviewsTx = document.createTextNode(showNumReviews)
		clearElement(numReviewsEl)
		numReviewsEl.append(numReviewsTx)

		const releaseDateEl = detailsElement.querySelector('.data-release-date')
		const releaseDateTx = document.createTextNode(showReleaseDate)
		clearElement(releaseDateEl)
		releaseDateEl.append(releaseDateTx)

		const runtimeEl = detailsElement.querySelector('.data-runtime')
		const runtimeTx = document.createTextNode(showRuntime)
		clearElement(runtimeEl)
		runtimeEl.append(runtimeTx)

		const overviewEl = detailsElement.querySelector('.data-overview')
		const overviewTx = document.createTextNode(movie.overview)
		clearElement(overviewEl)
		overviewEl.append(overviewTx)

		const trailerEl = detailsElement.querySelector('.data-trailer')
		const trailerCh = document.createElement('iframe')
		addAttributes({
			'width': 640,
			'height': 360,
			'src': `https://www.youtube.com/embed/${videoKey}?rel=0`,
			'title': 'YouTube video player',
			'frameborder': 0,
			'allow': 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
			'allowfullscreen': true,
		}).toElement(trailerCh)
		clearElement(trailerEl)
		trailerEl.append(trailerCh)

		detailsElement.classList.add('loaded')
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
	const {movie, videos} = await response.json( )

	return {movie, videos}
}

const prepareDetails = (movieElement, trailer) => {
	const videoKey = trailer.key
}

window.onload = ( ) => {
	setupToggleActivate( )
}

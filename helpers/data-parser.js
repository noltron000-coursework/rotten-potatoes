// does not mutate input.
const convertToStarRating = (rating) => {
	// When first ran the rating has a scale of 1 - 10.
	rating -= 1    // the rating has a scale of 0 - 9.
	rating *= 10/9 // the rating has a scale of 0 - 10.
	rating /= 2    // the rating has a scale of 0 - 5.
	return rating
}



// does not mutate input.
const convertToVulgarFraction = (decimal) => {
	let integer = Math.floor(decimal)
	let fraction = decimal % 1
	let vulgarNumber = ''

	// Determine if whole number is necessary.
	if (integer > 1 || fraction < 1/8) {
		vulgarNumber += integer.toString( )
	}

	// Add fractional representation of number.
	if (fraction > 7/8) {
		vulgarNumber += '⅞'
	}
	else if (fraction > 6/8) {
		vulgarNumber += '¾'
	}
	else if (fraction > 5/8) {
		vulgarNumber += '⅝'
	}
	else if (fraction > 4/8) {
		vulgarNumber += '½'
	}
	else if (fraction > 3/8) {
		vulgarNumber += '⅜'
	}
	else if (fraction > 2/8) {
		vulgarNumber += '¼'
	}
	else if (fraction > 1/8) {
		vulgarNumber += '⅛'
	}
	else {
		vulgarNumber += ''
	}

	// Return combined vulgar number as a string.
	return vulgarNumber
}



// does not mutate input.
const convertToEasyDate = (inputDate) => {
	// Get day, month, and year.
	const day = inputDate.getDay( )
	const month = inputDate.toLocaleString('default', {month: 'long'})
	const year = inputDate.getFullYear( )
	// Return the easy trio of date data.
	return {day, month, year}
}



// does not mutate input.
const convertToEasyDuration = (totalSeconds) => {
	// Get time in hours, minutes, and seconds.
	const seconds = totalSeconds % 60
	const minutes = Math.floor(totalSeconds / 60) % 60
	const hours = Math.floor(totalSeconds / 3600)
	// Return the easy trio of duration data..
	return {hours, minutes, seconds}
}



// will mutate the input.
const cleanMovieData = (movie) => {
	const date = convertToEasyDate(new Date(Date.parse(movie.release_date)))
	date.stamp = movie.release_date
	movie.release_date = date

	const duration = convertToEasyDuration(movie.runtime * 60)
	duration.stamp = movie.runtime * 60
	movie.runtime = duration

	const polling = { }
	polling.count = movie.vote_count
	polling.average = convertToStarRating(movie.vote_average)
	polling.score = polling.count * polling.average
	polling.rating = convertToVulgarFraction(polling.average)
	movie.vote = polling
	delete movie.vote_average
	delete movie.vote_count
}



module.exports = {
	cleanMovieData,
	convertToEasyDate,
	convertToEasyDuration,
	convertToStarRating,
	convertToVulgarFraction,
}

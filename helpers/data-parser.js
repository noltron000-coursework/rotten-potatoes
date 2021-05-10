const convertToCertification = (releaseData = null) => {
	if (releaseData === null) {
		return null
	}

	try {
		// find release dates for this country.
		const usaReleases = releaseData.results.find((country) => (
			country.iso_3166_1 === 'US'
		)).release_dates

		// sort releases by type then date.
		// (smallest first for premieres)
		usaReleases.sort((a, b) => {
			if (a.type === b.type) {
				const aDate = Date.parse(a.release_date)
				const bDate = Date.parse(b.release_date)
				// on a tie, we want the BIGGEST or most recent date first.
				if (a.release_date > b.release_date) {
					return b
				}
				else {
					return a
				}
			}
			// we want the SMALLEST or most important release first.
			else if (a.type > b.type) {
				return a
			}
			else if (a.type < b.type) {
				return b
			}
		})

		// the best release is in front.
		const bestRelease = usaReleases[0]

		// return the certification rating.
		return bestRelease.certification
	}
	catch {
		return null
	}
}



const convertToStarGrade = (grade = null) => {
	if (grade === null) {
		return null
	}

	// When first ran the grade has a scale of 1 - 10.
	grade -= 1    // the grade has a scale of 0 - 9.
	grade *= 10/9 // the grade has a scale of 0 - 10.
	grade /= 2    // the grade has a scale of 0 - 5.
	return grade
}



const convertToVulgarFraction = (decimal = null) => {
	if (decimal === null || Number.isNaN(decimal)) {
		return null
	}

	let integer = Math.floor(decimal)
	let fraction = decimal % 1
	let vulgarNumber = ''

	// Determine if whole number is necessary.
	if (integer >= 1 || fraction < 1/8) {
		vulgarNumber += integer.toString( )
	}

	// Add fractional representation of number.
	if (fraction >= 7/8) {
		vulgarNumber += '⅞'
	}
	else if (fraction >= 6/8) {
		vulgarNumber += '¾'
	}
	else if (fraction >= 5/8) {
		vulgarNumber += '⅝'
	}
	else if (fraction >= 4/8) {
		vulgarNumber += '½'
	}
	else if (fraction >= 3/8) {
		vulgarNumber += '⅜'
	}
	else if (fraction >= 2/8) {
		vulgarNumber += '¼'
	}
	else if (fraction >= 1/8) {
		vulgarNumber += '⅛'
	}
	else {
		vulgarNumber += ''
	}

	// Return combined vulgar number as a string.
	return vulgarNumber
}



const convertToEasyDate = (inputDate = null) => {
	let day = month = year = stamp = null
	if (inputDate === null) {
		return {day, month, year, stamp}
	}

	// Keep input data
	stamp = inputDate
	// Get day, month, and year.
	day = inputDate.getDay( )
	month = inputDate.toLocaleString('default', {month: 'long'})
	year = inputDate.getFullYear( )
	// Return the easy trio of date data.
	return {day, month, year, stamp}
}



const convertToEasyDuration = (totalSeconds) => {
	let  seconds = minutes = hours = stamp = null
	if (totalSeconds === null) {
		return {seconds, minutes, hours, stamp}
	}

	// Keep input data
	stamp = totalSeconds
	// Get time in hours, minutes, and seconds.
	seconds = totalSeconds % 60
	minutes = Math.floor(totalSeconds / 60) % 60
	hours = Math.floor(totalSeconds / 3600)
	// Return the easy trio of duration data..
	return {hours, minutes, seconds, stamp}
}



module.exports = {
	convertToCertification,
	convertToEasyDate,
	convertToEasyDuration,
	convertToStarGrade,
	convertToVulgarFraction,
}

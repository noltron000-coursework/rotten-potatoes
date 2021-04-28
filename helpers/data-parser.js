// does not mutate input.
const convertToCertification = (releaseData) => {
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
	} catch {
		return ''
	}
}



// does not mutate input.
const convertToStarGrade = (grade) => {
	// When first ran the grade has a scale of 1 - 10.
	grade -= 1    // the grade has a scale of 0 - 9.
	grade *= 10/9 // the grade has a scale of 0 - 10.
	grade /= 2    // the grade has a scale of 0 - 5.
	return grade
}



// does not mutate input.
const convertToVulgarFraction = (decimal) => {
	let integer = Math.floor(decimal)
	let fraction = decimal % 1
	let vulgarNumber = ''

	// Determine if whole number is necessary.
	if (integer >= 1 || fraction < 1/8) {
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



// does not mutate input.
const extractDbMovieOpinions = (dbReviews) => {
	// initialize opinions object
	const dbOpinions = {
		'ratings': {
			'count': 0,
			'total': 0,
			'average': 0,
			'vulgar_average': '0',
			'histogram': {
				'0': 0,
				'1': 0,
				'2': 0,
				'3': 0,
				'4': 0,
				'5': 0,
			}
		},
		'reviews': {
			'count': 0,
			// 'entries': [],
		},
	}

	// add reviews
	dbReviews.filter(review => review.content).forEach(review => {
		dbOpinions.ratings.count += 1
		dbOpinions.ratings.total += review.rating
		dbOpinions.ratings.histogram[review.rating] += 1
	})

	// add ratings
	dbReviews.filter(review => Number.isFinite(review.rating)).forEach(review => {
		dbOpinions.reviews.count += 1
		// dbOpinions.reviews.entries.push(review)
	})

	// calculated rating attributes
	dbOpinions.ratings.average = dbOpinions.ratings.total / dbOpinions.ratings.count
	dbOpinions.ratings.vulgar_average = convertToVulgarFraction(dbOpinions.ratings.average)

	return dbOpinions
}



// does not mutate input.
const extractApiMovieOpinions = (movie, apiReviews) => {
	// initialize opinions object
	const apiOpinions = {
		'ratings': {
			'count': 0,
			'total': 0,
			'average': 0,
			'vulgar_average': '0',
			'histogram': {
				'0': 0,
				'1': 0,
				'2': 0,
				'3': 0,
				'4': 0,
				'5': 0,
			}
		},
		'reviews': {
			'count': 0,
			// 'entries': [],
		},
	}


	// add reviews
	apiReviews.results.forEach(review => {
		apiOpinions.reviews.count += 1
		// apiOpinions.reviews.entries.push(review)
	})

	// add ratings
	apiOpinions.ratings.count += movie.vote_count
	apiOpinions.ratings.total += movie.vote_count * convertToStarGrade(movie.vote_average)

	// calculated rating attributes
	apiOpinions.ratings.average = apiOpinions.ratings.total / apiOpinions.ratings.count
	apiOpinions.ratings.vulgar_average = convertToVulgarFraction(apiOpinions.ratings.average)

	return apiOpinions
}



// does not mutate input.
const extractAllMovieOpinions = (apiOpinions, dbOpinions) => {
	const allOpinions = {
		'ratings': {
			'count': 0,
			'total': 0,
			'average': 0,
			'vulgar_average': '0',
			'histogram': {
				'0': 0,
				'1': 0,
				'2': 0,
				'3': 0,
				'4': 0,
				'5': 0,
			}
		},
		'reviews': {
			'count': 0,
			// 'entries': [],
		},
	}

	// basic enumerators
	allOpinions.reviews.count += apiOpinions.reviews.count + dbOpinions.reviews.count
	allOpinions.ratings.count += apiOpinions.ratings.count + dbOpinions.ratings.count
	allOpinions.ratings.total += apiOpinions.ratings.total + dbOpinions.ratings.total

	// histogram
	Object.keys(allOpinions.ratings.histogram).forEach(key => {
		allOpinions.ratings.histogram[key] += apiOpinions.ratings.histogram[key] + dbOpinions.ratings.histogram[key]
	})

	// calculated rating attributes
	allOpinions.ratings.average = allOpinions.ratings.total / allOpinions.ratings.count
	allOpinions.ratings.vulgar_average = convertToVulgarFraction(allOpinions.ratings.average)

	return allOpinions
}


const cleanSomeMovieData = ({movie}) => {
	// determine featured path data.
	const featuredPosterPath = `https://image.tmdb.org/t/p/w500/${movie.poster_path}`
	const featuredBackdropPath = `https://image.tmdb.org/t/p/w500/${movie.backdrop_path}`

	// determine new release date object
	const dateObject = new Date(Date.parse(movie.release_date))
	const releaseDateObject = convertToEasyDate(dateObject)
	releaseDateObject.stamp = dateObject

	// connect information together
	const movieData = {
		api_id: movie.id,

		is_adult: movie.adult,

		title: movie.title,
		overview: movie.overview,

		original_title: movie.original_title,
		original_language: movie.original_language,

		featured_backdrop_path: featuredBackdropPath,
		featured_poster_path: featuredPosterPath,

		release_date: releaseDateObject,
	}

	return movieData
}


const cleanMoreMovieData = ({movie, videos, releaseData, apiReviews, dbReviews}) => {
	// determine featured path data.
	let featuredPosterPath = null
	let featuredBackdropPath = null
	let featuredVideoPath = null
	if (movie.poster_path) {
		featuredPosterPath = `https://image.tmdb.org/t/p/original/${movie.poster_path}`
	}
	if (movie.backdrop_path) {
		featuredBackdropPath = `https://image.tmdb.org/t/p/original/${movie.backdrop_path}`
	}
	if (videos.results.length > 0) {
		featuredVideoPath = `https://www.youtube.com/embed/${videos.results[0].key}?rel=0`
	}

	// determine new release date object
	const dateObject = new Date(Date.parse(movie.release_date))
	const releaseDateObject = convertToEasyDate(dateObject)
	releaseDateObject.stamp = dateObject

	// determine new runtime duration object
	const runtimeSeconds = movie.runtime * 60
	const runtimeObject = convertToEasyDuration(runtimeSeconds)
	runtimeObject.stamp = runtimeSeconds

	// determine new opinions object.
	const dbOpinions = extractDbMovieOpinions(dbReviews)
	const apiOpinions = extractApiMovieOpinions(movie, apiReviews)
	const allOpinions = extractAllMovieOpinions(apiOpinions, dbOpinions)

	// determine certification.
	const certification = convertToCertification(releaseData)

	// connect information together
	const movieData = {
		api_id: movie.id,
		imdb_id: movie.imdb_id,

		is_adult: movie.adult,
		is_video: movie.video,
		status: movie.status,
		certification: certification,
		popularity: movie.popularity,
		budget: movie.budget,
		revenue: movie.revenue,

		collection: movie.belongs_to_collection,

		title: movie.title,
		tagline: movie.tagline,
		overview: movie.overview,

		original_title: movie.original_title,
		original_language: movie.original_language,

		featured_backdrop_path: featuredBackdropPath,
		featured_poster_path: featuredPosterPath,
		featured_video_path: featuredVideoPath,

		genres: movie.genres,
		videos: videos,
		runtime: runtimeObject,
		release_date: releaseDateObject,

		production_companies: movie.production_companies,
		production_countries: movie.production_countries,
		spoken_languages: movie.spoken_languages,

		opinions: {
			db: dbOpinions,
			api: apiOpinions,
			all: allOpinions,
		},
	}

	return movieData
}



module.exports = {
	cleanSomeMovieData,
	cleanMoreMovieData,
	cleanFullMovieData,
	convertToCertification,
	convertToEasyDate,
	convertToEasyDuration,
	convertToStarGrade,
	convertToVulgarFraction,
}

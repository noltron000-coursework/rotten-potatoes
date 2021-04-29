const {
	convertToCertification,
	convertToEasyDate,
	convertToEasyDuration,
	convertToStarGrade,
	convertToVulgarFraction,
} = require('../data-parser.js')



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
			},
			'histogram_count': 0,
		},
		'reviews': {
			'count': 0,
			'entries': [],
		},
	}

	// add reviews
	dbReviews.filter(review => Number.isFinite(review.rating)).forEach(review => {
		dbOpinions.ratings.count += 1
		dbOpinions.ratings.total += review.rating
		dbOpinions.ratings.histogram[review.rating] += 1
		dbOpinions.ratings.histogram_count += 1
	})

	// add ratings
	dbReviews.filter(review => review.content).forEach(review => {
		review.source = 'db'
		dbOpinions.reviews.count += 1
		dbOpinions.reviews.entries.push(review)
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
			},
			'histogram_count': 0,
		},
		'reviews': {
			'count': 0,
			'entries': [],
		},
	}


	// add reviews
	apiReviews.results.forEach(review => {
		review.source = 'api'
		if (Number.isFinite(review.author_details.rating)) {
			review.author_details.rating = Math.round(convertToStarGrade(review.author_details.rating))
			apiOpinions.ratings.histogram[review.author_details.rating] += 1
			apiOpinions.ratings.histogram_count += 1
		}
		apiOpinions.reviews.count += 1
		apiOpinions.reviews.entries.push(review)
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
			},
			'histogram_count': 0,
		},
		'reviews': {
			'count': 0,
			'entries': [],
		},
	}

	// basic enumerators
	allOpinions.reviews.count += apiOpinions.reviews.count + dbOpinions.reviews.count
	allOpinions.reviews.entries.push(...apiOpinions.reviews.entries, ...dbOpinions.reviews.entries)
	allOpinions.ratings.count += apiOpinions.ratings.count + dbOpinions.ratings.count
	allOpinions.ratings.histogram_count += apiOpinions.ratings.histogram_count + dbOpinions.ratings.histogram_count
	allOpinions.ratings.total += apiOpinions.ratings.total + dbOpinions.ratings.total

console.log(allOpinions.ratings.histogram_count)
console.log(apiOpinions.ratings.histogram_count)
console.log(dbOpinions.ratings.histogram_count)
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


const cleanFullMovieData = ({movie, videos, releaseData, apiReviews, dbReviews}) => {
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
	cleanFullMovieData,
}

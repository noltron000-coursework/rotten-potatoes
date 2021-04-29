const {
	convertToCertification,
	convertToEasyDate,
	convertToEasyDuration,
	convertToStarGrade,
	convertToVulgarFraction,
	emptyDate,
	emptyDuration,
} = require('../data-parser.js')


const emptyOpinions = ( ) => ({
	// initialize opinions object and immediately return.
	'ratings': {
		'count': 0,
		'total': 0,
		'average': 0,
		'vulgar_average': '0',
		'histogram_count': 0,
		'histogram': {
			'0': 0,
			'1': 0,
			'2': 0,
			'3': 0,
			'4': 0,
			'5': 0,
		},
	},
	'reviews': {
		'count': 0,
		'entries': [],
	},
})


const cleanOpinions = (reviews = [ ]) => {
	// initialize an empty opinions object.
	const opinions = emptyOpinions( )

	const fromDb = ( ) => {
		// clean all of the reviews.
		const dbReviews = reviews.map(review => cleanReview(review).fromDb( ))

		// add ratings to cleaned opinions object.
		// gather and consider only reviews with a rating.
		dbReviews
		.filter(review => Number.isFinite(review.rating))
		.forEach(review => {
			opinions.ratings.count += 1
			opinions.ratings.histogram_count += 1
			opinions.ratings.histogram[review.rating] += 1
			opinions.ratings.total += review.rating
		})

		// calculated rating attributes
		opinions.ratings.average = opinions.ratings.total / opinions.ratings.count
		opinions.ratings.vulgar_average = convertToVulgarFraction(opinions.ratings.average)

		// add dbReviews to cleaned opinions object.
		// gather and consider only dbReviews with content.
		dbReviews
		.filter(review => review.content)
		.forEach(review => {
			opinions.reviews.count += 1
			opinions.reviews.entries.push(review)
		})

		return opinions
	}

	const fromApi = (movie) => {
		// clean all of the reviews.
		const apiReviews = reviews.map(review => cleanReview(review).fromApi( ))

		// add ratings to cleaned opinions object.
		// gather and consider only reviews with a rating.
		apiReviews
		.filter(review => Number.isFinite(review.rating))
		.forEach(review => {
			opinions.ratings.histogram_count += 1
			opinions.ratings.histogram[review.rating] += 1
		})

		// add ratings based on the movie api response.
		opinions.ratings.count += movie.vote_count
		opinions.ratings.total += movie.vote_count * convertToStarGrade(movie.vote_average)

		// calculated rating attributes
		opinions.ratings.average = opinions.ratings.total / opinions.ratings.count
		opinions.ratings.vulgar_average = convertToVulgarFraction(opinions.ratings.average)

		// add apiReviews to cleaned opinions object.
		// gather and consider only apiReviews with content.
		apiReviews
		.filter(review => review.content)
		.forEach(review => {
			opinions.reviews.count += 1
			opinions.reviews.entries.push(review)
		})

		return opinions
	}

	return {
		fromDb,
		fromApi,
	}
}


const mergeOpinions = (opinions, moreOpinions) => {
	// merge ratings together
	opinions.ratings.count += moreOpinions.ratings.count
	opinions.ratings.total += moreOpinions.ratings.total
	opinions.ratings.histogram_count += moreOpinions.ratings.histogram_count

	// merge ratings histogram
	Object.keys(opinions.ratings.histogram)
	.forEach(rating => {
		opinions.ratings.histogram[rating] += moreOpinions.ratings.histogram[rating]
	})

	// calculated rating attributes
	opinions.ratings.average = opinions.ratings.total / opinions.ratings.count
	opinions.ratings.vulgar_average = convertToVulgarFraction(opinions.ratings.average)

	// merge reviews together
	opinions.reviews.count += moreOpinions.reviews.count
	opinions.reviews.entries.push(...moreOpinions.reviews.entries)

	return opinions
}


const emptyReview = ( ) => ({
	// initialize opinions object and immediately return.
	'title': null,
	'content': null,
	'rating': null,
	'author': { },
	'comments': { },
	'creation_date': { },
	'revision_date': { },
})


// does not mutate input.
const cleanReview = (review) => {
	const fromDb = ( ) => {
		review.source = 'db'
		return review
	}

	const fromApi = ( ) => {
		var apiReview = review
		review = emptyReview( )

		// rating information
		if (Number.isFinite(apiReview.author_details.rating)) {
			review.rating = Math.round(convertToStarGrade(apiReview.author_details.rating))
		}

		// review information
		review.source  = 'api'
		review.title = apiReview.title
		review.content = apiReview.content

		// determine date-time objects
		const creationObject = new Date(Date.parse(apiReview.created_at))
		const revisionObject = new Date(Date.parse(apiReview.updated_at))
		review.creation_date = convertToEasyDate(creationObject)
		review.revision_date = convertToEasyDate(revisionObject)

		// author information
		review.author = apiReview.author_details
		review.author.extra = apiReview.author

		return review
	}

	return {fromDb, fromApi}
}


const emptyMovie = ( ) => ({
	'api_id': null,
	'imdb_id': null,

	'is_adult': null,
	'is_video': null,
	'status': null,
	'certification': null,
	'budget': null,
	'revenue': null,
	'popularity': 0,

	'collection': null,

	'title': null,
	'tagline': null,
	'overview': null,

	'original_title': null,
	'original_language': null,

	'featured_backdrop_path': null,
	'featured_poster_path': null,
	'featured_video_path': null,

	'genres': [ ],
	'videos': [ ],
	'runtime':  emptyDuration( ),
	'release_date': emptyDate( ),

	'production_companies': [ ],
	'production_countries': [ ],
	'spoken_languages': [ ],

	'opinions': {
		'db':  emptyOpinions( ),
		'api': emptyOpinions( ),
		'all': emptyOpinions( ),
	},
})


const cleanMovie = (apiMovie) => {
	// initialize an empty opinions object.
	let movie = emptyMovie( )

	const light = ( ) => {
		// determine featured path data.
		let featuredPosterPath = null
		let featuredBackdropPath = null
		if (movie.poster_path) {
			featuredPosterPath = `https://image.tmdb.org/t/p/original/${movie.poster_path}`
		}
		if (movie.backdrop_path) {
			featuredBackdropPath = `https://image.tmdb.org/t/p/original/${movie.backdrop_path}`
		}

		// determine new release date object
		const dateObject = new Date(Date.parse(movie.release_date))
		const releaseDateObject = convertToEasyDate(dateObject)

	// connect information together
		const lightData = {
			'api_id': apiMovie.id,

			'is_adult': apiMovie.adult,

			'title': apiMovie.title,
			'overview': apiMovie.overview,

			'original_title': apiMovie.original_title,
			'original_language': apiMovie.original_language,

			'featured_backdrop_path': featuredBackdropPath,
			'featured_poster_path': featuredPosterPath,

			'release_date': releaseDateObject,
		}

		// assign data object to the movie and return.
		Object.assign(movie, lightData)
		return movie
	}

	const heavy = ({dbReviews, apiReviews, apiVideos, apiReleases}) => {
		movie = light( )

		// determine featured path data.
		let featuredVideoPath = null
		if (apiVideos.results.length > 0) {
			featuredVideoPath = `https://www.youtube.com/embed/${apiVideos.results[0].key}?rel=0`
		}

		// determine new runtime duration object
		const runtimeSeconds = movie.runtime * 60
		const runtimeDuration = convertToEasyDuration(runtimeSeconds)

	// determine new opinions object.
		const opinions = {
			'db': cleanOpinions(dbReviews).fromDb( ),
			'api': cleanOpinions(apiReviews.entries).fromApi(apiMovie),
		}
		opinions.all = [opinions.db, opinions.api]
		.reduce(mergeOpinions, emptyOpinions( ))

	// determine certification.
		const certification = convertToCertification(apiReleases)

		// connect information together
		const heavyData = {
			'imdb_id': apiMovie.imdb_id,
			'is_video': apiMovie.video,
			'status': apiMovie.status,
			'certification': certification,
			'popularity': apiMovie.popularity,
			'budget': apiMovie.budget,
			'revenue': apiMovie.revenue,

			'collection': apiMovie.belongs_to_collection,
			'tagline': apiMovie.tagline,
			'featured_video_path': featuredVideoPath,
			'genres': apiMovie.genres,
			'videos': apiVideos.results,
			'runtime': runtimeDuration,
			'production_companies': apiMovie.production_companies,
			'production_countries': apiMovie.production_countries,
			'spoken_languages': apiMovie.spoken_languages,

			'opinions': opinions,
		}

		// assign data object to the movie and return.
		Object.assign(movie, heavyData)
		return movie
	}

	return {
		light,
		heavy,
	}
}

// const cleanSomeMovieData = ({movie}) => {
// 	// determine featured path data.
// 	const featuredPosterPath = `https://image.tmdb.org/t/p/w500/${poster_path}`
// 	const featuredBackdropPath = `https://image.tmdb.org/t/p/w500/${movie.backdrop_path}`
// }

module.exports = {cleanMovie}

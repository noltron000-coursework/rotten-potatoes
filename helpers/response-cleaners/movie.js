const {
	emptyReview,
	cleanReview,
	emptyOpinions,
	cleanOpinions,
	mergeOpinions,
} = require('./review.js')

const {
	convertToCertification,
	convertToEasyDate,
	convertToEasyDuration,
	convertToStarGrade,
	convertToVulgarFraction,
	emptyDate,
	emptyDuration,
} = require('../data-parser.js')


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

const {
	cleanOpinions,
	mergeOpinions,
} = require('./review.js')



const {
	convertToCertification,
	convertToEasyDate,
	convertToEasyDuration,
} = require('../data-parser.js')



const cleanMovie = (apiMovie = null) => {
	// return empty structure if input is none.
	if (apiMovie === null) {
		return {
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
			'runtime':  convertToEasyDuration( ),
			'release_date': convertToEasyDate( ),

			'production_companies': [ ],
			'production_countries': [ ],
			'spoken_languages': [ ],

			'opinions': {
				'db':  cleanOpinions(null),
				'api': cleanOpinions(null),
				'all': cleanOpinions(null),
			},
		}
	}

	// initialize an empty opinions object.
	let movie = cleanMovie(null)

	const light = ( ) => {
		// determine new release date object
		const dateObject = new Date(Date.parse(apiMovie.release_date))
		const releaseDateObject = convertToEasyDate(dateObject)

		// connect information together
		const lightData = {
			'api_id': apiMovie.id,

			'is_adult': apiMovie.adult,

			'title': apiMovie.title,
			'overview': apiMovie.overview,

			'original_title': apiMovie.original_title,
			'original_language': apiMovie.original_language,

			'featured_backdrop_path': apiMovie.backdrop_path,
			'featured_poster_path': apiMovie.poster_path,

			'release_date': releaseDateObject,
		}

		// assign data object to the movie and return.
		Object.assign(movie, lightData)
		return movie
	}

	const heavy = ({dbReviews, apiReviews, apiVideos, apiImages, apiReleases}) => {
		movie = light( )

		// determine featured path data.
		let featuredVideoPath = null
		if (apiVideos.results.length > 0) {
			featuredVideoPath = `https://www.youtube.com/embed/${apiVideos.results[0].key}?rel=0`
		}

		// determine new runtime duration object
		const runtimeSeconds = apiMovie.runtime * 60
		const runtimeDuration = convertToEasyDuration(runtimeSeconds)

		// determine new opinions object.
		const opinions = {
			'db': cleanOpinions(dbReviews).fromDb( ),
			'api': cleanOpinions(apiReviews.results).fromApi(apiMovie),
		}
		opinions.all = [opinions.db, opinions.api]
		.reduce(mergeOpinions, cleanOpinions(null))

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
			'posters': apiImages.posters,
			'backdrops': apiImages.backdrops,
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



module.exports = {cleanMovie}

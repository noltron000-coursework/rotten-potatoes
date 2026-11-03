import {convertToEasyDuration} from '../helpers/conversions.mjs'

import {Collection} from './collection.mjs'
import {Company} from './company.mjs'
import {Config} from './config.mjs'
import {Country} from './collections/country.mjs'
import {Genre} from './collections/genre.mjs'
import {Image, Backdrop, Poster} from './image.mjs'
import {Language} from './language.mjs'
import {List} from './list.mjs'
import {PopularOpinion} from './popular-opinion.mjs'
import {Release} from './release.mjs'
import {Review} from './review.mjs'
import {Video} from './video.mjs'

/*
Types of Movie Data:
1. ID Only (ie. from review index)
2. Shallow (ie. from movie index)
3. Complete (ie. from movie details)
*/

class Movie {
	#config
	constructor (data = { }) {
		let self = this  // allow forgetting of "this"
		data = {...data}  // dont mutate input data
		// If the data already has an instance of this class,
		// 	then there is no point in creating a new instance.
		// We can replace "self" instance, thus forgetting it.
		if (data.movie instanceof Movie) {
			self = data.movie
			delete data.movie
		}

		self.assignDefaults( )
		self.assignData(data)

		// override the returning of "this".
		return self
	}

	/* STEP 1: INITIALIZE CLASS STRUCTURE */
	assignDefaults ( ) {
		// External identification.
		this.ids ??= { }
		// this.ids.api ??= undefined
		// this.ids.imdb ??= undefined

		// // Basic movie information.
		// this.title ??= undefined
		// this.tagline ??= undefined
		// this.overview ??= undefined

		// // Detailed movie information.
		// this.originalTitle ??= undefined
		this.runtime ??= { }

		// // Categorical movie information.
		// this.isAdult ??= undefined
		// this.isVideo ??= undefined // ℹ️ note usage in readme
		// this.status ??= undefined

		// // Trivial movie information.
		// this.homepage ??= undefined
		// this.budget ??= undefined
		// this.revenue ??= undefined
		// this.popularity ??= undefined

		// References to other resources.
		this.backdrops ??= new List(Backdrop)
		this.languages ??= new List(Language)
		this.posters ??= new List(Poster)
		this.releases ??= new List(Release)

		this.genres ??= new List(Genre)
		this.productionCountries ??= new List(Country)

		this.collections ??= new List(Collection)
		this.productionCompanies ??= new List(Company)

		this.reviews ??= new List(Review)
		this.videos ??= new List(Video)

		// Popular Opinion for ratings histogram etc.
		this.ratings ??= new PopularOpinion( )
	}

	/* STEP 2: CLEAN INPUT DATA */
	assignData ({
		config,
		movie,
		backdrops,
		collections,
		companies,
		countries, // not expected
		genres,    // not expected
		images,    // contains backdrops and posters
		languages, // not expected
		posters,
		releases,
		reviews,
		videos,
	}) {

		//+ FIRST, PREPARE THE CONFIG +//
		if (config != undefined) {
			this.#config = new Config({...this.#shared, config})
		}

		//+ ASSIGN MOVIE DATA +//
		if (movie != undefined) {


			// ⚠️ INPUT DIFFERENT THAN OTHER ROUTES!
			/*
			// Redeclare non-existant resources.
			// Useful with "append_to_response" request query in the api.
			if (movie.images !== undefined && images === undefined) {
				images = movie.images
			}
			if (movie.releases !== undefined && releases === undefined) {
				releases = movie.releases
			}
			if (movie.reviews !== undefined && reviews !== undefined) {
				reviews = movie.reviews
			}
			if (movie.videos !== undefined && videos === undefined) {
				videos = movie.videos
			}
			*/

			// External identification.
			if (movie.id !== undefined) {
				this.ids.api = movie.id
			}

			if (movie.imdb_id !== undefined) {
				this.ids.imdb = movie.imdb_id
			}

			if (movie.title !== undefined) {
				this.title = movie.title
			}

			if (movie.tagline !== undefined) {
				this.tagline = movie.tagline
			}

			if (movie.overview !== undefined) {
				this.overview = movie.overview
			}

			// Detailed movie information.
			if (movie.original_title !== undefined) {
				if (movie.original_title !== movie.title) {
					this.originalTitle = movie.original_title
				}
				else {
					this.originalTitle = null
				}
			}

			if (movie.runtime !== undefined) {
				this.runtime = convertToEasyDuration(movie.runtime * 60)
			}

			// Categorical movie information.
			if (movie.adult !== undefined) {
				this.isAdult = movie.adult
			}

			if (movie.video !== undefined) {
				this.isVideo = movie.video
			}

			if (movie.status !== undefined) {
				this.status = movie.status
			}

			// Trivial movie information.
			if (movie.homepage !== undefined) {
				this.homepage = movie.homepage
			}

			if (movie.budget !== undefined) {
				this.budget = movie.budget
			}

			if (movie.revenue !== undefined) {
				this.revenue = movie.revenue
			}

			if (movie.popularity !== undefined) {
				this.popularity = movie.popularity
			}

			// References to other resources.
			// These have a main value found from within the movie.
			if (movie.backdrop_path !== undefined) {
				this.backdrops.setMain({
					...this.#shared,
					backdrop: {file_path: movie.backdrop_path}
				})
			}

			if (movie.belongs_to_collection != undefined) {
				this.collections.setMain({
					...this.#shared,
					collection: movie.belongs_to_collection
				})
			}

			if (movie.backdrop_path !== undefined) {
				this.languages.setMain({
					...this.#shared,
					language: {iso_639_1: movie.original_language}
				})
			}

			if (movie.poster_path !== undefined) {
				this.posters.setMain({
				...this.#shared,
				poster: {file_path: movie.poster_path}
			})
			}

			if (movie.release_date !== undefined) {
				this.releases.setMain({
					...this.#shared,
					release: {release_date: movie.release_date}
				})
			}

			// Add data from movie source.
			if (movie.genres != undefined) {
				let movieGenres = movie.genres
				movieGenres = movieGenres.map((genre) => ({...this.#shared, genre}))
				this.genres.add(...movieGenres)
			}

			if (movie.languages != undefined) {
				let movieLanguages = movie.languages
				movieLanguages = movieLanguages.map((language) => ({...this.#shared, language}))
				this.languages.add(...movieLanguages)
			}

			if (movie.production_companies != undefined) {
				let movieCompanies = movie.production_companies
				movieCompanies = movieCompanies.map((company) => ({...this.#shared, company,}))
				this.productionCompanies.add(...movieCompanies)
			}

			if (movie.production_countries != undefined) {
				let movieCountries = movie.production_countries
				movieCountries = movieCountries.map((country) => ({...this.#shared, country, }))
				this.productionCountries.add(...movieCountries)
			}

			// Add opinions from the movie data.
			this.ratings.assignData({
				...this.#shared,
				polling: {vote_count: movie.vote_count, vote_average: movie.vote_average},
			})
		}

		//+ ASSIGN BACKDROPS ARRAY +//
		if (backdrops != undefined) {
			// Prepare items to be used in the class constructor.
			backdrops = backdrops.map((backdrop) => ({...this.#shared, backdrop}))
			this.backdrops.add(...backdrops)
		}

		//+ ASSIGN COLLECTIONS ARRAY +//
		if (collections != undefined) {
			// Prepare items to be used in the class constructor.
			collections = collections.map((collection) => ({...this.#shared, collection}))
			this.collections.add(...collections)
		}

		//+ ASSIGN COMPANIES ARRAY +//
		if (companies != undefined) {
			// Prepare items to be used in the class constructor.
			companies = companies.map((company) => ({...this.#shared, company}))
			this.productionCompanies.add(...companies)
		}

		//+ ASSIGN IMAGES +//
		if (images != undefined) {
			// Prepare items to be used in the class constructor.
			let imageBackdrops = images.backdrops.map((backdrop) => ({...this.#shared, backdrop}))
			let imagePosters = images.posters.map((poster) => ({...this.#shared, poster}))
			this.backdrops.add(...imageBackdrops)
			this.posters.add(...imagePosters)
		}

		//+ ASSIGN POSTERS ARRAY +//
		if (posters != undefined) {
			// Prepare items to be used in the class constructor.
			posters = posters.map((poster) => ({...this.#shared, poster}))
			this.posters.add(...posters)
		}

		//+ ASSIGN RELEASES ARRAY +//
		if (releases != undefined) {
			// Prepare items to be used in the class constructor.
			releases = releases.results.map((isoGroup) => {
				const iso_3166_1 = isoGroup.iso_3166_1
				return isoGroup.release_dates.map((release) => ({...release, iso_3166_1}))
			}).flat( ).map((release) => ({...this.#shared, release}))
			this.releases.add(...releases)
		}

		//+ ASSIGN REVIEWS ARRAY +//
		if (reviews != undefined) {
			// Add opinions from the review data.
			this.ratings.assignData({...this.#shared, reviews})

			// Prepare items to be used in the class constructor.
			reviews = reviews.results.map((review) => ({...this.#shared, review}))
			this.reviews.add(...reviews)
		}

		//+ ASSIGN VIDEOS ARRAY +//
		if (videos != undefined) {
			// Prepare items to be used in the class constructor.
			videos = videos.results.map((video) => ({...this.#shared, video}))
			this.videos.add(...videos)
		}

		// Clean up class data.
		this.assignDefaults( )
	}

	toJSON ( ) {
		return this
	}

	get #shared ( ) {
		return {
			movie: this,
			config: this.#config,
		}
	}

	static matches (item01, item02) {
		if (!(item01 instanceof Movie && item02 instanceof Movie)) {
			return false
		}

		return item01.ids.api === item02.ids.api
	}

	static combine (item01, item02) {
		// ⚠️ complete this function
		return item01
	}
}

export {Movie}

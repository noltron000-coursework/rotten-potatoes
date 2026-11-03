import {
	convertToEasyDate,
	convertToStarGrade,
	cleanseIsoCode,
} from '../helpers/conversions.mjs'

import {Config} from './config.mjs'
import {Movie} from './movie.mjs'
import {User} from './user.mjs'

class Review {
	#config
	constructor (data = { }) {
		let self = this  // allow forgetting of "this"
		data = {...data}  // dont mutate input data
		// If the data already has an instance of this class,
		// 	then there is no point in creating a new instance.
		// We can replace "self" instance, thus forgetting it.
		if (data.review instanceof Review) {
			self = data.review
			delete data.review
		}

		self.assignDefaults( )
		self.assignData(data)

		// override the returning of "this".
		return self
	}

	/* STEP 1: INITIALIZE CLASS STRUCTURE */
	assignDefaults ( ) {
		this.ids ??= { }
		// this.ids.api ??= null
		// this['iso639-1'] ??= null

		// this.rating ??= null
		// this.title ??= null
		// this.content ??= null

		this.creationDate ??= { }
		this.revisionDate ??= { }

		this.author ??= new User( )
		this.movie ??= new Movie( )
	}

	/* STEP 2: CLEAN INPUT DATA */
	assignData ({
		config,
		review,
		movie,
	}) {

		//+ FIRST, PREPARE THE CONFIG +//
		if (config != undefined) {
			this.#config = new Config({...this.#shared, config})
		}

		//+ ASSIGN REVIEW DATA +//
		if (review != undefined) {

			// External identification.
			if (review.source === 'api' || review.source === undefined) {
				this.source = 'api'
				if (review.id !== undefined) {
					this.ids.api = review.id
				}

				// Review information.
				if (review.author_details?.rating !== undefined) {
					this.rating = convertToStarGrade(review.author_details.rating)
				}

				if (review.content !== undefined) {
					this.content = review.content
				}

				// Metadata.
				if (review.created_at !== undefined) {
					this.creationDate = convertToEasyDate(new Date(Date.parse(review.created_at)))
				}

				if (review.updated_at !== undefined) {
					this.revisionDate = convertToEasyDate(new Date(Date.parse(review.updated_at)))
				}

				if (review.iso_639_1 !== undefined) {
					this['iso639-1'] = cleanseIsoCode(review.iso_639_1)
				}

				// Author Data.
				if (review.author_details !== undefined) {
					this.author.assignData({
						...this.#shared,
						user: review.author_details,
					})
				}
			}

			else if (review.source === 'db') {
				// ⚠️ COMPLETE THIS SECTION
				this.source = 'db'
			}
		}

		//+ ASSIGN MOVIE DATA +//
		if (movie != undefined) {
			this.movie = new Movie({...this.#shared, movie})
		}
		else if (this.source === 'api' && review?.movie_id != undefined) {
			this.movie = new Movie({...this.#shared, movie: {id: review.movie_id}})
		}
		else if (this.source === 'db' && review?.movieId != undefined) {
			this.movie = new Movie({...this.#shared, movie: {id: review.movieId}})
		}

		// Clean up class data.
		this.assignDefaults( )
	}

	toJSON ( ) {
		const json = {...this}
		json.movie = {ids: {api: this.movie.ids.api}}
		return json
	}

	get #shared ( ) {
		return {
			review: this,
			config: this.#config,
		}
	}

	static matches (item01, item02) {
		if (!(item01 instanceof Review && item02 instanceof Review)) {
			return false
		}

		return item01.ids.api === item02.ids.api
	}

	static combine (item01, item02) {
		// ⚠️ complete this function
		return item01
	}
}

export {Review}

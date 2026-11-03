import {
	convertToStarGrade,
	convertToVulgarFraction,
} from '../helpers/conversions.mjs'

import {Config} from './config.mjs'
import {List} from './list.mjs'
import {Review} from './review.mjs'

class PopularOpinion {
	#config
	constructor (data = { }) {
		let self = this  // allow forgetting of "this"
		data = {...data}  // dont mutate input data
		// If the data already has an instance of this class,
		// 	then there is no point in creating a new instance.
		// We can replace "self" instance, thus forgetting it.
		if (data.polling instanceof PopularOpinion) {
			self = data.polling
			delete data.polling
		}

		self.assignDefaults( )
		self.assignData(data)

		// override the returning of "this".
		return self
	}

	/* STEP 1: INITIALIZE CLASS STRUCTURE */
	assignDefaults ( ) {
		// Zero out counts and totals.
		this.count ??= 0
		this.total ??= 0
		const percentogram = (number) => {
			const percentage = Math.round(this.histogram[number].count / this.histogramCount * 100)
			if (Number.isNaN(percentage)) {
				return 0
			}
			return percentage
		}
		this.histogram ??= { }
		this.histogram['0'] ??= {
			count: 0,
			get percent ( ) {
				return percentogram('0')
			}
		}
		this.histogram['1'] ??= {
			count: 0,
			get percent ( ) {
				return percentogram('1')
			}
		}
		this.histogram['2'] ??= {
			count: 0,
			get percent ( ) {
				return percentogram('2')
			}
		}
		this.histogram['3'] ??= {
			count: 0,
			get percent ( ) {
				return percentogram('3')
			}
		}
		this.histogram['4'] ??= {
			count: 0,
			get percent ( ) {
				return percentogram('4')
			}
		}
		this.histogram['5'] ??= {
			count: 0,
			get percent ( ) {
				return percentogram('5')
			}
		}
	}

	/* STEP 2: CLEAN INPUT DATA */
	assignData ({
		config,
		polling,
		reviews,
	}) {

		//+ FIRST, PREPARE THE CONFIG +//
		if (config != undefined) {
			this.#config = new Config({...this.#shared, config})
		}

		//+ ASSIGN POLLING DATA +//
		if (polling != undefined) {

			// Check vote counts and average. Extract the total and count.
			if (polling.vote_count !== undefined && polling.vote_average !== undefined) {
				const voteCount = polling.vote_count
				const voteAverage = convertToStarGrade(polling.vote_average)
				const voteTotal = voteAverage * voteCount
				this.total += voteTotal
				this.count += voteCount
			}
		}

		//+ ASSIGN REVIEWS ARRAY +//
		if (reviews != undefined) {

			// Use reviews for histogram information.
			reviews = new List(Review, ...reviews.results)
			reviews.forEach((review) => {
				if (review.source === 'api') {
					if (review.rating != undefined) {
						this.histogram[Math.round(review.rating)] += 1
					}
				}
				else if (review.source === 'db') {
					if (review.rating != undefined) {
						this.count += 1
						this.total += review.rating
						this.histogram[review.rating] += 1
					}
				}
			})
		}

		// Clean up class data.
		this.assignDefaults( )
	}

	assignFromDb (data) {
		// Clean up class data.
		this.assignDefaults( )
	}

	toJSON ( ) {
		const json = Object.assign({ }, this)
		json.average = this.average
		json.vulgarAverage = this.vulgarAverage
		json.histogramCount = this.histogramCount
		json.histogramMost = this.histogramMost
		Object.defineProperty(json.histogram['0'], 'percent', {'value': this.histogram['0'].percent})
		Object.defineProperty(json.histogram['1'], 'percent', {'value': this.histogram['1'].percent})
		Object.defineProperty(json.histogram['2'], 'percent', {'value': this.histogram['2'].percent})
		Object.defineProperty(json.histogram['3'], 'percent', {'value': this.histogram['3'].percent})
		Object.defineProperty(json.histogram['4'], 'percent', {'value': this.histogram['4'].percent})
		Object.defineProperty(json.histogram['5'], 'percent', {'value': this.histogram['5'].percent})
		return json
	}

	get average ( )  {
		return this.total / this.count
	}

	get vulgarAverage ( ) {
		return convertToVulgarFraction(this.average)
	}

	get histogramCount ( ) {
		return Object.values(this.histogram).reduce((a, b) => (a + b), 0)
	}

	get histogramMost ( ) {
		return Math.max(...Object.values(this.histogram))
	}

	get #shared ( ) {
		return {
			collection: this,
			config: this.#config,
		}
	}
}

export {PopularOpinion}

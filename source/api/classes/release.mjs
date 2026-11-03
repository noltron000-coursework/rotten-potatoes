import {
	convertToEasyDate,
	cleanseIsoCode,
} from '../helpers/conversions.mjs'

import {Config} from './config.mjs'

class Release {
	#config
	constructor (data = { }) {
		let self = this  // allow forgetting of "this"
		data = {...data}  // dont mutate input data
		// If the data already has an instance of this class,
		// 	then there is no point in creating a new instance.
		// We can replace "self" instance, thus forgetting it.
		if (data.release instanceof Release) {
			self = data.release
			delete data.release
		}

		self.assignDefaults( )
		self.assignData(data)

		// override the returning of "this".
		return self
	}

	/* STEP 1: INITIALIZE CLASS STRUCTURE */
	assignDefaults ( ) {
		this.date ??= { }
		// this.certification ??= null
		// this['iso3166-1'] ??= null
		// this['iso639-1']  ??= null
		// this.type ??= null
		// this.note ??= null
	}

	/* STEP 2: CLEAN INPUT DATA */
	assignData ({
		config,
		release,
	}) {

		//+ FIRST, PREPARE THE CONFIG +//
		if (config != undefined) {
			this.#config = new Config({...this.#shared, config})
		}

		//+ ASSIGN RELEASE DATA +//
		if (release != undefined) {

			// The date and its metadata.
			if (release.release_date !== undefined) {
				this.date = convertToEasyDate(new Date(Date.parse(release.release_date)))
			}

			if (release.type !== undefined) {
				// From api — Release dates support different types:
				const types = {
					1: 'premiere',
					2: 'theatrical (limited)',
					3: 'theatrical',
					4: 'digital',
					5: 'physical',
					6: 'tv',
				}
				this.type = types[release.type]
			}

			if (release.note !== undefined) {
				this.note = release.note || undefined
			}

			// Release date properties.
			if (release.certification !== undefined) {
				this.certification = release.certification || undefined
			}

			if (release.iso_3166_1 !== undefined) {
				this['iso3166-1'] = cleanseIsoCode(release.iso_3166_1) || undefined
			}

			if (release.iso_639_1 !== undefined) {
				this['iso639-1'] = cleanseIsoCode(release.iso_639_1) || undefined
			}
		}

		// Clean up class data.
		this.assignDefaults( )
	}

	get #shared ( ) {
		return {
			release: this,
			config: this.#config,
		}
	}

	static matches (item01, item02) {
		if (!(item01 instanceof Release && item02 instanceof Release)) {
			return false
		}

		return item01.date?.stamp === item02.date?.stamp
	}

	static combine (item01, item02) {
		// ⚠️ complete this function
		return item01
	}
}

export {Release}

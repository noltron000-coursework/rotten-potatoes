import {cleanseIsoCode} from '../helpers/conversions.mjs'

import {Config} from './config.mjs'

class Language {
	#config
	constructor (data = { }) {
		let self = this  // allow forgetting of "this"
		data = {...data}  // dont mutate input data
		// If the data already has an instance of this class,
		// 	then there is no point in creating a new instance.
		// We can replace "self" instance, thus forgetting it.
		if (data.language instanceof Language) {
			self = data.language
			delete data.language
		}

		self.assignDefaults( )
		self.assignData(data)

		// override the returning of "this".
		return self
	}

	/* STEP 1: INITIALIZE CLASS STRUCTURE */
	assignDefaults ( ) {
		// this['iso639-1'] ??= null
		// this.name ??= null
	}

	/* STEP 2: CLEAN INPUT DATA */
	assignData ({
		config,
		language,
	}) {

		//+ FIRST, PREPARE THE CONFIG +//
		if (config != undefined) {
			this.#config = new Config({...this.#shared, config})
		}

		//+ ASSIGN LANGUAGE DATA +//
		if (language != undefined) {
			if (language.iso_639_1 !== undefined) {
				this['iso639-1'] = cleanseIsoCode(language.iso_639_1) || undefined
			}
			if (language.name !== undefined) {
				this.name = language.name
			}
		}

		// Clean up class data.
		this.assignDefaults( )
	}

	toJSON ( ) {
		return this
	}

	get #shared ( ) {
		return {
			language: this,
			config: this.#config,
		}
	}

	static matches (item01, item02) {
		if (!(item01 instanceof Language && item02 instanceof Language)) {
			return false
		}

		return item01.ids.api === item02.ids.api
	}

	static combine (item01, item02) {
		// ⚠️ complete this function
		return item01
	}
}

export {Language}

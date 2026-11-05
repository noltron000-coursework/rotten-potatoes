import {Config} from './config.mjs'

class Comment {
	#config
	constructor (data = { }) {
		let self = this  // allow forgetting of "this"
		data = {...data}  // dont mutate input data
		// If the data already has an instance of this class,
		// 	then there is no point in creating a new instance.
		// We can replace "self" instance, thus forgetting it.
		if (data.comment instanceof Comment) {
			self = data.comment
			delete data.comment
		}

		self.assignDefaults( )
		self.assignData(data)

		// override the returning of "this".
		return self
	}

	/* STEP 1: INITIALIZE CLASS STRUCTURE */
	assignDefaults ( ) {
		this._id ??= undefined
		this.content ??= undefined
		this.api_review_id ??= undefined
		this.db_review_id ??= undefined
	}

	/* STEP 2: CLEAN INPUT DATA */
	assignData ({
		config,
		comment,
	}) {

		//+ FIRST, PREPARE THE CONFIG +//
		if (config != undefined) {
			this.#config = new Config({...this.#shared, config})
		}

		if (comment != undefined) {
			if (comment._id !== undefined) {
				this._id = comment._id
			}
			if (comment.content !== undefined) {
				this.content = comment.content
			}
			if (comment.api_review_id !== undefined) {
				this.api_review_id = comment.api_review_id
			}
			if (comment.db_review_id !== undefined) {
				this.db_review_id = comment.db_review_id
			}
		}

		// Clean up class data.
		this.assignDefaults( )
	}

	get #shared ( ) {
		return {
			comment: this,
			config: this.#config,
		}
	}
}

export {Comment}

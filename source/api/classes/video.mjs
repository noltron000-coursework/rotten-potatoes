import {cleanseIsoCode} from '../helpers/conversions.mjs'

import {Config} from './config.mjs'
import {List} from './list.mjs'
import {Thumbnail} from './image.mjs'

class Video {
	#config
	constructor (data = { }) {
		let self = this  // allow forgetting of "this"
		data = {...data}  // dont mutate input data
		// If the data already has an instance of this class,
		// 	then there is no point in creating a new instance.
		// We can replace "self" instance, thus forgetting it.
		if (data.video instanceof Video) {
			self = data.video
			delete data.video
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
		this.urls ??= { }
		// this.urls.main ??= null
		// this.urls.embed ??= null
		// this['iso639-1'] ??= null
		// this['iso3166-1'] ??= null
		// this.key ??= null
		// this.name ??= null
		// this.site ??= null
		// this.size ??= null
		// this.type ??= null
		// this.thumbnail ??= new List(Thumbnail)
	}

	/* STEP 2: CLEAN INPUT DATA */
	assignData ({
		config,
		video,
	}) {

		//+ FIRST, PREPARE THE CONFIG +//
		if (config != undefined) {
			this.#config = new Config({...this.#shared, config})
		}

		//+ ASSIGN VIDEO DATA +//
		if (video != undefined) {
			if (video.id !== undefined) {
				this.ids.api = video.id
			}

			if (video.key !== undefined) {
				this.key = video.key
			}

			if (video.iso_639_1 !== undefined) {
				this['iso639-1'] = cleanseIsoCode(video.iso_639_1)
			}

			if (video.iso_3166_1 !== undefined) {
				this['iso3166-1'] = cleanseIsoCode(video.iso_3166_1)
			}

			if (video.name !== undefined) {
				this.name = video.name
			}

			if (video.site !== undefined) {
				this.site = video.site
			}

			if (video.size !== undefined) {
				this.size = video.size
			}

			if (video.type !== undefined) {
				this.type = video.type
			}

			if (this.site !== undefined && this.key !== undefined) {
				if (this.site === 'YouTube') {
					this.urls.main = `https://www.youtube.com/watch?v=${this.key}`
					this.urls.embed = `https://www.youtube.com/embed/${this.key}`

					this.thumbnail = new Thumbnail({thumbnail: {
						key: this.key,
						width: 480,
						height: 360,
					}})
				}

				else if (this.site === 'Vimeo') {
					this.urls.main = `https://vimeo.com/${this.key}`
					this.urls.embed = this.urls.main
				}
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
			video: this,
			config: this.#config,
		}
	}

	static matches (item01, item02) {
		if (!(item01 instanceof Video && item02 instanceof Video)) {
			return false
		}

		return item01.ids.api === item02.ids.api
	}

	static combine (item01, item02) {
		// ⚠️ complete this function
		return item01
	}
}

export {Video}

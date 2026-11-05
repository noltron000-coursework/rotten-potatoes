import {cleanseIsoCode} from '../helpers/conversions.mjs'

import {Config} from './config.mjs'
import {PopularOpinion} from './popular-opinion.mjs'
import {assertMatching} from '../helpers/assert-matching.mjs'
import {mergeUndefined} from '../helpers/merge-undefined.mjs'

class Image {
	#config
	constructor (data = { }, type = 'image') {
		let self = this  // allow forgetting of "this"
		data = {...data}  // dont mutate input data
		// Sometimes the image type might be something else,
		// 	especially if it is an extended class / subclass.
		// For example, an avatar extends an image.
		if (type !== 'image') {
			data.image = data[type]
			delete data[type]
		}
		// If the data already has an instance of this class,
		// 	then there is no point in creating a new instance.
		// We can replace "self" instance, thus forgetting it.
		if (data.image instanceof Image && type === data.image.type) {
			self = data.image
			delete data.image
		}
		else {
			self.type = type
		}

		self.assignDefaults( )
		self.assignData(data)

		// override the returning of "this".
		return self
	}

	/* STEP 1: INITIALIZE CLASS STRUCTURE */
	assignDefaults ( ) {
		// // Image Properties
		// this.basePath ??= null
		// this['iso639-1'] ??= null
		// this.originalWidth ??= null
		// this.originalHeight ??= null

		this.ratings ??= new PopularOpinion( )
		this.sizes ??= [ ]
	}

	/* STEP 2: CLEAN INPUT DATA */
	assignData ({
		config,
		image,
		movie,
	}) {

		//+ FIRST, PREPARE THE CONFIG +//
		if (config != undefined) {
			this.#config = new Config({...this.#shared, config})
		}

		//+ ASSIGN IMAGE DATA +//
		if (image != undefined) {

			// Image properties.
			if (image.height != undefined) {
				this.originalHeight = image.height
			}

			if (image.width != undefined) {
				this.originalWidth = image.width
			}

			if (image.iso_639_1 != undefined) {
				this['iso639-1'] = cleanseIsoCode(image.iso_639_1)
			}

			// URL construction and image identification.
			if (image.file_path != undefined) {
				this.basePath = image.file_path

				const regex = /^\/?https?:\/\//
				if (regex.test(this.basePath)) {
					this.sizes.push({
						facet: 'external',
						size: null,
						urls: {main: this.basePath.replace(regex, 'https://')},
					})
				}
				else if (this.#config != undefined) {
					this.sizes.push(
						...this.#config
						.images[`${this.type}Sizes`]
						.map((imageSize) => {
							let url = this.#config.images.baseURL.secure
								?? this.#config.images.baseURL.default
							if (imageSize.facet === 'original') {
								url += imageSize.facet
							}
							else {
								url += imageSize.facet.slice(0, 1)
								url += imageSize.size
							}
							url += this.basePath
							return {...imageSize, urls: {main: url}}
						})
					)
				}
			}

			// Special case for thumbnails.
			if (image.key != undefined && this.type === 'thumbnail') {
				this.basePath = `https://img.youtube.com/vi/${image.key}`
				const sizes = [
					{
						urls: {main: `${this.basePath}/hqdefault.jpg`},
						facet: 'width',
						size: 480,
					},
					{
						urls: {main: `${this.basePath}/mqdefault.jpg`},
						facet: 'width',
						size: 320,
					},
					{
						urls: {main: `${this.basePath}/default.jpg`},
						facet: 'width',
						size: 120,
					},
				]
				this.sizes.push(...sizes)
			}

			// Add opinions from the image data.
			this.ratings.assignData({
				...this.#shared,
				polling: {vote_count: image.vote_count, vote_average: image.vote_average},
			})
		}

		// Clean up class data.
		this.assignDefaults( )
	}

	toJSON ( ) {
		const json = Object.assign({ }, this)
		json.aspectRatio = this.aspectRatio
		return json
	}

	get aspectRatio ( ) {
		return this.originalWidth / this.originalHeight
	}

	get #shared ( ) {
		return {
			[this.type]: this,
			config: this.#config,
		}
	}

	static matches (item01, item02) {
		if (!(item01 instanceof Image && item02 instanceof Image)) {
			return false
		}

		return item01.basePath === item02.basePath
	}

	static combine (item01, item02) {
		assertMatching(this, item01, item02)

		const combined = mergeUndefined(new this(), item01, item02)
		combined.ratings = item01.ratings !== undefined
			? item01.ratings
			: item02.ratings

		combined.sizes = [...item01.sizes]
		for (const size of item02.sizes) {
			const existingSize = combined.sizes.find((candidate) => (
				candidate.facet === size.facet && candidate.size === size.size
			))
			if (existingSize === undefined) {
				combined.sizes.push(mergeUndefined({}, size))
			}
			else {
				mergeUndefined(existingSize, size)
			}
		}
		return combined
	}
}

class Backdrop extends Image {
	constructor (data) {
		super(data, 'backdrop')
	}
}

class Poster extends Image {
	constructor (data) {
		super(data, 'poster')
	}
}

class Avatar extends Image {
	constructor (data) {
		super(data, 'avatar')
	}
}

class Logo extends Image {
	constructor (data) {
		super(data, 'logo')
	}
}

class Still extends Image {
	constructor (data) {
		super(data, 'still')
	}
}

class Thumbnail extends Image {
	constructor (data) {
		super(data, 'thumbnail')
	}
}

export {
	Image,
	Backdrop,
	Poster,
	Avatar,
	Logo,
	Still,
	Thumbnail,
}

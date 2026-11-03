class Config {
	constructor (data = { }) {
		let self = this  // allow forgetting of "this"
		data = {...data}  // dont mutate input data
		// If the data already has an instance of this class,
		// 	then there is no point in creating a new instance.
		// We can replace "self" instance, thus forgetting it.
		if (data.config instanceof Config) {
			self = data.config
			delete data.config
		}

		self.assignDefaults( )
		self.assignData(data)

		// override the returning of "this".
		return self
	}

	/* STEP 1: INITIALIZE CLASS STRUCTURE */
	assignDefaults ( ) {
		this.images ??= { }

		this.images.baseURL ??= { }
		this.images.baseURL.default ??= null
		this.images.baseURL.secure ??= null

		this.images.backdropSizes ??= [ ]
		this.images.posterSizes ??= [ ]
		this.images.avatarSizes ??= [ ]
		this.images.logoSizes ??= [ ]
		this.images.stillSizes ??= [ ]

		this.changeKeys ??= [ ]
	}

	/* STEP 2: CLEAN INPUT DATA */
	assignData ({config}) {
		if (config != undefined) {
			this.images.baseURL.default = config.images.base_url
			this.images.baseURL.secure = config.images.secure_base_url

			const cleanSize = (sizeStr) => {
				const cleaned = {
					facet: null,
					size: null,
				}
				if (sizeStr === 'original') {
					cleaned.facet = sizeStr
					cleaned.size = null
				}
				else if (sizeStr[0] === 'w') {
					cleaned.facet = 'width'
					cleaned.size = parseInt(sizeStr.slice(1))
				}
				else if (sizeStr[0] === 'h') {
					cleaned.facet = 'height'
					cleaned.size = parseInt(sizeStr.slice(1))
				}
				return cleaned
			}

			this.images.backdropSizes = config.images.backdrop_sizes.map(size => cleanSize(size)).reverse( )
			this.images.posterSizes =     config.images.poster_sizes.map(size => cleanSize(size)).reverse( )
			this.images.avatarSizes =    config.images.profile_sizes.map(size => cleanSize(size)).reverse( )
			this.images.logoSizes =         config.images.logo_sizes.map(size => cleanSize(size)).reverse( )
			this.images.stillSizes =       config.images.still_sizes.map(size => cleanSize(size)).reverse( )

			config.changeKeys && (this.changeKeys = config.changeKeys)
		}

		// Clean up class data.
		this.assignDefaults( )
	}

	get #shared ( ) {
		return {
			config: this
		}
	}
}

export {Config}

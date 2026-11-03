/*
import {Config} from './config.mjs'
*/

// ⚠️ [TODO] REMOVE TEMPORARY DEV CODE
const eject = (instance) => (JSON.parse(JSON.stringify(instance)))
class List extends Array { }

class Genre {
	/* STEP 1: INITIALIZE CLASS ATTRIBUTE STRUCTURE */
	// Static config info (ℹ️ must be initialized by app)
	static config = undefined

	// External identification
	ids = {
		TMDb: undefined, // The Movie Database
		RPDb: null,      // Rotten Potatoes (ℹ️ never stores genres)
		IMDb: null,      // Internet Movie Database (ℹ️ not supported)
	}

	// Genre name
	name = undefined


	/* STEP 2: APPLY NEW INSTANCE CONSTRUCTION */
	constructor (data = { }) {
		let self = this   // allow the forgetting of "this"
		data = {...data}  // dont mutate input data

		// If the data already has an instance of this class,
		// 	then there is no point in creating a new instance.
		// We can replace "self" instance, thus forgetting it.
		if (data.genre instanceof Genre) {
			self = data.genre
			delete data.genre
		}

		// The "self" variable can either be "this",
		// 	or another class instance obtained from the data.
		self.assignData(data)

		return self  // override the returning of "this"
	}


	/* STEP 3: CLEAN AND ASSIGN DATA INPUT TO THE INSTANCE */
	assignData ({genre}) {
		//+ CLEAN THE GENRE DATA +//
		if (genre == null) {
			return
		}
		else if (genre.ids == null) {
			({genre} = Genre.parseFromAPI({genre}))
		}
		else {
			({genre} = Genre.parseFromDB({genre}))
		}

		//+ ASSIGN THE GENRE DATA +//
		this.ids.TMDb = genre.ids.TMDb
		this.name = genre.name
	}


	toJSON ( ) {
		return this
	}


	static parseFromAPI ({genre}) {
		const newGenre = eject(new Genre())
		newGenre.ids.TMDb = genre.id
		newGenre.name = genre.name
		return {genre: newGenre}
	}


	static parseFromDB ({genre}) {
		return {genre}
	}


	static matches (...instances) {
		const areAllGenres = !instances.some((instance) => (
			// There is some instance that isn't a genre.
			!(instance instanceof Genre)
		))

		// If something isn't a genre, then its not a match!
		if (!areAllGenres) {
			return false
		}

		// Use this helper for checking if pairs of instances match.
		const attributesMatch = (attributeA, attributeB) => {
			if (
				attributeA === undefined
				|| attributeB === undefined
			) {
				return true
			}
			else if (attributeA === attributeB) {
				return true
			}
			else {
				return false
			}
		}

		// Get every combination pair of instances.
		for (
			let indexA = 0;
			indexA < instances.length;
			indexA++
		) {
			for (
				let indexB = indexA + 1;
				indexB < instances.length;
				indexB++
			) {
				// Get this pair of instances.
				const instanceA = instances[indexA]
				const instanceB = instances[indexB]

				// Determine of *ALL* of their attributes match.
				if (
					!attributesMatch(instanceA.name, instanceB.name)
					|| !attributesMatch(instanceA.ids.TMDb, instanceB.ids.TMDb)
					|| !attributesMatch(instanceA.ids.RPDb, instanceB.ids.RPDb)
					|| !attributesMatch(instanceA.ids.IMDb, instanceB.ids.IMDb)
				) {
					// If it gets here, something doesn't match!
					return false
				}
			}
		}
		// If the loops all finish, then literally everything matches!
		return true
	}


	static combine (...instances) {
		// Ensure all given instances are matching.
		if (!Genre.matches(instances)) {
			return false
		}

		const combined = instances.reduce((combined, current) => {
			if (combined.name === undefined) {
				combined.name = current.name
			}
			if (combined.ids.RPDb === undefined) {
				combined.ids.RPDb = current.ids.RPDb
			}
			if (combined.ids.TMDb === undefined) {
				combined.ids.TMDb = current.ids.TMDb
			}
			if (combined.ids.IMDb === undefined) {
				combined.ids.IMDb = current.ids.IMDb
			}
			return combined
		}, new Genre( ))

		return combined
	}


	get #sharedMetadata ( ) {
		return {
			genre: this,
			config: Genre.config,
		}
	}
}

export {Genre}

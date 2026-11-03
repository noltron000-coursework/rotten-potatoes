/*
import {Config} from './config.mjs'
*/
import {cleanseIsoCode} from '../../helpers/conversions.mjs'

// ⚠️ [TODO] REMOVE TEMPORARY DEV CODE
const eject = (instance) => (JSON.parse(JSON.stringify(instance)))
class List extends Array { }


class Country {
	/* STEP 1: INITIALIZE CLASS ATTRIBUTE STRUCTURE */
	// Static config info (ℹ️ must be initialized by app)
	static config = undefined

	// Universal country code
	'iso3166-1' = undefined

	// Country name in english
	name = undefined


	/* STEP 2: APPLY NEW INSTANCE CONSTRUCTION */
	constructor (data = { }) {
		let self = this   // allow the forgetting of "this"
		data = {...data}  // dont mutate input data

		// If the data already has an instance of this class,
		// 	then there is no point in creating a new instance.
		// We can replace "self" instance, thus forgetting it.
		if (data.country instanceof Country) {
			self = data.country
			delete data.country
		}

		// The "self" variable can either be "this",
		// 	or another class instance obtained from the data.
		self.assignData(data)

		return self  // override the returning of "this"
	}


	/* STEP 3: CLEAN AND ASSIGN DATA INPUT TO THE INSTANCE */
	assignData ({country}) {
		//+ CLEAN THE COUNTRY DATA +//
		if (country == null) {
			return
		}
		else if (country.ids == null) {
			({country} = Country.parseFromAPI({country}))
		}
		else {
			({country} = Country.parseFromDB({country}))
		}

		//+ ASSIGN THE COUNTRY DATA +//
		this['iso3166-1'] = country['iso3166-1']
		this.name = country.name
	}


	toJSON ( ) {
		return this
	}


	static parseFromAPI ({country}) {
		const newCountry = eject(new Country())
		newCountry['iso3166-1'] = cleanseIsoCode(country.iso_3166_1)
		newCountry.name = country.name
		return {country: newCountry}
	}


	static parseFromDB ({country}) {
		return {country}
	}


	static matches (...instances) {
		if (instances.length === 1) return true
		if (instances.length === 0) return false
		if (instances.some((instance) => !(
			instance instanceof Country
		))) return false

		const attributes = ['iso3166-1', 'name']
		let hasMatchingAttribute = false

		for (let indexA = 0; indexA < instances.length; indexA++) {
			for (let indexB = indexA + 1; indexB < instances.length; indexB++) {
				for (const attribute of attributes) {
					const valueA = instances[indexA][attribute]
					const valueB = instances[indexB][attribute]
					const isKnownA = valueA != null
					const isKnownB = valueB != null

					if (isKnownA && isKnownB) {
						if (valueA !== valueB) return false
						else hasMatchingAttribute = true
					}
				}
			}
		}

		return hasMatchingAttribute
	}

	// TODO: Add "combine"
	static combine () {throw new Error('⚠️ Need to implement combine on Country!')}

	// TODO: Add "sharedMetadata"
	static #sharedMetadata () {throw new Error('⚠️ Need to implement #sharedMetadata on Country!')}
}

export {Country}

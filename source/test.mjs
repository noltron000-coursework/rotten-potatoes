import data from './test-data.mjs'

import {Movie} from './main.mjs'

const eject = (instance) => (JSON.parse(JSON.stringify(instance)))

const main = ( ) => {
	const movie = eject(new Movie(data))
	console.info(movie.genres)
}

main( )

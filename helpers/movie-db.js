import 'dotenv/config'
import {MovieDb} from 'moviedb-promise'

const apiKey = process.env.TMDB_API_KEY
if (!apiKey) {
	throw new Error('TMDB_API_KEY environment variable is required')
}

const moviedb = new MovieDb(apiKey)

export default moviedb

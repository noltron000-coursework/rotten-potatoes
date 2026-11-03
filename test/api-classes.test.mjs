import assert from 'node:assert/strict'
import test from 'node:test'

import {Movie} from '../source/api/classes/movie.mjs'
import {
	convertToStarGrade,
	convertToVulgarFraction,
} from '../source/api/helpers/conversions.mjs'
import {Video} from '../source/api/classes/video.mjs'
import {Country} from '../source/api/classes/collections/country.mjs'

test('converts TMDB ratings to a five-star scale', ( ) => {
	assert.equal(convertToStarGrade(10), 5)
	assert.equal(convertToStarGrade(1), 0)
	assert.equal(convertToStarGrade(null), null)
})

test('formats star ratings as vulgar fractions', ( ) => {
	assert.equal(convertToVulgarFraction(3.5), '3½')
	assert.equal(convertToVulgarFraction(0), '0')
	assert.equal(convertToVulgarFraction(Number.NaN), null)
})

test('builds YouTube video and thumbnail URLs', ( ) => {
	const video = new Video({
		video: {
			key: 'trailer-key',
			site: 'YouTube',
		},
	})

	assert.equal(video.urls.main, 'https://www.youtube.com/watch?v=trailer-key')
	assert.equal(video.urls.embed, 'https://www.youtube.com/embed/trailer-key')
	assert.equal(
		video.thumbnail.sizes[0].urls.main,
		'https://img.youtube.com/vi/trailer-key/hqdefault.jpg',
	)
})

test('maps TMDB movie video results to Video instances', ( ) => {
	const movie = new Movie({
		videos: {
			results: [{
				id: 'video-id',
				key: 'trailer-key',
				site: 'YouTube',
				type: 'Trailer',
			}],
		},
	})

	assert.equal(movie.videos.length, 1)
	assert.equal(movie.videos[0].type, 'Trailer')
	assert.equal(movie.videos[0].urls.embed, 'https://www.youtube.com/embed/trailer-key')
})

test('matches countries by compatible ISO codes and names', ( ) => {
	const unitedStates = new Country({
		country: {iso_3166_1: 'US', name: 'United States'},
	})
	const sameCountry = new Country({
		country: {iso_3166_1: 'US', name: 'United States'},
	})
	const sameName = new Country({country: {name: 'United States'}})
	const canada = new Country({
		country: {iso_3166_1: 'CA', name: 'Canada'},
	})

	assert.equal(Country.matches(unitedStates, sameCountry), true)
	assert.equal(Country.matches(unitedStates, sameName), true)
	assert.equal(Country.matches(unitedStates, canada), false)
	assert.equal(Country.matches(unitedStates, {}), false)
	assert.equal(Country.matches(new Country(), new Country()), false)
	assert.equal(Country.matches(), false)
})

test('combines matching country data without modifying the inputs', ( ) => {
	const byCode = new Country({country: {iso_3166_1: 'US'}})
	const byName = new Country({
		country: {iso_3166_1: 'US', name: 'United States'},
	})

	const combined = Country.combine(byCode, byName)

	assert.ok(combined instanceof Country)
	assert.equal(combined['iso3166-1'], 'US')
	assert.equal(combined.name, 'United States')
	assert.equal(byCode.name, undefined)
	assert.equal(byName.name, 'United States')
	assert.equal(Country.combine(byCode, new Country({
		country: {iso_3166_1: 'CA', name: 'Canada'},
	})), false)
	assert.equal(Country.combine(), false)
})

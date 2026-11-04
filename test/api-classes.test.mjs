import assert from 'node:assert/strict'
import test from 'node:test'

import {Movie} from '../source/api/classes/movie.mjs'
import {
	convertToStarGrade,
	convertToVulgarFraction,
} from '../source/api/helpers/conversions.mjs'
import {Video} from '../source/api/classes/video.mjs'
import {Country} from '../source/api/classes/collections/country.mjs'
import {PopularOpinion} from '../source/api/classes/popular-opinion.mjs'
import {Language} from '../source/api/classes/language.mjs'
import {List} from '../source/api/classes/list.mjs'
import {Avatar, Poster} from '../source/api/classes/image.mjs'

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

test('keeps relative image paths when image configuration is unavailable', ( ) => {
	const poster = new Poster({poster: {file_path: '/poster.jpg'}})
	const avatar = new Avatar({avatar: {file_path: '/avatar.png'}})

	assert.equal(poster.basePath, '/poster.jpg')
	assert.deepEqual(poster.sizes, [])
	assert.equal(avatar.basePath, '/avatar.png')
	assert.deepEqual(avatar.sizes, [])
})

test('builds rating histograms from TMDB review results', ( ) => {
	const opinion = new PopularOpinion({
		reviews: {
			results: [
				{id: 'first', author_details: {rating: 10}},
				{id: 'second', author_details: {rating: 10}},
				{id: 'third', author_details: {rating: 1}},
			],
		},
	})
	const json = JSON.parse(JSON.stringify(opinion))

	assert.equal(json.histogram['5'].count, 2)
	assert.equal(json.histogram['5'].percent, 67)
	assert.equal(json.histogram['0'].count, 1)
	assert.equal(json.histogram['0'].percent, 33)
	assert.equal(json.histogramCount, 3)
	assert.equal(json.histogramMost, 2)
})

test('keeps distinct languages in a language list', ( ) => {
	const languages = new List(
		Language,
		{language: {iso_639_1: 'en', name: 'English'}},
		{language: {iso_639_1: 'fr', name: 'French'}},
	)

	assert.equal(languages.length, 2)
	assert.deepEqual(
		Array.from(languages, (language) => language['iso639-1']),
		['en', 'fr'],
	)
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

test('keeps combined data when duplicate items are added to a list', ( ) => {
	const countries = new List(
		Country,
		{country: {iso_3166_1: 'US'}},
		{country: {iso_3166_1: 'US', name: 'United States'}},
	)

	assert.equal(countries.length, 1)
	assert.equal(countries[0].name, 'United States')
})

test('promotes a list item without dropping unrelated entries', ( ) => {
	const countries = new List(
		Country,
		{country: {iso_3166_1: 'CA', name: 'Canada'}},
		{country: {iso_3166_1: 'US'}},
	)

	countries.setMain({country: {iso_3166_1: 'US', name: 'United States'}})

	assert.equal(countries.main.name, 'United States')
	assert.equal(countries.length, 1)
	assert.equal(countries[0].name, 'Canada')
})

test('keeps combined data when replacing a matching main item', ( ) => {
	const countries = new List(Country)
	countries.setMain({country: {iso_3166_1: 'US'}})
	countries.setMain({country: {iso_3166_1: 'US', name: 'United States'}})

	assert.equal(countries.main.name, 'United States')
	assert.equal(countries.length, 0)
})

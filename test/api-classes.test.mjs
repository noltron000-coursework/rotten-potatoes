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
import {Review} from '../source/api/classes/review.mjs'
import {Genre} from '../source/api/classes/collections/genre.mjs'

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

test('matches movies only when known identifiers agree', ( ) => {
	const withoutId01 = new Movie({movie: {title: 'First Movie'}})
	const withoutId02 = new Movie({movie: {title: 'Second Movie'}})
	const withId01 = new Movie({movie: {id: 42, title: 'First Movie'}})
	const withId02 = new Movie({movie: {id: 42, title: 'First Movie'}})
	const withDifferentId = new Movie({movie: {id: 43, title: 'First Movie'}})

	assert.equal(Movie.matches(withoutId01, withoutId02), false)
	assert.equal(Movie.matches(withId01, withId02), true)
	assert.equal(Movie.matches(withId01, withDifferentId), false)
})

test('combines matching genres and rejects conflicting genres', ( ) => {
	const first = new Genre({genre: {id: 18, name: 'Drama'}})
	const matching = new Genre({genre: {id: 18, name: 'Drama'}})
	const conflicting = new Genre({genre: {id: 35, name: 'Comedy'}})

	const combined = Genre.combine(first, matching)

	assert.ok(combined instanceof Genre)
	assert.equal(combined.ids.TMDb, 18)
	assert.equal(combined.name, 'Drama')
	assert.equal(Genre.combine(first, conflicting), false)
})

test('allows explicit movie matching by title and release year', ( ) => {
	const first = new Movie({
		movie: {title: ' Arrival ', release_date: '2016-09-01'},
	})
	const sameMovie = new Movie({
		movie: {title: 'arrival', release_date: '2016-12-01'},
	})
	const differentYear = new Movie({
		movie: {title: 'Arrival', release_date: '2017-01-01'},
	})
	const conflictingId = new Movie({
		movie: {id: 43, title: 'Arrival', release_date: '2016-09-01'},
	})
	const identifiedMovie = new Movie({
		movie: {id: 42, title: 'Arrival', release_date: '2016-09-01'},
	})

	assert.equal(Movie.matchesByMetadata(first, sameMovie), true)
	assert.equal(Movie.matchesByMetadata(first, differentYear), false)
	assert.equal(Movie.matchesByMetadata(identifiedMovie, conflictingId), false)
	assert.equal(Movie.matchesByMetadata(first, {}), false)
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

test('maps stored review fields from database records', ( ) => {
	const createdAt = new Date('2026-11-04T12:00:00Z')
	const revisedAt = new Date('2026-11-05T12:00:00Z')
	const review = new Review({
		review: {
			_id: 'review-id',
			api_movie_id: 'movie-id',
			title: 'A title',
			content: 'A review',
			rating: 4,
			author: {
				username: 'Reviewer',
				avatar_path: '/avatar.png',
			},
			created_at: createdAt,
			revised_at: revisedAt,
		},
	})

	assert.equal(review.source, 'db')
	assert.equal(review.ids.db, 'review-id')
	assert.equal(review.movie.ids.api, 'movie-id')
	assert.equal(review.title, 'A title')
	assert.equal(review.content, 'A review')
	assert.equal(review.rating, 4)
	assert.equal(review.author.username, 'Reviewer')
	assert.equal(review.author.avatar.basePath, '/avatar.png')
	assert.equal(review.creationDate.stamp.getTime(), createdAt.getTime())
	assert.equal(review.revisionDate.stamp.getTime(), revisedAt.getTime())
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

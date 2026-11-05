import assert from 'node:assert/strict'
import test from 'node:test'

import {Movie} from '../source/api/classes/movie.mjs'
import {Collection} from '../source/api/classes/collection.mjs'
import {Company} from '../source/api/classes/company.mjs'
import {
	convertToEasyDate,
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
import {Release} from '../source/api/classes/release.mjs'

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

test('converts dates using the day of the month', ( ) => {
	assert.equal(convertToEasyDate(new Date(2024, 0, 15)).day, 15)
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

test('matches API entities only when known identifiers agree', ( ) => {
	const collection = (id) => new Collection({collection: id === undefined ? {} : {id}})
	const company = (id) => new Company({company: id === undefined ? {} : {id}})
	const review = (id) => new Review({review: id === undefined ? {} : {id}})
	const video = (id) => new Video({video: id === undefined ? {} : {id}})

	for (const [ItemType, create] of [
		[Collection, collection],
		[Company, company],
		[Review, review],
		[Video, video],
	]) {
		assert.equal(ItemType.matches(create(), create()), false)
		assert.equal(ItemType.matches(create(42), create(42)), true)
		assert.equal(ItemType.matches(create(42), create(43)), false)
	}
})

test('combines collections by filling only undefined fields', ( ) => {
	const first = new Collection({
		collection: {id: 42, overview: null, poster_path: '/first.jpg'},
	})
	const second = new Collection({
		collection: {id: 42, name: 'Collection', overview: 'Description', poster_path: '/second.jpg'},
	})

	const combined = Collection.combine(first, second)

	assert.equal(combined.name, 'Collection')
	assert.equal(combined.overview, null)
	assert.equal(combined.posters.main.basePath, '/second.jpg')
	assert.equal(combined.posters.length, 1)
	assert.equal(first.name, undefined)
	assert.throws(
		() => Collection.combine(first, new Collection({collection: {id: 43}})),
		/Cannot combine non-matching Collection instances/,
	)
})

test('combines companies and fills missing nested image data', ( ) => {
	const first = new Company({
		company: {id: 42, homepage: null, logo_path: '/logo.jpg'},
	})
	const second = new Company({
		company: {id: 42, name: 'Company', homepage: 'https://example.test', logo_path: '/logo.jpg'},
	})
	first.logo.originalWidth = null
	second.logo.originalWidth = 100

	const combined = Company.combine(first, second)

	assert.equal(combined.name, 'Company')
	assert.equal(combined.homepage, null)
	assert.equal(combined.logo.originalWidth, null)
	assert.equal(first.name, undefined)
})

test('combines matching images without replacing defined null data', ( ) => {
	const first = new Poster({poster: {file_path: '/poster.jpg', width: 400}})
	const second = new Poster({poster: {file_path: '/poster.jpg', height: 600}})
	first.originalHeight = null

	const combined = Poster.combine(first, second)

	assert.ok(combined instanceof Poster)
	assert.equal(combined.originalWidth, 400)
	assert.equal(combined.originalHeight, null)
	assert.equal(first.originalHeight, null)
})

test('combines matching languages by filling undefined names', ( ) => {
	const first = new Language({language: {iso_639_1: 'en'}})
	const second = new Language({language: {iso_639_1: 'en', name: 'English'}})

	assert.equal(Language.combine(first, second).name, 'English')
	assert.equal(first.name, undefined)
	assert.throws(
		() => Language.combine(first, new Language({
			language: {iso_639_1: 'fr', name: 'French'},
		})),
		/Cannot combine non-matching Language instances/,
	)
})

test('combines matching movies and their nested lists', ( ) => {
	const first = new Movie({movie: {id: 42, overview: null, backdrop_path: '/first.jpg'}})
	const second = new Movie({movie: {id: 42, title: 'Movie', overview: 'Description', backdrop_path: '/second.jpg'}})

	const combined = Movie.combine(first, second)

	assert.equal(combined.title, 'Movie')
	assert.equal(combined.overview, null)
	assert.equal(combined.backdrops.main.basePath, '/second.jpg')
	assert.equal(combined.backdrops.length, 1)
	assert.equal(first.title, undefined)
})

test('combines matching releases by filling only undefined fields', ( ) => {
	const first = new Release({release: {release_date: '2024-01-15'}})
	const second = new Release({release: {release_date: '2024-01-15', note: 'Theatrical'}})
	const stamp = first.date.stamp
	second.date.stamp = stamp
	first.note = null

	const combined = Release.combine(first, second)

	assert.equal(combined.note, null)
	assert.equal(combined.date.stamp, stamp)
	assert.equal(first.note, null)
})

test('combines matching reviews and fills missing fields', ( ) => {
	const first = new Review({
		review: {id: 'review-id', content: null, movie_id: 42},
	})
	const second = new Review({
		review: {
			id: 'review-id',
			content: 'Review text',
			movie_id: 42,
			author_details: {username: 'Reviewer'},
		},
	})

	const combined = Review.combine(first, second)

	assert.equal(combined.content, null)
	assert.equal(combined.author.username, 'Reviewer')
	assert.equal(combined.movie.ids.api, 42)
	assert.equal(first.author.username, undefined)
})

test('combines matching videos by filling only undefined fields', ( ) => {
	const first = new Video({video: {id: 'video-id', site: null}})
	const second = new Video({
		video: {id: 'video-id', name: 'Trailer', site: 'YouTube'},
	})

	const combined = Video.combine(first, second)

	assert.equal(combined.name, 'Trailer')
	assert.equal(combined.site, null)
	assert.equal(first.name, undefined)
})

test('combine methods throw when their inputs do not match', ( ) => {
	const failures = [
		() => Collection.combine(
			new Collection({collection: {id: 1}}),
			new Collection({collection: {id: 2}}),
		),
		() => Company.combine(
			new Company({company: {id: 1}}),
			new Company({company: {id: 2}}),
		),
		() => Poster.combine(
			new Poster({poster: {file_path: '/first.jpg'}}),
			new Poster({poster: {file_path: '/second.jpg'}}),
		),
		() => Language.combine(
			new Language({language: {iso_639_1: 'en'}}),
			new Language({language: {iso_639_1: 'fr'}}),
		),
		() => Movie.combine(
			new Movie({movie: {id: 1}}),
			new Movie({movie: {id: 2}}),
		),
		() => Release.combine(
			new Release({release: {release_date: '2024-01-01'}}),
			new Release({release: {release_date: '2025-01-01'}}),
		),
		() => Review.combine(
			new Review({review: {id: 'first'}}),
			new Review({review: {id: 'second'}}),
		),
		() => Video.combine(
			new Video({video: {id: 'first'}}),
			new Video({video: {id: 'second'}}),
		),
		() => Country.combine(
			new Country({country: {iso_3166_1: 'US'}}),
			new Country({country: {iso_3166_1: 'CA'}}),
		),
		() => Genre.combine(
			new Genre({genre: {id: 1}}),
			new Genre({genre: {id: 2}}),
		),
	]

	for (const combine of failures) {
		assert.throws(combine, /Cannot combine non-matching/)
	}
})

test('combines matching genres and rejects conflicting genres', ( ) => {
	const first = new Genre({genre: {id: 18, name: 'Drama'}})
	const matching = new Genre({genre: {id: 18, name: 'Drama'}})
	const conflicting = new Genre({genre: {id: 35, name: 'Comedy'}})

	const combined = Genre.combine(first, matching)

	assert.ok(combined instanceof Genre)
	assert.equal(combined.ids.TMDb, 18)
	assert.equal(combined.name, 'Drama')
	assert.throws(
		() => Genre.combine(first, conflicting),
		/Cannot combine non-matching Genre instances/,
	)
	assert.throws(() => Genre.combine(), /Cannot combine non-matching Genre instances/)
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

test('maps database comments onto review wrappers', ( ) => {
	const review = new Review({
		review: {id: 'review-id', content: 'Review text', movie_id: 42},
		comments: [{
			_id: 'comment-id',
			api_review_id: 'review-id',
			content: 'Comment text',
		}],
	})

	assert.equal(review.comments.length, 1)
	assert.equal(review.comments[0]._id, 'comment-id')
	assert.equal(review.comments[0].api_review_id, 'review-id')
	assert.equal(review.comments[0].content, 'Comment text')
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

test('maps original language when movie has no backdrop', ( ) => {
	const movie = new Movie({
		movie: {original_language: 'en'},
	})

	assert.equal(movie.backdrops.main, null)
	assert.equal(movie.languages.main['iso639-1'], 'en')
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
	assert.throws(
		() => Country.combine(byCode, new Country({
			country: {iso_3166_1: 'CA', name: 'Canada'},
		})),
		/Cannot combine non-matching Country instances/,
	)
	assert.throws(() => Country.combine(), /Cannot combine non-matching Country instances/)
})

test('preserves intentional null country data when combining', ( ) => {
	const unknownCode = new Country({
		country: {iso_3166_1: 'xx', name: 'Example'},
	})
	const knownCode = new Country({
		country: {iso_3166_1: 'US', name: 'Example'},
	})

	assert.equal(Country.combine(unknownCode, knownCode)['iso3166-1'], null)
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

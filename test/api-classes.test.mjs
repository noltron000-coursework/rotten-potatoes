import assert from 'node:assert/strict'
import test from 'node:test'

import {Movie} from '../source/api/classes/movie.mjs'
import {
	convertToStarGrade,
	convertToVulgarFraction,
} from '../source/api/helpers/conversions.mjs'
import {Video} from '../source/api/classes/video.mjs'

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

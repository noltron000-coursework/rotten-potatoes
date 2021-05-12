const mongoose = require('mongoose')
const express = require('express')

const app = express()

const Review = mongoose.model('Review', {
	'title': String,
	'content': String,
	'rating': Number,
	'api_movie_id': {
		'type': String,
		'required': true,
	},
})

module.exports = Review

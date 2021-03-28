const mongoose = require('mongoose')
const express = require('express')

const app = express()

const Review = mongoose.model('Review', {
	'title': String,
	'description': String,
	'rating': Number,
	'movieId': {
		'type': String,
		'required': true,
	},
})

module.exports = Review

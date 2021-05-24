import mongoose from 'mongoose'
import express from 'express'

const app = express( )

const Review = mongoose.model('Review', {
	'api_movie_id': {
		'type': String,
		'required': true,
	},
	'title': String,
	'content': String,
	'rating': Number,
	'author': {
		'username': String,
		'avatar_path': String,
	},
	'created_at': Date,
	'revised_at': Date,
})

export {Review}

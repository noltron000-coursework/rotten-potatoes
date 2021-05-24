import mongoose from 'mongoose'
import express from 'express'

const app = express( )

const Model = mongoose.model('Comment', {
	'content': String,
	'api_review_id': {
		'type': mongoose.Schema.Types.ObjectId,
		'ref': 'Review',
		'required': false,
	},
	'db_review_id': {
		'type': String,
		'required': false,
	},
})

export default Model

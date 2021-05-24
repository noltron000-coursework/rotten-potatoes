import mongoose from 'mongoose'
import express from 'express'

const app = express()

const Comment = mongoose.model('Comment', {
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

export {Comment}

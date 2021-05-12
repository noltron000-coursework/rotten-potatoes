const mongoose = require('mongoose')
const express = require('express')

const app = express()

const Comment = mongoose.model('Comment', {
	'content': String,
	'apiReviewId': {
		'type': mongoose.Schema.Types.ObjectId,
		'ref': 'Review',
		'required': true,
	},
})

module.exports = Comment

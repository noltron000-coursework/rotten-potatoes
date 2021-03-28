const mongoose = require('mongoose')
const express = require('express')

const app = express()

const Comment = mongoose.model('Comment', {
	'content': String,
	'reviewId': {
		'type': mongoose.Schema.Types.ObjectId,
		'ref': 'Review',
	}
})

module.exports = Comment

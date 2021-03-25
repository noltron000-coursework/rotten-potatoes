const mongoose = require('mongoose');
const express = require('express');

const app = express(); // include express.js stuff... adding dots after app (eg app.???)!

const Schema = mongoose.Schema;

const Comment = mongoose.model('Comment', {
	title: String,
	content: String,
	reviewId: { type: Schema.Types.ObjectId, ref: 'Review' }
});

module.exports = Comment;

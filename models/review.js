const mongoose = require('mongoose');
const express = require('express');

const app = express(); // include express.js stuff... adding dots after app (eg app.???)!

const Review = mongoose.model('Review', {
	title: String,
	movieTitle: String,
	movieRating: String,
	description: String,
	movieId: { type: String, required: true }
}); // mongoose is defining the data-fields

module.exports = Review;
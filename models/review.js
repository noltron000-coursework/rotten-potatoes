const mongoose = require('mongoose');

const Review = mongoose.model('Review', {
	title: String,
	movieTitle: String,
	movieRating: String,
	description: String,
}); // mongoose is defining the data-fields

module.exports = Review;

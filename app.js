// app.js


//
const mongoose = require('mongoose');
const Review = mongoose.model('Review', {title: String});
const express = require('express');
const app = express();
let exphbs = require('express-handlebars');

mongoose.connect('mongodb://localhost/rotten-potatoes', { useNewUrlParser: true });
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// INDEX
app.get('/', (req, res) => {
	Review.find()
		.then(reviews => {
			res.render('reviews-index', { reviews: reviews });
		})
		.catch(err => {
			console.log(err);
		})
})

// LISTEN
app.listen(3000, () => {
	console.log('App listening on port 3000!')
});

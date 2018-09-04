const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Review = mongoose.model('Review', {
	title: String
});

let exphbs = require('express-handlebars');

// let reviews = [
// 	{ title: "Great Review" },
// 	{ title: "Next Review" },
// 	{ title: "Next Review" }
// ];

mongoose.connect('mongodb://localhost/rotten-potatoes', { useNewUrlParser: true });

app.engine('handlebars', exphbs({defaultLayout: 'main'}));

app.set('view engine', 'handlebars');

app.listen(3000, () => {
	console.log('App listening on port 3000!')
});

app.get('/', (req, res) => {
	Review.find()
		.then(reviews => {
			res.render('reviews-index', { reviews: reviews })
		})
		.catch(err => {
			console.log(err)
		})
});

app.get('/reviews', (req, res) => {
	res.render('reviews-index', { reviews: reviews })
});

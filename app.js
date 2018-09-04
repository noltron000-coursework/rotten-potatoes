const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();

const Review = mongoose.model('Review', {
	title: String,
	description: String,
	movieTitle: String,
	movieRating: String
});

let exphbs = require('express-handlebars');

// let reviews = [
// 	{ title: "Great Review" },
// 	{ title: "Next Review" },
// 	{ title: "Next Review" }
// ];

mongoose.connect('mongodb://localhost/rotten-potatoes', { useNewUrlParser: true });

app.use(bodyParser.urlencoded({ extended: true }));

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

app.get('/reviews/new', (req, res) => {
	res.render('reviews-new', {});
});


app.post('/reviews', (req, res) => {
	Review.create(req.body).then((review) => {
		console.log(review);
		res.redirect('/');
	}).catch((err) => {
		console.log(err.message);
	})
});

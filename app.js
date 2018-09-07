// INITIAL DECLARATIONS
const mongoose = require('mongoose'); // initialize mongoose db stuff
const express = require('express'); // initialize express.js
const bodyParser = require('body-parser'); // initialize body-parser
const Review = mongoose.model('Review', {
	title: String,
	description: String,
	movieTitle: String
}); // mongoose is defining the data-fields

const app = express(); // include express.js stuff... adding dots after!
let exphbs = require('express-handlebars');

// MAGIC HAPPENS HERE
mongoose.connect('mongodb://localhost/rotten-potatoes', { useNewUrlParser: true });
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

	/*	Now we get		/
 /	to the meat of /
/		the project. */


// READY TO USE BODY-PARSER
app.use(bodyParser.urlencoded({ extended: true }));


// INDEX => SHOW ALL REVIEW
app.get('/', (req, res) => {
	Review.find()
	.then(reviews => {
		res.render('reviews-index', { reviews: reviews });
	})
	.catch(err => {
		console.log(err);
	})
})

// NEW => SHOW REVIEW CREATION FORM
app.get('/reviews/new', (req, res) => {
	res.render('reviews-new', {});
})


// SHOW SINGLE REVIEW
app.get('/reviews/:id', (req, res) => {
	Review.findById(req.params.id).then((review) => {
		res.render('reviews-show', { review: review })
	}).catch((err) => {
		console.log(err.message);
	})
})
// CREATE NEW REVIEW
app.post('/reviews', (req, res) => {
	Review.create(req.body).then((review) => {
		console.log(review)
		res.redirect(`/reviews/${review._id}`) // Redirect to reviews/:id
	}).catch((err) => {
		console.log(err.message)
	})
})

// LISTEN
app.listen(3000, () => {
	console.log('App listening on port 3000!')
});

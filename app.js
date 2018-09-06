// app.js
var exphbs = require('express-handlebars');
const express = require('express');
const app = express();

// let reviews = [
// 	{ title: "Great Review" },
// 	{ title: "Next Review" }
// ]

app.engine('handlebars', exphbs({defaultLayout: 'main'}));

app.set('view engine', 'handlebars');

// INDEX
app.get('/', (req, res) => {
	res.render('reviews-index', { reviews: reviews })
});

// LISTEN
app.listen(3000, () => {
	console.log('App listening on port 3000!')
});

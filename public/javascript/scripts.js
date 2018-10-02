// Make a request to the color api
// axios.get('http://www.thecolorapi.com/id?hex=24B1E0')
// 	.then(function (response) {
// 		// handle success
// 		alert(response.hex.value);
// 	})
// 	.catch(function (error) {
// 		// handle error
// 		console.log(error);
// 	});

// listen for a form submit 

document.getElementById("new-comment")
.addEventListener("submit", e => {
	// prevent the default form behavior
	e.preventDefault();

	// serialize the form data into an object
	// let comment = {};
	// const inputs = document.getElementsByClassName('form-control');
	// for (var i = 0; i < inputs.length; i++) {
	// 	comment[inputs[i].name] = inputs[i].value;
	// }

	let form = document.getElementById("new-comment");
	console.log(form);

	let comment = $(form).serialize();

	axios.post('/reviews/comments', comment)
	.then(function (response) {
	// wait for the success response from the server
		let newComment = response.data.comment;

		console.log("RESPONSE:")
		console.log(response);
		// remove the information from the form
		form.reset();
		// display the data as a new comment on the page
		document.getElementById('comments').innerHTML +=
		`
			<div class="card" id="${newComment._id}">
				<div class="card-block">
					<h4 class="card-title">${newComment.title}</h4>
					<p class="card-text">${newComment.content}</p>
					<p>
						<form method="POST" action="/reviews/comments/${response._id}?_method=DELETE">
							<button class="btn btn-link" type="submit">Delete</button>
						</form>
					</p>
				</div>
			</div>
		`
	});
});

// Potentially ask fang about this

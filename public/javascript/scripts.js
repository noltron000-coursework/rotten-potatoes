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

		// create variables for later use
	let form = document.getElementById("new-comment");
	console.log(form);
	let comment = $(form).serialize();
	console.log(comment);

		// use axios to initialize a post request and send
	axios.post('/reviews/comments', comment)
	.then(function (response) {

			// wait for the success response from the server
		console.log("RESPONSE:");
		console.log(response);

			// remove the information from the form
		form.reset();

			//create newComment to simplify inner data
		let newComment = response.data.comment;

			// display the data as a new comment on the page
		document.getElementById('comments').innerHTML +=
		`
			<div class="card" id="${newComment._id}">
				<div class="card-block">
					<h4 class="card-title">COMMENT: ${newComment.title}</h4>
					<p class="card-text">CONTENT: ${newComment.content}</p>
					<!-- Delete link -->
					<p>
						<button class="btn btn-link" id="delete-comment" data-comment-id=${response._id}>Delete</button>
					</p>
				</div>
			</div>
		`;
	});
});

document.getElementById("delete-comment")
.addEventListener("click", (e) => {
		// initialize variables
	console.log("click!");
	let comment = document.getElementById('delete-comment')
	console.log(comment)
	let commentId = comment.getAttribute("data-comment-id");
	console.log(commentId)

		// call axios.delete()
	axios.delete(`/reviews/comments/${commentId}`)
	.then(response => {
		console.log(response);

			// Remove children
		comment = document.getElementById(commentId);
		console.log(comment)
		comment.parentNode.removeChild(comment); // OR comment.style.display = 'none';
	})
	.catch(error => {
		console.log(error);
		alert('There was an error deleting this comment.');
	});
});
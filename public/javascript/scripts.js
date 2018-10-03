function deleteComment() {
	document.querySelectorAll('#delete-comment')
	.forEach(el => el.addEventListener("click", (e) => {
		// be verbose
		console.log("");
		console.log("");
		console.log("");
		console.log("===FUNCTION IS CALLED===");
		console.log("===DELETING A COMMENT===");

		// initialize variables
		let comment = document.getElementById('delete-comment');
		console.log("INCOMING COMMENT");
		console.log(comment);

		// let commentId = comment.getAttribute("data-comment-id");
		let commentId = e.target.getAttribute("data-comment-id");
		console.log("IDENTIFICATION #");
		console.log(commentId);

		// call axios.delete()
		axios.delete(`/reviews/comments/${commentId}`)
		.then(response => {
			console.log("'RESPONSE' OF DELETE FUNCTION:");
			console.log(response);

			// Remove & Delete Children \\
			elementToErase = e.target.parentNode.parentNode;
			elementToErase.parentNode.removeChild(elementToErase);

			// Another way to Remove children \\
			// comment = document.getElementById(commentId);
			// console.log(comment)
			// comment.parentNode.removeChild(comment);
		}).catch(error => {
			console.log("!!! ERROR FOUND !!!");
			console.log(error);
			alert('There was an error deleting this comment.');
		});
	}));
}


	// document.getElementById("delete-comment")
	// .addEventListener("click", (e) => {
	// 		// initialize variables
	// 	console.log("click!");
	// 	let comment = document.getElementById('delete-comment')
	// 	console.log(comment)
	// 	let commentId = comment.getAttribute("data-comment-id");
	// 	console.log(commentId)

	// 		// call axios.delete()
	// 	axios.delete(`/reviews/comments/${commentId}`)
	// 	.then(response => {
	// 		console.log(response);

	// 			// Remove children
	// 		comment = document.getElementById(commentId);
	// 		console.log(comment)
	// 		comment.parentNode.removeChild(comment); // OR comment.style.display = 'none';
	// 	})
	// 	.catch(error => {
	// 		console.log(error);
	// 		alert('There was an error deleting this comment.');
	// 	});
	// });



window.onload = function() {
	document.getElementById("new-comment")
	.addEventListener("submit", e => {
			// be verbose
		console.log("");
		console.log("");
		console.log("");
		console.log("===FUNCTION IS CALLED===");
		console.log("===CREATING A COMMENT===");

			// Prevent the default form behavior
		e.preventDefault();

			// Create variables for later use
		let form = document.getElementById("new-comment");
		console.log("ORIGINAL FORM DATA");
		console.log(form);


			// Serialize the Form Data into an Object
		let comment = $(form).serialize();
		console.log("NEW SERIALZED DATA");
		console.log(comment);

			// Complicated way to serialize, but conceptually sound
		// serialize the form data into an object
		// let comment = {};
		// const inputs = document.getElementsByClassName('form-control');
		// for (var i = 0; i < inputs.length; i++) {
		// 	comment[inputs[i].name] = inputs[i].value;
		// }

			// use axios to initialize a post request and send
		axios.post('/reviews/comments', comment)
		.then(function (response) {

				// wait for the success response from the server
			console.log("DATA-JECT RESPONSE");
			console.log(response);

				// remove the information from the form
			form.reset();

				// create newComment to simplify inner data
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
							<button class="btn btn-link" id="delete-comment" data-comment-id=${newComment._id}>Delete</button>
						</p>
					</div>
				</div>
			`;
			deleteComment();
		}).catch(function(error) {
			console.log("!!! ERROR FOUND !!!");
			console.log(error);
		});
	});
	deleteComment();
}
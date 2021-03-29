const setupCreateComment = ( ) => {
	const form = document.querySelector('form.new-comment')
	form.addEventListener('submit', createComment)
}

const setupDeleteComment = ( ) => {
	const buttons = document.querySelectorAll('input.delete-comment-button')
	buttons.forEach((button) => {
		button.addEventListener('click', deleteComment)
	})
}
const createComment = async (event) => {
	try {
		// Prevent the default form behavior
		event.preventDefault()

		// Create variables for later use
		const form = document.querySelector('form.new-comment')


		// Serialize the Form Data into an Object
		const commentData = $(form).serialize()

		// Complicated way to serialize, but conceptually sound
		// serialize the form data into an object
		// let comment = {};
		// const inputs = document.getElementsByClassName('form-control');
		// for (var i = 0; i < inputs.length; i++) {
		// 	comment[inputs[i].name] = inputs[i].value;
		// }

		// Use axios to initialize a post request and send
		const promise = axios.post(`/comments`, commentData)
		const response = await promise

		// Remove the information from the form
		form.reset()

		// Create newComment to simplify inner data
		let newComment = response.data.comment

		// Display the data as a new comment on the page
		document.getElementById('comments').innerHTML +=
		`<div class='card-block form-group'>

			<!-- Content Block -->
			<p class='card-text'>
				${newComment.content}
			</p>

			<!-- Delete Link -->
			<input
				type='button'
				value='Delete'
				class='btn delete-comment-button'
				data-comment-id='${newComment._id}'
			/>

		</div>`
	}

	catch (error) {
		console.log("!!! ERROR FOUND !!!")
		console.log(error)
	}

	finally {
		// always setup the delete comment functionality.
		setupDeleteComment( )
	}
}

const deleteComment = (e) => {

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
	axios.delete(`/comments/${commentId}`)
	.then(response => {
		console.log("'RESPONSE' OF DELETE FUNCTION:");
		console.log(response);

			// Remove & Delete Children \\
		elementToErase = e.target.parentNode;
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
};


window.onload = function() {
	setupCreateComment( )
	setupDeleteComment( )
}

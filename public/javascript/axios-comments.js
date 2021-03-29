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
		// Prevent the default form behavior.
		event.preventDefault()

		// Determine form element.
		const form = document.querySelector('form.new-comment')

		// Serialize the Form Data into an Object.
		//
		// == TODO ==
		// Consider implementing this without using jQuery.
		const commentData = $(form).serialize()

		// Use axios to initialize a post request, and send.
		let response = axios.post(`/comments`, commentData)
		response = await response

		// Remove the information from the form.
		form.reset()

		// Deetermine the comment to simplify inner data.
		const comment = response.data.comment

		// Display the data as a new comment on the page
		document.getElementById('comments').innerHTML +=
		`<div class='card-block form-group'>

			<!-- Content Block -->
			<p class='card-text'>
				${comment.content}
			</p>

			<!-- Delete Link -->
			<input
				type='button'
				value='Delete'
				class='btn delete-comment-button'
				data-comment-id='${comment._id}'
			/>

		</div>`
	}

	catch (error) {
		console.log(error)
	}

	finally {
		// always setup the delete comment functionality.
		setupDeleteComment( )
	}
}

const deleteComment = async (event) => {
	try {
		// Get the Comment ID from the data attribute.
		let commentId = event.target.getAttribute("data-comment-id")

		// Use axios to initialize a deletion request.
		let response = axios.delete(`/comments/${commentId}`)
		response = await response

		// Remove & Delete Children
		const elementToErase = event.target.parentNode
		elementToErase.parentNode.removeChild(elementToErase)
	}

	catch (err) {
		console.error(error)
	}
}


window.onload = function() {
	setupCreateComment( )
	setupDeleteComment( )
}

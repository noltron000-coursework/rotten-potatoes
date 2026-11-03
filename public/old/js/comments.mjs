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

		// Serialize the Form Data to create the fetch payload.
		const	userInputs = [...document.querySelectorAll('.form-control')]

		let payload = ''
		userInputs.forEach((input) => {
			if (payload !== '') {
				payload += '&'
			}
			payload += input.name
			payload += '='
			payload += input.value
		})

		// Use fetch to initialize a post request, and send it.
		const options = {
			'method': 'POST',
			'headers': {
				// Expect a URL-Encoded payload content.
      	'Content-Type': 'application/x-www-form-urlencoded',
			},
			'body': payload
		}
		let response = fetch('/comments', options)
		response = await response

		// Remove the information from the form.
		form.reset()

		// Determine the resulting comment data
		// 	by awaiting a json stream.
		const {commentId} = await response.json()

		const markup = await fetchCommentItemHTML(commentId)
		// Display the data as a new comment on the page
		document.getElementById('comments').innerHTML += markup
		/*
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
		 */
	}

	catch (err) {
		console.error(err)
	}

	finally {
		// always setup the delete comment functionality.
		setupDeleteComment( )
	}
}



const fetchCommentItemHTML = async (commentId) => {
	// Use fetch to initialize a post request, and send it.
	const options = {
		'method': 'GET',
		'headers': {
			// Expect to send a URL-Encoded payload content.
			'Content-Type': 'application/x-www-form-urlencoded',
		}
	}
	const response = await fetch(`/comments/${commentId}/flash`, options)
	const blob = await response.blob( )
	const markup = await blob.text( )

	return markup
}


const deleteComment = async (event) => {
	try {
		// Get the Comment ID from the data attribute.
		let commentId = event.target.getAttribute('data-comment-id')

		// Use fetch to initialize a deletion request.
		const options = {method: 'DELETE'}
		let response =fetch(`/comments/${commentId}`, options)
		response = await response

		// Remove & Delete Children
		const elementToErase = event.target.parentNode
		elementToErase.parentNode.removeChild(elementToErase)
	}

	catch (err) {
		console.error(err)
	}
}


window.onload = ( ) => {
	setupCreateComment( )
	setupDeleteComment( )
}

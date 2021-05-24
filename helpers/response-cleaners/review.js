import {
	convertToCertification,
	convertToEasyDate,
	convertToEasyDuration,
	convertToStarGrade,
	convertToVulgarFraction,
} from '../data-parser.js'



const cleanOpinions = (reviews = null) => {
	if (reviews === null) {
		return {
			'ratings': {
				'count': 0,
				'total': 0,
				'average': null,
				'vulgar_average': null,
				'histogram_count': 0,
				'histogram': {
					'0': 0,
					'1': 0,
					'2': 0,
					'3': 0,
					'4': 0,
					'5': 0,
				},
			},
			'reviews': {
				'count': 0,
				'entries': [],
			},
		}
	}

	// initialize an empty opinions object.
	const opinions = cleanOpinions(null)

	const fromDb = ( ) => {
		// clean all of the reviews.
		const dbReviews = reviews.map(review => cleanReview(review).fromDb( ))

		// add ratings to cleaned opinions object.
		// gather and consider only reviews with a rating.
		dbReviews
		.filter(review => Number.isFinite(review.rating))
		.forEach(review => {
			opinions.ratings.count += 1
			opinions.ratings.histogram_count += 1
			opinions.ratings.histogram[review.rating] += 1
			opinions.ratings.total += review.rating
		})

		// calculated rating attributes
		opinions.ratings.average = opinions.ratings.total / opinions.ratings.count
		opinions.ratings.vulgar_average = convertToVulgarFraction(opinions.ratings.average)

		// add dbReviews to cleaned opinions object.
		// gather and consider only dbReviews with content.
		dbReviews
		.filter(review => review.title || review.content)
		.forEach(review => {
			opinions.reviews.count += 1
			opinions.reviews.entries.push(review)
		})

		return opinions
	}

	const fromApi = (apiMovie) => {
		// clean all of the reviews into apiReviews.
		const apiReviews = reviews.map(review => cleanReview(review).fromApi(apiMovie))

		// add ratings to cleaned opinions object.
		// gather and consider only reviews with a rating.
		apiReviews
		.filter(review => Number.isFinite(review.rating))
		.forEach(review => {
			opinions.ratings.histogram_count += 1
			opinions.ratings.histogram[review.rating] += 1
		})

		// add ratings based on the movie api response.
		opinions.ratings.count += apiMovie.vote_count
		opinions.ratings.total += apiMovie.vote_count * convertToStarGrade(apiMovie.vote_average)

		// calculated rating attributes
		opinions.ratings.average = opinions.ratings.total / opinions.ratings.count
		opinions.ratings.vulgar_average = convertToVulgarFraction(opinions.ratings.average)

		// add apiReviews to cleaned opinions object.
		// gather and consider only apiReviews with content.
		apiReviews
		.filter(review => review.title || review.content)
		.forEach(review => {
			opinions.reviews.count += 1
			opinions.reviews.entries.push(review)
		})

		return opinions
	}

	return {
		fromDb,
		fromApi,
	}
}


const mergeOpinions = (opinions, moreOpinions) => {
	// merge ratings together
	opinions.ratings.count += moreOpinions.ratings.count
	opinions.ratings.total += moreOpinions.ratings.total
	opinions.ratings.histogram_count += moreOpinions.ratings.histogram_count

	// merge ratings histogram
	Object.keys(opinions.ratings.histogram)
	.forEach(rating => {
		opinions.ratings.histogram[rating] += moreOpinions.ratings.histogram[rating]
	})

	// calculated rating attributes
	opinions.ratings.average = opinions.ratings.total / opinions.ratings.count
	opinions.ratings.vulgar_average = convertToVulgarFraction(opinions.ratings.average)

	// merge reviews together
	opinions.reviews.count += moreOpinions.reviews.count
	opinions.reviews.entries.push(...moreOpinions.reviews.entries)

	return opinions
}


const cleanReview = (review = null) => {
	if (review === null) {
		return {
			'db_id': null,
			'api_id': null,
			'api_movie_id': null,
			'source': null,
			'title': null,
			'content': null,
			'rating': null,
			'author': {
				'name': null,
				'username': null,
				'avatar_path': null,
			},
			'comments': { },
			'creation_date': {
				'day': null,
				'month': null,
				'year': null,
				'stamp': null,
			},
			'revision_date': {
				'day': null,
				'month': null,
				'year': null,
				'stamp': null,
			},
		}
	}

	const fromDb = ( ) => {
		const dbReview = review
		review = cleanReview(null)

		// source
		review.source = 'db'

		// add the IDs
		review.db_id = dbReview._id
		review.api_movie_id = dbReview.api_movie_id

		// rating information
		review.rating = dbReview.rating ?? null

		// review information
		review.title = dbReview.title || null
		review.content = dbReview.content || null

		// determine date-time objects
		const creationObject = new Date(Date.parse(dbReview.created_at))
		review.creation_date = convertToEasyDate(creationObject)
		// creation time always exists, but not revision.
		if (dbReview.revised_at !== null && dbReview.revised_at !== undefined) {
			const revisionObject = new Date(Date.parse(dbReview.revised_at))
			review.revision_date = convertToEasyDate(revisionObject)
		}
		else {
			review.revision_date = convertToEasyDate(null)
		}

		// author information
		review.author.name = review.author.username = dbReview.author.username || null
		review.author.avatar_path = dbReview.author.avatar_path || null

		return review
	}

	const fromApi = (apiMovie = null) => {
		const apiReview = review
		review = cleanReview(null)

		// source
		review.source  = 'api'

		// add the IDs
		review.api_id = apiReview.id
		if (apiMovie !== null) {
			review.api_movie_id = apiMovie.id
		}
		else if (apiReview.media_id) {
			review.api_movie_id = apiReview.media_id
		}
		else {
			throw new Error('no movie api key found for the review.\na review must be for & have a movie!')
		}

		// rating information
		if (Number.isFinite(apiReview.author_details.rating)) {
			review.rating = Math.round(convertToStarGrade(apiReview.author_details.rating))
		}

		// review information
		review.title = apiReview.title
		review.content = apiReview.content

		// determine date-time objects
		const creationObject = new Date(Date.parse(apiReview.created_at))
		const revisionObject = new Date(Date.parse(apiReview.updated_at))
		review.creation_date = convertToEasyDate(creationObject)
		review.revision_date = convertToEasyDate(revisionObject)

		// author information
		review.author.name = apiReview.author_details.name
		review.author.username = apiReview.author_details.username
		review.author.avatar_path = apiReview.author_details.avatar_path

		return review
	}

	return {fromDb, fromApi}
}


export {
	cleanReview,
	cleanOpinions,
	mergeOpinions,
}

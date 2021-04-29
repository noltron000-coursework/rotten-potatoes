const {
	convertToCertification,
	convertToEasyDate,
	convertToEasyDuration,
	convertToStarGrade,
	convertToVulgarFraction,
	emptyDate,
	emptyDuration,
} = require('../data-parser.js')


const emptyOpinions = ( ) => ({
	// initialize opinions object and immediately return.
	'ratings': {
		'count': 0,
		'total': 0,
		'average': 0,
		'vulgar_average': '0',
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
})


const cleanOpinions = (reviews = [ ]) => {
	// initialize an empty opinions object.
	const opinions = emptyOpinions( )

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
		.filter(review => review.content)
		.forEach(review => {
			opinions.reviews.count += 1
			opinions.reviews.entries.push(review)
		})

		return opinions
	}

	const fromApi = (movie) => {
		// clean all of the reviews.
		const apiReviews = reviews.map(review => cleanReview(review).fromApi( ))

		// add ratings to cleaned opinions object.
		// gather and consider only reviews with a rating.
		apiReviews
		.filter(review => Number.isFinite(review.rating))
		.forEach(review => {
			opinions.ratings.histogram_count += 1
			opinions.ratings.histogram[review.rating] += 1
		})

		// add ratings based on the movie api response.
		opinions.ratings.count += movie.vote_count
		opinions.ratings.total += movie.vote_count * convertToStarGrade(movie.vote_average)

		// calculated rating attributes
		opinions.ratings.average = opinions.ratings.total / opinions.ratings.count
		opinions.ratings.vulgar_average = convertToVulgarFraction(opinions.ratings.average)

		// add apiReviews to cleaned opinions object.
		// gather and consider only apiReviews with content.
		apiReviews
		.filter(review => review.content)
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


const emptyReview = ( ) => ({
	// initialize opinions object and immediately return.
	'source': null,
	'title': null,
	'content': null,
	'rating': null,
	'author': { },
	'comments': { },
	'creation_date': { },
	'revision_date': { },
})


const cleanReview = (review) => {
	const fromDb = ( ) => {
		review.source = 'db'
		return review
	}

	const fromApi = ( ) => {
		var apiReview = review
		review = emptyReview( )

		// rating information
		if (Number.isFinite(apiReview.author_details.rating)) {
			review.rating = Math.round(convertToStarGrade(apiReview.author_details.rating))
		}

		// review information
		review.source  = 'api'
		review.title = apiReview.title
		review.content = apiReview.content

		// determine date-time objects
		const creationObject = new Date(Date.parse(apiReview.created_at))
		const revisionObject = new Date(Date.parse(apiReview.updated_at))
		review.creation_date = convertToEasyDate(creationObject)
		review.revision_date = convertToEasyDate(revisionObject)

		// author information
		review.author = apiReview.author_details
		review.author.extra = apiReview.author

		return review
	}

	return {fromDb, fromApi}
}


module.exports = {
	emptyReview,
	cleanReview,
	emptyOpinions,
	cleanOpinions,
	mergeOpinions,
}

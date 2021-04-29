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

// does not mutate input.
const cleanReview = (review) => {
	const fromDb = ( ) => {
		review.source = 'db'
		return review
	}

	const fromApi = ( ) => {
		review.source  = 'api'
		if (Number.isFinite(review.author_details.rating)) {

		}
	}
	// add reviews
	apiReviews.results.forEach(review => {
		review.source = 'api'
		if (Number.isFinite(review.author_details.rating)) {
			review.author_details.rating = Math.round(convertToStarGrade(review.author_details.rating))
			apiOpinions.ratings.histogram[review.author_details.rating] += 1
			apiOpinions.ratings.histogram_count += 1
		}
		apiOpinions.reviews.count += 1
		apiOpinions.reviews.entries.push(review)
	})

	// add ratings
	apiOpinions.ratings.count += movie.vote_count
	apiOpinions.ratings.total += movie.vote_count * convertToStarGrade(movie.vote_average)

	// calculated rating attributes
	apiOpinions.ratings.average = apiOpinions.ratings.total / apiOpinions.ratings.count
	apiOpinions.ratings.vulgar_average = convertToVulgarFraction(apiOpinions.ratings.average)

	return apiOpinions
}

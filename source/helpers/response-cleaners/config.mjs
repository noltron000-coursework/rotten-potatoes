const cleanConfig = (apiConfig) => {
	Object.entries(apiConfig.images)
	.forEach(([key, value]) => {
		if (Array.isArray(value)) {
			value = value.map((subVal) => {
				const newVal = {
					type: null,
					value: null,
				}
				if (subVal === 'original') {
					newVal.type = 'tag'
					newVal.value = subVal
				}
				else if (subVal[0] === 'w') {
					newVal.type = 'w'
					newVal.value = parseInt(subVal.slice(1))
				}
				else if (subVal[0] === 'h') {
					newVal.type = 'h'
					newVal.value = parseInt(subVal.slice(1))
				}
				return newVal
			}).reverse()
			apiConfig.images[key] = value
		}
	})
	return apiConfig
}

export {
	cleanConfig,
}

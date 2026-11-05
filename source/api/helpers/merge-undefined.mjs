const isPlainObject = (value) => {
	if (value === null || typeof value !== 'object') {
		return false
	}

	const prototype = Object.getPrototypeOf(value)
	return prototype === Object.prototype || prototype === null
}

const mergeUndefined = (target, ...sources) => {
	for (const source of sources) {
		if (source == null) {
			continue
		}

		for (const [key, value] of Object.entries(source)) {
			if (target[key] === undefined) {
				target[key] = isPlainObject(value)
					? mergeUndefined({}, value)
					: value
			}
			else if (isPlainObject(target[key]) && isPlainObject(value)) {
				mergeUndefined(target[key], value)
			}
		}
	}

	return target
}

export {mergeUndefined}

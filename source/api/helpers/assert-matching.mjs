const assertMatching = (ItemType, ...instances) => {
	if (!ItemType.matches(...instances)) {
		throw new Error(
			`Cannot combine non-matching ${ItemType.name} instances.`,
		)
	}
}

export {assertMatching}

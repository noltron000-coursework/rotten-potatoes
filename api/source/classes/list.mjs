class List extends Array {
	constructor (ItemType, ...values) {
		super( )
		this.ItemType = ItemType
		this.main = null
		this.add(...values)
	}

	add (...values) {
		values = values.map((value) => (
			new this.ItemType(value)
		))

		values.forEach((value) => {
			// Check if value is in the main position already.
			if (this.ItemType.matches(this.main, value)) {
				this.ItemType.combine(this.main, value)
			}

			else {
				// Check if value is in current array.
				const oldValue = [...this].find((oldValue) => (
					this.ItemType.matches(oldValue, value)
				))

				// If value is in array, join with original and leave it.
				if (oldValue !== undefined) {
					this.ItemType.combine(oldValue, value)
				}

				// Just add it otherwise.
				else {
					this.push(value)
				}
			}
		})
	}

	setMain (value) {
		value = new this.ItemType(value)

		// Check if position is empty.
		if (this.main == undefined) {
			this.main = value
		}

		// Check if value is in the main position already.
		else if (this.ItemType.matches(this.main, value)) {
			this.ItemType.combine(this.main, value)
		}

		// Otherwise, something else is already in the main position.
		else {
			this.unshift(this.main)  // add the old item to the array.
			this.main = value  // add this item to the main position.
		}

		// Check if value is also in current array.
		const oldIndex = [...this].findIndex((oldValue) => (
			this.ItemType.matches(oldValue, value)
		))

		// If value is in array, join with original and set to main.
		if (oldIndex !== -1) {
			const oldValue = [...this][oldIndex]
			this.splice(0, oldIndex)  // remove this item from the array.
			this.ItemType.combine(oldValue, value)
			this.main = oldValue  // add this item to the main position.
		}
	}

	get values ( ) {
		return [...this]
	}

	toJSON ( ) {
		const json = [ ]
		if (this.main != undefined) {json.push(this.main)}
		json.push(...this.values)
		return json
	}
}

export {List}

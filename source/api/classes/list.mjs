class List extends Array {
	constructor (ItemType, ...values) {
		super( )
		this.ItemType = ItemType
		this.main = null
		this.add(...values)
	}

	static combine (ItemType, ...lists) {
		const combined = new List(ItemType)

		const wrap = (item) => {
			const key = item.type
				?? `${item.constructor.name[0].toLowerCase()}${item.constructor.name.slice(1)}`
			return {[key]: item}
		}

		for (const list of lists) {
			combined.add(...list.values.map(wrap))
		}
		for (const list of lists) {
			if (list.main != null) {
				combined.setMain(wrap(list.main))
			}
		}

		return combined
	}

	add (...values) {
		values = values.map((value) => (
			new this.ItemType(value)
		))

		values.forEach((value) => {
			// Check if value is in the main position already.
			if (this.ItemType.matches(this.main, value)) {
				this.main = this.ItemType.combine(this.main, value)
			}

			else {
				// Check if value is in current array.
				const oldIndex = this.findIndex((oldValue) => (
					this.ItemType.matches(oldValue, value)
				))

				// If value is in array, join with original and leave it.
				if (oldIndex !== -1) {
					this[oldIndex] = this.ItemType.combine(this[oldIndex], value)
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
			this.main = this.ItemType.combine(this.main, value)
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
			this.main = this.ItemType.combine(this[oldIndex], this.main)
			this.splice(oldIndex, 1)
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

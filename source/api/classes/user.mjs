import {Avatar} from './image.mjs'
import {Config} from './config.mjs'

class User {
	#config
	constructor (data = { }) {
		let self = this  // allow forgetting of "this"
		data = {...data}  // dont mutate input data
		// If the data already has an instance of this class,
		// 	then there is no point in creating a new instance.
		// We can replace "self" instance, thus forgetting it.
		if (data.user instanceof User) {
			self = data.user
			delete data.user
		}

		self.assignDefaults( )
		self.assignData(data)

		// override the returning of "this".
		return self
	}

	/* STEP 1: INITIALIZE CLASS STRUCTURE */
	assignDefaults ( ) {
		this.ids ??= { }
	}

	/* STEP 2: CLEAN INPUT DATA */
	assignData ({
		config,
		user,
	}) {

		//+ FIRST, PREPARE THE CONFIG +//
		if (config != undefined) {
			this.#config = new Config({...this.#shared, config})
		}

		if (user != undefined) {
			if (user.id !== undefined) {
				this.ids.api = user.id
			}
			if (user.name !== undefined) {
				this.name = user.name || undefined
			}
			if (user.username !== undefined) {
				this.username = user.username || undefined
			}
			if (user.avatar_path !== undefined) {
				this.avatar = new Avatar({
					...this.#shared,
					avatar: {file_path: user.avatar_path},
				})
			}
			else if (user.avatar?.gravatar?.hash !== undefined) {
				this.avatar = new Avatar({
					...this.#shared,
					avatar: {file_path: `https://secure.gravatar.com/avatar/${user.avatar.gravatar.hash}`},
				})
			}
			else {
				this.avatar = new Avatar({
					...this.#shared,
					avatar: {file_path: 'https://secure.gravatar.com/avatar/'},
				})
			}
		}

		// Clean up class data.
		this.assignDefaults( )
	}

	get #shared ( ) {
		return {
			user: this,
			config: this.#config,
		}
	}
}

export {User}

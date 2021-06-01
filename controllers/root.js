/*** ROOT ROUTE CONTROLLER *******************************

[GET] Routes
============

/
-
ROOT route. Leads to search routes.

...detailed further in README.md
***********************************************************/

const controller = (app) => {
	//+ ROOT of entire app +//
	app.get('/', (req, res) => {
		res.render('homepage')
	})
}

export default controller

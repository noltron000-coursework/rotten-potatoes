# Rotten Potatoes
Project for *Backend Web 1.1* @ [MakeSchool].

If you spot an error, mark an issue on my github!

## Technologies
- MongoDB
- Robo 3T
- Heroku
- Mongoose
- Node.js
- Express.js
- Express.js w/ Handlebars.js
- Bootstrap
- ~~Axios~~ Fetch
- ~~jQuery~~

## Local Setup
To run this app, follow these steps:

### First Time Local Setup
1. open a terminal session
1. ensure you have [node.js] installed
1. clone this repository into a desireable directory
1. within a terminal, `cd` into the app's directory
1. run `npm install`

### Running the App Locally
1. open a terminal session
1. if there are active `mongod` instances, run `killall mongod`
1. run `mongod`
1. open a second terminal session
1. `cd` into the app's directory
1. run `npm start`
1. navigate to http://localhost:3000/ in a web browser

## Routes
| Method         | URL | Name
| :----:         | :-- | :---
| <kbd>GET</kbd> | `/` | App **Root**

### Root Routes
| Method         | URL | Name
| :----:         | :-- | :---
| <kbd>GET</kbd> | `/` | App **Root**

#### <kbd>GET</kbd> `/`
Shows the landing page of the app.

[MakeSchool]: https://www.makeschool.com/
[node.js]: https://nodejs.org/en/

# Component Structure
- **Main Layout:**
	*the main layout keeps the base structure for every page.*
- **Homepage:**
	*the homepage has a variety of options for viewing the movies index.*
- **Movies Index:**
	*the movies index page houses a list of movie-card subcomponents in a grid.*
	*each movie card utilizes two states: activated and hidden.*
	*when a movie card is activated, its details are shown.*
	*when a movie card is hidden, only its title and poster are shown.*
	- Movie Card
- **Shallow Movie Card:**
	- Title Bars
	- Details
	- Featured Poster
- **Deep Movie Card**
	- Title Bar
	- Details
	- Featured Poster
	- Poster Gallery
	- Backdrop Gallery
	- Trailer Gallery
	- Review Gallery

# To Do List
- [ ] Update **homepage** view
	- it must show options in a css-grid
	- grid must match sizes of movie-cards
- [ ] Update **movies-index** view
	- it should deconstruct

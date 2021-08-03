const express = require("express");
const bodyParser = require("body-parser");
morgan = require("morgan");
const mongoose = require("mongoose");
const Models = require("./database/models");

const Movies = Models.Movie;
const Users = Models.User;
const Genres = Models.Genre;
const Directors = Models.Director;
const passport = require("passport");
require("./helpers/passport");
const cors = require("cors");
const { check, validationResult } = require("express-validator");
const { response } = require("express");

const app = express();
const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port);
});

let allowedOrigins = ["http://localhost:7070", "http://localhost:1234", "http://localhost:4200", "https://anime-flix-reloaded.netlify.app", "https://minatore0712.github.io/AnimeFlix-Angular-client", "https://anime-flix-reloaded.netlify.app", "https://minatore0712.github.io"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        // If a specific origin isn’t found on the list of allowed origins
        let message =
          "The CORS policy for this application doesn’t allow access from origin " +
          origin;
        return callback(new Error(message), false);
      }
      return callback(null, true);
    },
  })
);

mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// mongoose.connect("mongodb://localhost:27017/animeFlixDB", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

app.use(cors());
app.use(bodyParser.json());
app.use(morgan("common"));
app.use(express.static("public"));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

let auth = require("./middelwares/auth")(app);


/**
@function Get a single movie
@description Gets a specific movie in the database.
@returns {JSON} JSON object of the movie containing the movie's title, description, director, genre, image url, and featured status.
*/
app.get(
  "/movies/:Title",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findOne({ Title: req.params.Title })
      .then((movies) => {
        res.status(200).json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);


//Return data about a genre by name/title
/**
 * @function GET specific Genre by name
 * @description Gets specific Genre by name based on client request
    * @returns {JSON} JSON object of genre containing genres name and description.
 */
app.get(
  "/genre/:Name",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.find({ "Genre.Name": req.params.Name })
      .then((genre) => {
        res.status(200).json(genre);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

//Return data about a director (bio, birth year, death year) by name
/**
 * @function GET director by name
 * @description Gets specific director as requested by client by name
   * @param {string} '/directors/:Name' directors endpoint with a specific director requested by client
 * @param {object} JWT bearer JSON web token passed into HTTP request from client
 * @returns {JSON} JSON object of director containing,
 * director name, picture, bio, birth and death years where available
 */
app.get(
  "/director/:Name",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.find({ "Director.Name": req.params.Name })
      .then((director) => {
        res.status(200).json(director);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

//Allow new users to register
/**
 * @function Create a user
 * @description Create user in database. No JSON Web Token needed. New users get JWT once created
 * IDs are also automatically generated, users do not need to add their own ID do not add this field
 * @example
 * axios({
 *  method: 'post',
  * Example request:
   {
           "Username": "Mina",
           "Password": "test",
           "Email": "Mina@web.de",
           "Birthday": "26/02/1997"
        }
 * })
 * @param {string} '/users' users endpoint requested by client
 * @param {JSON} User the user JSON object containing username, password, email, and birthday
 * @returns {JSON} JSON object of new user containing new user's username, hashed password, email, and birthday
 */
app.post(
  "/users",
  [
    check("Username", "Username is required").isLength({ min: 5 }),
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Password", "Password is required").not().isEmpty(),
    check("Email", "Email does not appear to be valid").isEmail(),
  ],
  (req, res) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + " already exists");
        } else {
          Users.create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday,
          })
            .then((user) => {
              res.status(201).json(user);
            })
            .catch((error) => {
              console.error(error);
              res.status(500).send("Error: " + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

app.get("/", (req, res) => {
  let responseText = "Welcome to AnimeFlix!";
  res.send(responseText);
});

//Allow users to update their user info
/**
@function Update a user
@description Update a user's information in the database.
@example
 axios({
      method: 'put',
           headers: { 'Authorization': `Bearer ${token}` },
      data:   {
           "Username": "Mina",
           "Password": "test",
           "Email": "Mina@web.de",
           "Birthday": "26/02/1997"
        }
})
*@param {String} '/users/:username' The users endpoint and specific username requested by the client.
*@param {Object} jwt The bearer json web token passed into the HTTP request from the client.
*@param {JSON} user The user json object containing the updated name, username, password, email, and/or birthday.
@returns {JSON} JSON object containing the updated name, username, hashed password, email, and/or birthday for the user.
*/
app.put(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $set: {
          Username: req.body.Username,
          Password: req.body.Password,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        },
      },
      { new: true },
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error: " + err);
        } else {
          res.status(200).json(updatedUser);
        }
      }
    );
  }
);

// Gets the data about a single user, by name
/**
 @function Get a single user
 @description Gets a specific user from the database.
 @example
  axios({
    method: 'get',
    url: 'https://anime-flix.db.herokuapp.com/client/users/tghnws',
    {
      headers: { Authorization: `Bearer ${token}`
    }
})
 *@param {String} '/users/:user' The users endpoint and specific user requested by the client.
 *@param {Object} jwt The bearer json web token passed into the HTTP request from the client.
 @returns {JSON} JSON object containing the user's name, username, hashed password, email, birthday, and favorite movies
 */
app.get(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOne({ Username: req.params.Username }).then((user) => {
      if (user) {
        res.status(200).send(user);
      } else {
        res.status(404).send("User not found");
      }
    });
  }
);


// API route to add movie ID to favourite movies array

/**
 @function Add movie to user favorites
 @description Adds a movie to a specific user's favorites.
 @example
  axios({
      method: 'post',
      url: 'https://movie-api.herokuapp.com/client/users/wafa/Movies/12345678',
      headers: { 'Authorization': `Bearer ${token}` }
})
 *@param {String} '/users/:user/Movies/:MovieID' The users endpoint with a specific user and movie ID.
 *@param {Object} jwt The bearer json web token passed into the HTTP request from the client.
 @returns {Object} Returns the new user object with name, username, hashed password, email, birthday, and new favorites.
 */

app.post(
  "/users/:Username/Movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const username = req.params.Username;
    const movieId = req.params.MovieID;

    Users.findOneAndUpdate(
      { Username: username },
      {
        $push: { FavoriteMovies: movieId },
      },
      { new: true }, // This line makes sure that the updated document is returned
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error: " + err);
        } else {
          res.status(201).json(updatedUser);
        }
      }
    );
  }
);

//Allow users to remove a movie from their list of favorites 
/**
 @function Delete a movie from user favorites
 @description Removes a movie to from a specific user's favorites.
 @example
  axios({
      method: 'delete',
      url: 'https://anime-flix-db.herokuapp.com/client/users/ssss/Movies/12345678',
      headers: { 'Authorization': `Bearer ${token}` }
})
 *@param {String} '/users/:user/Movies/:MovieID' The users endpoint with a specific user and movie ID.
 *@param {Object} jwt The bearer json web token passed into the HTTP request from the client.
 @returns {Object} Returns the new user object with name, username, hashed password, email, birthday, and new favorites (if any).
 */
app.delete(
  "/users/:Username/Movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $pull: { FavoriteMovies: req.params.MovieID },
      },
      { new: true }, // This line makes sure that the updated document is returned
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error: " + err);
        } else {
          res.status(200).json(updatedUser);
        }
      }
    );
  }
);


 // API route to delete user
 
/**
 @function Delete a user
 @description Removes a specific user from the database.
 @example
    axios({
      method: 'delete',
      url: 'https://anime-flix.db.herokuapp.com/client/users/jk',
      headers: { 'Authorization': `Bearer ${token}` }
})
 *@param {String} '/users/:user' The users endpoint with a specific user.
 *@param {Object} jwt The bearer json web token passed into the HTTP request from the client.
 @returns {String} Returns a string indicating the user has been deleted.
 */
app.delete(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const username = req.params.Username;
    Users.findOneAndRemove({ Username: username })
      .then((user) => {
        if (!user) {
          res.status(400).send(username + " was not found");
        } else {
          res.status(200).send(username + " was deleted.");
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 @function get All Movies
@description get All movies from the database
@returns {JSON} JSON object of all movies, each of which contain the movie's title, description, director, genre, image url, and featured status.
*/
app.get(
  "/movies",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.find()
      .then((movies) => {
        res.status(200).json(movies);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

const express = require("express");
const bodyParser = require("body-parser");
morgan = require("morgan");
const mongoose = require("mongoose");
const Models = require("./models.js");

const Movies = Models.Movie;
const Users = Models.User;
const Genres = Models.Genre;
const Directors = Models.Director;

const app = express();
const port = process.env.PORT || 8080;

mongoose.connect("mongodb://localhost:27017/animeFlixDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(bodyParser.json());
app.use(morgan("common"));
app.use(express.static("public"));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

//Get all movies
app.get("/movies", (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// Get a movie by title
app.get("/movies/:Title", (req, res) => {
  Movies.findOne({ Title: req.params.Title })
    .then((movies) => {
      res.json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// Get a movie by genre
app.get("/genre/:Name", (req, res) => {
  Genres.findOne({ Name: req.params.Name })
    .then((genre) => {
      res.json(genre);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// Get a director by name
app.get("/director/:Name", (req, res) => {
  Directors.findOne({ Name: req.params.Name })
    .then((director) => {
      res.json(director);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// Register user
app.post("/users", (req, res) => {
  Users.findOne({ Username: req.params.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + "already exists");
      } else {
        Users.create({
          Username: req.body.Username,
          Password: req.body.Password,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        })
          .then((users) => {
            res.status(201).json(users);
          })
          .catch((err) => {
            console.error(err);
            res.status(500).send("Error: " + err);
          });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// Update a user's info, by username
app.put("/users/:Username", (req, res) => {
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
    { new: true }, // This line makes sure that the updated document is returned
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error: " + err);
      } else {
        res.json(updatedUser);
      }
    }
  );
});

// Add a movie to a user's list of favorites
app.post("/users/:Username/Movies/:MovieID", (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.Username },
    {
      $push: { FavoriteMovies: req.params.MovieID },
    },
    { new: true }, // This line makes sure that the updated document is returned
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error: " + err);
      } else {
        res.json(updatedUser);
      }
    }
  );
});

// Delete a movie from a user's list of favorites
app.delete("/users/:Username/Movies/:MovieID", (req, res) => {
  Users.findOneAndRemove({ FavoriteMovies: req.params.MovieID })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + " was not found");
      } else {
        res.status(200).send(req.params.Username + " was deleted.");
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// Delete a user by username
app.delete("/users/:Username", (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + " was not found");
      } else {
        res.status(200).send(req.params.Username + " was deleted.");
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

let movies = [
  {
    title: "A Silent Voice",
    release: "2016",
    genre: "Drama",
    description:
      "A high school boy who bullied Shoko Nishimiya, a deaf girl, in elementary school. He becomes the victim of bullying when the principal finds out. Now a social outcast, he strives to make amends with Shoko.",
    featured: "true",
  },
  {
    title: "Princess Mononoke",
    release: "1997",
    genre: "Fantasy",
    description:
      "Princess Mononoke is set in the late Muromachi period of Japan (approximately 1336 to 1573 CE), but it includes fantasy elements. The story follows a young Emishi prince named Ashitaka, and his involvement in a struggle between the gods of a forest and the humans who consume its resources.",
    featured: "true",
  },
  {
    title: "Your Name",
    release: "2016",
    genre: "Fantasy",
    description:
      "Your Name depicts a high school boy in Tokyo and a high school girl in the Japanese countryside who suddenly and inexplicably begin to swap bodies.",
    featured: "true",
  },
  {
    title: "Spirited Away",
    release: "2001",
    genre: "Fantasy",
    description:
      "Spirited Away tells the story of Chihiro Ogino (Hiiragi), a 10-year-old girl who, while moving to a new neighbourhood, enters the world of Kami",
    featured: "true",
  },
  {
    title: "My Neighbour Totoro",
    release: "1988",
    genre: "Fantasy",
    description:
      "The film, which is set Tokorozawa City, Saitama Prefecture, tells the story of a professor's two young daughters (Satsuki and Mei) and their interactions with friendly wood spirits in post-war rural Japan.",
    featured: "true",
  },
  {
    title: "Howl’s Moving Castle",
    release: "2004",
    genre: "Fantasy",
    description:
      "The film tells the story of a young, content milliner named Sophie who is turned into an old woman by a witch who enters her shop and curses her. She encounters a wizard named Howl and gets caught up in his resistance to fighting for the king.",
    featured: "true",
  },
  {
    title: "Hotarubi no Mori e",
    release: "2002",
    genre: "Romance",
    description:
      "Hotarubi no Mori e tells the story of a young girl named Hotaru and her friendship with Gin, a strange young man wearing a mask, who she meets at the age of six in a mountain forest near her grandfather's country home.",
    featured: "true",
  },
  {
    title: "Violet Evergarden",
    release: "2018",
    genre: "Drama",
    description:
      "Violet Evergarden, the child soldier turned Auto Memory Doll, writes letters that evoke the words her clients can't. But when a terminally ill boy requests her services for her family, her own feelings about love and loss resurface.",
    featured: "true",
  },
  {
    title: "The Garden of Words",
    release: "2013",
    genre: "Romance",
    description:
      "The film focuses on Takao Akizuki, an aspiring 15-year-old shoemaker, and Yukari Yukino, a mysterious 27-year-old woman he keeps meeting at Shinjuku Gyoen National Garden on rainy mornings.",
    featured: "true",
  },
  {
    title: "Weathering with You",
    release: "2020",
    genre: "Romance",
    description:
      " Weathering with you depicts a high school boy who runs away from his rural home to Tokyo and befriends an orphan girl who has the ability to manipulate the weather.",
    featured: "true",
  },
];

app.get("/", (req, res) => {
  let responseText = "Welcome to AnimeFlix!";
  res.send(responseText);
});

app.get("/movies", (req, res) => {
  res.json(movies);
});

app.get("/movies/title/:title", (req, res) => {
  res.json(
    movies.find((movie) => {
      return movie.title === req.params.title;
    })
  );
});

app.get("/movies/genre/:genre", (req, res) => {
  let responseText = "Genre";
  res.send(responseText);
});

app.get("/movies/directors/:name", (req, res) => {
  let responseText = "director names!";
  res.send(responseText);
});

app.post("/users", (req, res) => {
  let responseText = "Register new user";
  res.send(responseText);
});

app.put("/users/:username", (req, res) => {
  let responseText = "Update User information";
  res.send(responseText);
});

app.post("/users/:username/favourites/:movieID", (req, res) => {
  let responseText = "Add Movie to favourites";
  res.send(responseText);
});

app.delete("/users/:username/favourites/:movieID", (req, res) => {
  let responseText = "Remove Movie from favourites";
  res.send(responseText);
});

app.delete("/users/:username", (req, res) => {
  let responseText = "Unregister an existing user";
  res.send(responseText);
});

app.listen(port, () => {
  console.log("Your app is listening on port" + port);
});

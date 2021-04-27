const express = require("express");
morgan = require("morgan");

const app = express();

app.use(morgan("common"));
app.use(express.static("public"));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

let topMovies = [
  {
    title: "A Silent Voice",
    release: "2016",
    genre: "Drama",
  },
  {
    title: "Princess Mononoke",
    release: "1997",
    genre: "Fantasy",
  },
  {
    title: "Your Name",
    release: "2016",
    genre: "Fantasy",
  },
  {
    title: "Spirited Away",
    release: "2001",
    genre: "Fantasy, Drama",
  },
  {
    title: "My Neighbour Totoro",
    release: "1988",
    genre: "Fantasy",
  },
  {
    title: "Howl’s Moving Castle",
    release: "2004",
    genre: "Fantasy",
  },
  {
    title: "Hotarubi no Mori e",
    release: "2002",
    genre: "Romance",
  },
  {
    title: "Violet Evergarden",
    release: "2018",
    genre: "Drama",
  },
  {
    title: "The Garden of Words",
    release: "2013",
    genre: "Drama, Romance",
  },
  {
    title: "Weathering with You",
    release: "2020",
    genre: "Drama, Romance",
  },
];

app.get("/", (req, res) => {
  let responseText = "Welcome to AnimeFlix!";
  res.send(responseText);
});

app.get("/movies", (req, res) => {
  res.json(topMovies);
});

app.listen(8080, () => {
  console.log("Your app is listening on port 8080.");
});

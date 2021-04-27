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
    title: "Harry Potter and the Sorcerer's Stone",
    author: "J.K. Rowling",
  },
  {
    title: "Lord of the Rings",
    author: "J.R.R. Tolkien",
  },
  {
    title: "Twilight",
    author: "Stephanie Meyer",
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

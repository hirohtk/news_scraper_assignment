var express = require("express");
//var logger = require("morgan");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

// Configure middleware

// NOT using morgan logger for logging requests
// app.use(logger("dev"));

// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// NOTE TO SELF:  I STILL NEED PUBLIC FOLDER- YOUR FRONT END JS GOES HERE... THIS IS WHY I HARDCODED DURING PROJECT 2.  
// WHEN YOU DO THIS, IF YOU ARE LINKING SCRIPT IN HTML, PRETEND YOU'RE ALREADY IN PUBLIC.

app.use(express.static("public"));

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Connect to the Mongo DB named scraperassignment
mongoose.connect("mongodb://localhost/scraperassignment", { useNewUrlParser: true });

// Routes

app.get("/", function (req, res) {
    res.render("index");
})

app.get("/scrape", function (req, res) {

  axios.get("http://lite.cnn.io/en").then(function (response) {

    var $ = cheerio.load(response.data);

    var result = {};

    // THIS IS ESSENTAILLY A FOR LOOP, making a new result object for every headline
    $("ul").children().each(function (i, element) {

      var titles = $(element).text();

      var links = $(element).find("a").attr("href");

      result = {
        title: titles,
        link: links
      }

      db.Article.create(result)
        .then(function (dbArticle) {
          // View the added result in the console
          //console.log(dbArticle);
        })
        .catch(function (err) {
          // If an error occurred, log it
          console.log(err);
        });
    });

    
  });
  // Send a message using handlebars (not working for me yet)
  res.render("index");
});

// Route for getting all Articles from the db
app.get("/articles", function (req, res) {
  // TODO: Finish the route so it grabs all of the articles
  db.Article.find({}).then(function (response) {
    // response is an array, so we can leverage the #each in hbs
    // syntax for object is:  {nameinhbs: your array}
    
    res.render("index", {articleshbs: response});
    
  });
  
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function (req, res) {
  // TODO
  // ====
  // Finish the route so it finds one article using the req.params.id,
  // and run the populate method with "note",
  // then responds with the article with the note included

  var article = req.params.id;

  db.Article.findById(article).
    populate("note")
    .then(function (response) {
      res.json(response);
    })
    .catch(function (err) {
      res.json(err);
    });
});

// can also do db.Article.findOne({_id: req.params.id}).populate("note")

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function (req, res) {
  // TODO
  // ====
  // save the new note that gets posted to the Notes collection
  // then find an article from the req.params.id
  // and update it's "note" property with the _id of the new note

  var newNote = req.body;
  var article = req.params.id;

  db.Note.create(newNote).then(function (response) {
    db.Article.findByIdAndUpdate(article, {$set: {note: response}}, function (err, done) {
      if (err) {
        console.log(err);
      }
      res.send(done);
    });
  });
  // can also do db.Article.findAndUpdateOne({_id: req.params.id} , ...)
});

// Start the server
app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});

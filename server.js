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

// THIS IS WHAT IS RESPONSIBLE FOR RENDERING EVERYTHING IN HBS.  
// NEED TO HAVE THIS CONSTANTLY DOING THE ARTICLE POPULATION.  IF LOAD PAGE AND NO SCRAPED ARTICLES, NO ARTICLES RENDER IS EXPECTED!
// IF THERE IS STUFF IN THE DB HOWEVER, IT WILL RENDER.


app.get("/", function (req, res) {
  // response is an array, so we can leverage the #each in hbs
  // syntax for object is:  {nameinhbs: your array}
  db.Article.find({}).then(function (response) {
    var newArrayForHbs = [];
    if (response.length > 0) {
      for (i = 0; i < 8; i++) {
        var subObj = {};
        subObj._id = response[i]._id;
        subObj.title = response[i].title;
        subObj.link = "http://lite.cnn.io" + response[i].link;
        if (response[i].saved) {
          subObj.saved = "color:goldenrod";
        }
        if (response[i].note) {
          subObj.noted = "color:green";
        }
        newArrayForHbs.push(subObj);
      }
      res.render("index", { articleshbs: newArrayForHbs });
    }
    else {
      res.render("index", { articleshbs: newArrayForHbs });
    }

    // FOR SOME REASON I COULDN'T JUST GIVE response.  HAD TO MAKE NEW ARRAY TO LOOK SOMETHING LIKE THE BELOW.  NOT SURE WHY
  });
  // { articleshbs: [
  //   { title:
  //      'Standing down: How Trump decided that not striking back was his best option on Iran',
  //     link: '/en/article/h_c3507009208c455a2d569d8384c53daf',
  //   },
  //   {title: 'Opinion: Australian bushfires point to an ominous pattern',
  //     link: '/en/article/h_d352a171f6d14de3519c9e26bb667a21',
  //   },
  //   {title:
  //      'Secrets of an astonishingly well-preserved 2,600-year-old human brain',
  //     link: '/en/article/h_14f0c8b1431066a725c29c27b46e4628',
  //   },
  //   {title:
  //      'Disney\'s \'Frozen\' village gives tourists the cold shoulder',
  //     link: '/en/article/h_d10947c1352cae204f3c8d6850cfce74',
  //    },
  // ]}
})

app.get("/scrape", function (req, res) {

  axios.get("http://lite.cnn.io/en").then(function (response) {

    var $ = cheerio.load(response.data);

    var resultArray = [];

    // THIS IS ESSENTAILLY A FOR LOOP, making a new result object for every headline
    $("ul").children().each(function (i, element) {

      var titles = $(element).text();

      var links = $(element).find("a").attr("href");

      result = {
        title: titles,
        link: links
      }
      // nested axios to scrape one level down - unsuccessful OR CNN is preventing me from scraping further.  
      axios.get("http://lite.cnn.io/en" + "/" + links).then(function (response) {
        var $ = cheerio.load(response.data);
        console.log($(".afe4286c").find("p").text());
        $(".afe4286c").find("p").each(function (i, element) {
          var paragraph = $(element).text();
          console.log("paragraph is " + paragraph)
        })
      });
      // nest
      resultArray.push(result);
    });
    db.Article.create(resultArray)
      .then(function (dbArticle) {
        // View the added result in the console
        //console.log(dbArticle);
        res.json({ response: "test" });
      })
      .catch(function (err) {
        // If an error occurred, log it
        console.log(err);
      });

  });

});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function (req, res) {
  var article = req.params.id;
  //"Find this Article found by ID, 
  db.Article.findById(article).
    populate("note")
    // and populate this with *note* as defined in schema (would populate with more than one note, but in the schema 
    // putting the object in array defines that.  here, we only have the object for a 1-1 relation )."
    .then(function (response) {
      res.json(response);
    })
    .catch(function (err) {
      res.json(err);
    });
});

// can also do db.Article.findOne({_id: req.params.id}).populate("note")

app.post("/articles/:id", function (req, res) {
  var newNote = req.body;
  var article = req.params.id;
  db.Note.create(newNote).then(function (response) {
    // this response is the ENTIRE NOTE DOCUMENT.  This is how the Article uses it below.
    // this *note* below is set in your schema/model for ARTICLE.  YOU ARE UPDATING ARTICLE BY ID, SETTING
    // THE **ARTICLE's** note TO THIS POST.
    db.Article.findByIdAndUpdate(article, { $set: { note: response } }, function (err, done) {
      if (err) {
        console.log(err);
      }
      res.send(done);
    });
  });
  // can also do db.Article.findAndUpdateOne({_id: req.params.id} , ...)
});

app.get("/notedelete/:id", function (req, res) {
  var note = req.params.id;
  console.log("deleting the value of the note in " + note);
  // Like the get route above, but I'm using the delete express method to do an mongoose update  method
  db.Note.findByIdAndUpdate(note, { $set: { body: "" }, }, function (err, done) {
    if (err) {
      console.log(err);
    }
    res.send(done);
  });
});

app.put("/favorite/:id", function (req, res) {
  var article = req.params.id;
  console.log(article);
  db.Article.findByIdAndUpdate(article, { $set: { saved: true } }, function (err, done) {
    if (err) {
      console.log(err);
    }
    res.send(done);
  });
  // can also do db.Article.findAndUpdateOne({_id: req.params.id} , ...)
});

app.delete("/delete", function (req, res) {
  db.Article.deleteMany({}, function (err) {
    res.send("done deleting everything")
  });
});

app.get("/saved", function (req, res) {
  // response is an array, so we can leverage the #each in hbs
  // syntax for object is:  {nameinhbs: your array}
  db.Article.find({saved: true}).then(function (response) {
    var newArrayForHbs = [];
    if (response.length > 0) {
      for (i = 0; i < response.length; i++) {
        var subObj = {};
        subObj._id = response[i]._id;
        subObj.title = response[i].title;
        subObj.link = "http://lite.cnn.io" + response[i].link;
        if (response[i].note) {
          subObj.noted = "color:green";
        }
        newArrayForHbs.push(subObj);
      }
      res.render("saved", { articleshbs: newArrayForHbs });
    }
    else {
      res.render("saved", { articleshbs: newArrayForHbs });
    }
    // FOR SOME REASON I COULDN'T JUST GIVE response.  HAD TO MAKE NEW ARRAY TO LOOK SOMETHING LIKE THE BELOW.  NOT SURE WHY
  });
});

// Start the server
app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});

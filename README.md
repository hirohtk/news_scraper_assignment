# news_scraper_assignment

This assignment leverages the following node packages in the following ways:
---------------

**express**: node.js server package
**express-handlebars**: used in view component 
**mongoose**: ODM for mongoDB, created mongodb schemas in models for articles and their notes.  
**axios**: used for GETting a string version of an html page
**cheerio**: used for scraping through the string obtained by axios, containing methods for grabbing pertinent information for the app, including headlines and article links

The premise of this application is as follows:

1. A user will visit the root directory, rendering up to 8 articles that were already scraped, or notify if there are no articles scraped.  If there are no articles scraped, a button is clicked that scrapes http://lite.cnn.io/en for articles.  Once articles are scraped, their titles and links are stored in mongodb.  

2. Once articles are rendered on screen, users can click (Fontawesome) icons in order to favorite articles, adding another field onto each "article" document that indicates whether they are saved or not.  Saved articles can be seen on a different page, that are rendered using another mongoose method returning articles only if they are saved.  

3.  Users can also add comments by clicking the comment icon- this brings up a modal that prompts text input.  This text input can be saved in another document for notes, which is referenced in relation to the specific article that is being commented in.  Extensive use of Jquery in adding attributes to the rendered articles was instrumental to link comments to their articles on the front-end.

There are a few known bugs as of Jan 13th 2020:

1.  Comments that are deleted are only "confirmed" on the front-end by removing the green color for the comment icon.  I am currently working on a way to have articles render with black icons if their related notes have a string length of zero.  

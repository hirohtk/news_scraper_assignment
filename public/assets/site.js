$(document).ready(function () {

    $("#scrapeButton").on("click", function() {
        $.get("/scrape", function (response) {
            //console.log(response);
            // Not really doing anything here- just activating the scrape route
        });
    });

    $("#getArticlesButton").on("click", function () {
        $.get("/articles", function (response) {
            console.log("getting articles");
            for (i = 0; i < response.length; i++) {
                console.log(response[i].title);
                console.log(response[i].link);
            }
        });
    });
});
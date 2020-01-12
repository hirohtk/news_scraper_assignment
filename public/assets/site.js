$(document).ready(function () {

    $("#scrapeButton").on("click", function() {
        $.get("/scrape", function (response) {
            // Not really doing anything here- just activating the scrape route
            // handlebars taking care of the populating 
            console.log(response);
        }).then(function () {
            window.location.replace("/");
        });
    });
});
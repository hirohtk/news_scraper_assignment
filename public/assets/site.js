$(document).ready(function () {
    console.log("test");
    $("#scrapeButton").on("click", function() {
        console.log("scrape button hit");
        $.get("/scrape", function (response) {
            console.log(response);
            
        });
    });
});
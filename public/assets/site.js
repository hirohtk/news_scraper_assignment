$(document).ready(function () {

    $("#scrapeButton").on("click", function () {
        // $.get("/scrape", function (response) {
        //     // Not really doing anything here- just activating the scrape route
        //     // handlebars taking care of the populating 
        //     console.log(response);
        // }).then(function () {
        //     window.location.replace("/");
        // });
        $.ajax({
            url: "/scrape",
            method: "GET"
        }).then(function () {
            window.location.replace("/");
        })
    });

    $("#deleteEverythingButton").on("click", function () {
        console.log("delete everything");
        $.ajax({
            url: "/delete/",
            method: "DELETE",
          })
            .then(function() {
                window.location.replace("/");
            });
    });

    $(".articleBox").on("click", function () {
        $("#yourNote").val("");
        $("#noteModal").modal();
        // setting up information on the modal to use when posting
        $(".modal-title").text($(this).attr("title"));
        $(".noteSubmit").attr("data-id", $(this).attr("data-id"));
        // setting up information on the modal to use when posting
        const id = $(this).attr("data-id");

        // setting up a regular id that is the same as data-id so I can use it in the get 
        $(this).attr("id", $(this).attr("data-id"));

        var noteId;
        $.get("/articles/" + id, {}, function (response) {
            // if there is a note already in the db, then:
            // which establishes a "noteId" which I stick to the article div for the delete function
            if (response.note) {
                // show notes
                $("#yourNote").val(response.note.body)
                console.log("note.body response " + response.note.body);
                noteId = response.note._id;
                $("#" + id).attr("data-note", noteId);
                $(".noteDelete").attr("data-note", noteId);
            }
            //otherwise, don't set a "noteId"
        });

        $(".noteSubmit").one("click", function () {
            console.log("Submit")
            const yourNote = $("#yourNote").val().trim();
            const id = $(this).attr("data-id");
            const objForBackEnd = {
                body: yourNote,
            }
            $.post("/articles/" + id, objForBackEnd, function (response) {
                $("#noteModal").modal("hide")
                $(".noteSubmit").attr("data-id", "");
                $(".noteSubmit").off("click");
            });
            
        });
        $(".noteDelete").one("click", function () {
            console.log("Delete")
            const id = $(this).attr("data-note");
            console.log(id);
            $.get("/notedelete/" + id, function (response) {
                $("#noteModal").modal("hide")
                $(".noteSubmit").attr("data-id", "");
                $(".noteDelete").attr("data-note", "");
                $(".noteDelete").off("click");
            });
            
        });
    });

    
        
    

    

});
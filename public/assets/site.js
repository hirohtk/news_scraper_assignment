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

    $(".articleBox").on("click", function() {
        $("#noteModal").modal();
        $(".modal-title").text($(this).attr("title"));
        $(".noteSubmit").attr("data-id", $(this).attr("data-id"));
        const id = $(this).attr("data-id");
        console.log(id);
        $.get("/articles/" + id, {}, function (response) {
            $("#yourNote").val(response.note.body)
            console.log(response.note.body)
        })
        submitNote();
    });

    function submitNote () {
        $(".noteSubmit").on("click", function() {
            console.log("submit")
            const yourNote = $("#yourNote").val().trim();
            const id = $(this).attr("data-id");
            console.log(yourNote);
            console.log(id);
            const objForBackEnd = {
                body: yourNote,
            }
            $.post("/articles/" + id, objForBackEnd, function (response) {
                $("#noteModal").modal("hide")
                $(".noteSubmit").attr("data-id", "");
                $(".noteSubmit").off("click");
            });
        });
    }

    function deleteNote () {
        $(".noteDelete").on("click", function() {
            console.log("Delete")
            const yourNote = $("#yourNote").val().trim();
            const id = $(this).attr("data-id");
            console.log(yourNote);
            console.log(id);
            const objForBackEnd = {
                body: yourNote,
            }
            $.post("/articles/" + id, objForBackEnd, function (response) {
                $("#noteModal").modal("hide")
                $(".noteSubmit").attr("data-id", "");
                $(".noteSubmit").off("click");
            });
        });
    }
    
    
    
});
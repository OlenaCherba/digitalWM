$(document).ready(function (){
    $("#encoder").hide();
    $("#decoder").hide();
    $("#btnEncode").click(function () {
        console.log("encode");
        $("#decoder").hide();
        $("#encoder").show();


        var encodeForm = $("#encodeForm");
        var formData = new FormData(encodeForm);
        $("#submitEncode").click(function () {
            var data = {
                text: $("#message").val(),
                textFile: $("#textFile").val(),
                image: $("#image").val(),
                alg: $("alg").val(),
                color: $("color").val(),
                seed: $("#seed").val()
            };
            //console.log(formData);
            $.ajax({
                type: "POST",
                url: "/enc",
                processData: false,
                contentType: false,
                data: data,
                success: function (result) {
                    console.log("done");
                }
            });
        });
    });
    $("#btnDecode").click(function () {
        console.log("encode");
        $("#encoder").hide();
        $("#decoder").show();
        $("#submitDecode").click(function () {
            var data = {
                image: $("#image").val(),
                alg: $("alg").val(),
                color: $("color").val(),
                seed: $("#seed").val()
            };
            //console.log(formData);
            $.ajax({
                type: "POST",
                url: "/dec",
                processData: false,
                contentType: false,
                data: data,
                success: function (result) {
                    console.log("done");
                }
            });
        });
    });
});

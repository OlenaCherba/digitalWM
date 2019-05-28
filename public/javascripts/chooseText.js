$(document).ready(function (){
    $("#btnEncode").click(function () {
        console.log("encode");
        $.ajax({
            url:"/enc", success:function (result) {
                $("#encoder").html(result);
                //console.log("success");
            }
        });
    });
});

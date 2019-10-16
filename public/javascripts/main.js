$(document).ready(function() {
    $("#btnEncode").click(function () {
        $("#result").remove();
        $("#textResult").remove();
        $("#enc").remove();
        $("#dec").remove();
        $("#encodeForm").append(
            '<div id="enc" class="row form">' +
            '<div class="col-md-6">' +
            '<div class="form-group">' +
            '<button id="write" type="button" class="btn btn-outline-secondary">Ввод текста в текстовом поле</button>'+
            '<button id="uploadText" type="button" class="btn btn-outline-secondary">Загрузить файл с текстом</button>'+
            '</div>'+
            '<div id="textErr" class="form-group"></div>'+
            '<div id="input" class="form-group">' +
            '</div>'+
            '<p>Загрузите изображение</p>' +
            '<div class = "form-group">' +
            '<input id = "image" type = "file" name = "image">' +
            '<div id="imgErr" class="form-group"></div>'+
            '</div>'+
            '</div>'+
            '<div class="col-md-6">\n' +
            '    <p>Выберите алгоритм шифрования</p>\n' +
            '    <div class="form-group">\n' +
            '        <div class="row">\n' +
            '            <div class="col-md-6"><input id="lsb" type="radio" name="alg" value="lsb" /><label for="lsb">LSB</label></div>\n' +
            '            <div class="col-md-6"><input id="block" type="radio" name="alg" value="block" /><label for="block">Blocks</label></div>\n' +
            '        </div>\n' +
            '    </div>\n' +
            '    <p>Выберите цветовой канал для формирования стегоключа\n' +
            '        <div class="row">\n' +
            '            <div class="col-md-4"><input id="red" type="radio" name="color" value="0" /><label class="red" for="red">"R"</label></div>\n' +
            '            <div class="col-md-4"><input id="green" type="radio" name="color" value="1" /><label class="green" for="green">"G"</label></div>\n' +
            '            <div class="col-md-4"><input id="blue" type="radio" name="color" value="2" /><label class="blue" for="blue">"B"</label></div>\n' +
            '        </div>\n' +
            '        <p>Введите значения параметров, необходимых для создания маски(seed)</p>\n' +
            '        <div class="row">\n' +
            '            <div class="col-md-6"><label for="seed">Seed:</label><input id="seed" type="number" name="seed" value="0" min="0" max="20" step="1" /></div>\n' +
            '        </div>\n' +
            '    </p>\n' +
            '</div>'+
            '</div>\n'+
            '<div id="result" class="text-center">\n' +
            '<div  class="row">\n' +
            '<div class="col-12"><button class="btn btn-secondary" id="submitEncode" type="submit" name="submit">Загрузить<i class="fas fa-upload"></i></button></div>\n' +
            '     <div class="col-12" id="imageBlock"></div>\n' +
            '    <div class="col-12" id="download"></div>\n' +
            '</div>'+
            '</div>');
        $("#write").click(function () {
            $("#input1").remove();
            $("#input2").remove();
            $("#input").append('<div id="input1" class="form-group">' +
                '<input id="message" type = "text" name="message" size="40" >'+
                '</div>');
        });
        $("#uploadText").click(function () {
            $("#input2").remove();
            $("#input1").remove();
            $("#input").append(
                '<div id="input2" class="form-group">' +
                '<input id = "textFile" type = "file" name = "textFile" >'+
                '</div>');
        });
    });
    $("#btnDecode").click(function () {
        $("#result").remove();
        $("#textResult").remove();
        $("#dec").remove();
        $("#enc").remove();
        //$("#decodeContainer").append('<form id="decodeForm" action="/dec" method="post" enctype = "multipart/form-data"></form>');
        $("#decodeForm").append('<div id ="dec" class="row form">' +
            '<div class="col-md-6">\n' +
            '    <p>Загрузите изображение для извлечения ЦВЗ</p>\n' +
            '    <div class="form-group"><input type="file" name="image" /></div>\n' +
            '    <div class="form-group"></div>\n' +
            '</div>\n' +
            '<div class="col-md-6">' +
            '<p>Выберите алгоритм шифрования</p>\n' +
            '<div class="form-group">\n' +
            '    <div class="row">\n' +
            '        <div class="col-md-6"><input id="lsb" type="radio" name="alg" value="lsb" /><label for="lsb">LSB</label></div>\n' +
            '        <div class="col-md-6"><input id="block" type="radio" name="alg" value="block" /><label for="block">Blocks</label></div>\n' +
            '    </div>\n' +
            '</div>\n' +
            '<p>Выберите цветовой канал для формирования стегоключа</p>\n' +
            '<div class="form-group">\n' +
            '    <div class="row">\n' +
            '        <div class="col-md-4"><input id="red" type="radio" name="color" value="0" /><label class="red" for="red">"R"</label></div>\n' +
            '        <div class="col-md-4"><input id="green" type="radio" name="color" value="1" /><label class="green" for="green">"G"</label></div>\n' +
            '        <div class="col-md-4"><input id="blue" type="radio" name="color" value="2" /><label class="blue" for="blue">"B"</label></div>\n' +
            '    </div>\n' +
            '</div>\n' +
            '<p>Введите значения параметров, необходимых для создания маски(seed) и определения алгоритма внедрения(E)</p>\n' +
            '<div class="row">\n' +
            '    <div class="col-md-6"><label for="seed">Seed:<input id="seed" type="number" name="seed" value="0" min="0" max="20" step="1"/></label></div>\n' +
            '    <!--div(class = "col-md-6")label(for="E") E:\n' +
            'input(id="E" type = \'text\' name="E" size="10")-->\n' +
            '</div>\n' +
            '</div>'+
            '</div>'+
            '<div id="textResult" class="form-group text-center">\n' +
            '    <div class="col-12"><button class="btn btn-secondary" id="submitDecode" type="submit" name="submit">Загрузить<i class="fas fa-upload"></i></button></div>\n' +
            '    <div class="col-12" id="resultDecode"></div>\n' +
            '</div>');
    });
    $('#encodeForm').submit(function() {
        $("#resultImage").remove();
        $("#downloadLink").remove();
        $(this).ajaxSubmit({
            error: function(xhr) {
                status('Error: ' + xhr.status);
            },
            success: function(response) {
                var data = JSON.parse(response);
                if(data.textFile === "err" ){
                    $("#textErr").append('<div class="alert alert-danger" role="alert">\n' +
                        '  <strong>Ошибка!</strong> Загрузите файл формата txt.\n' +
                        '</div>');
                }
                if(data.image === "err" ){
                    $("#imgErr").append('<div class="alert alert-danger" role="alert">\n' +
                        '  <strong>Ошибка!</strong> Загрузите файл формата png.\n' +
                        '</div>');
                }
                if (data.textFile !== "err" && data.image !== "err"){
                    getEnc(data);
                }
            }
        });
        return false;
    });
    $('#decodeForm').submit(function() {
        $(this).ajaxSubmit({
            error: function(xhr) {
                status('Error: ' + xhr.status);
            },
            success: function(response) {
                var data = JSON.parse(response);
                getDec(data);
            }
        });
        return false;
    });

});

function getEnc(data) {
    var url = "/enc";
    var data = {
        "msg":$("#message").val(),
        "textFile":data.textFile,
        "image":data.image,
        "alg":$('input:radio[name=alg]:checked').val(),
        "color":$('input:radio[name=color]:checked').val(),
        "seed":$("#seed").val()
    };
    $.ajax({
        url: url,
        data:data,
        dataType: "json",
        success: resultEncode,
        error: errorRequestingData
    });
}
function getDec(data) {
    var url = "/dec";
    var data = {
        "image":data.image,
        "alg":$('input:radio[name=alg]:checked').val(),
        "color":$('input:radio[name=color]:checked').val(),
        "seed":$("#seed").val()
    };
    $.ajax({
        url: url,
        data:data,
        dataType: "json",
        success: resultDecode,
        error: errorRequestingData
    });
}
function resultEncode(data) {
    var img = $('<img />').attr({
        'id': 'resultImage',
        'class':'img-thumbnail',
        'src': "/download/"+data.imageResult,
        'alt': 'img',
        'title': 'img',
        'width': 250
    }).appendTo('#imageBlock');
    var a= $('<a>Скачать</a>').attr({
        'id':'downloadLink',
        'class' : 'btn btn-success',
        'href': "/download/"+data.imageResult,
        'download': data.imageResult
    }).appendTo('#download');
    var i = $('<i/>').attr({
        'class' : 'fas fa-download',
    }).appendTo("#downloadLink");
    //$("#imageBlock").append('<img id="resultImage" class="img-thumbnail" src='+text(data.imageResult)+' alt="enc">');
    // alert(data.imageResult);
}

function resultDecode(data) {
    //alert(data.textResult);
    $("#resultDecode").append('<p>'+data.textResult+'</p>');
}
function errorRequestingData(requestObject, textStatus, errorThrown) {
    alert("Error receiving results..." + textStatus + ":" + errorThrown);
}



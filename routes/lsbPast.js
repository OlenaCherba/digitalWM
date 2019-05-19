var Jimp = require('jimp');
var pathDownload = 'public/download/';
var decTobin = require('decimal-to-any');
var fs = require('fs');

function stringToBits(str) {
    var bits = [];
    if(str !== undefined){
        for(var i = 0, l = str.length; i<l; i++){
            var character = str[i];
            var number = str.charCodeAt(i);
            // Non-standard characters are treated as spaces
            if(number > 255){
                number = spaceCode;
            }
            for(var j = 7; j >=0; j--){
                bits[i * 8 + 7 - j]=(number>>j)&1;
            }
        }
    }
    return bits;
}

function bitsToString(bits) {
    var str = '';
    var character;

    for (var i = 0, l = bits.length; i < l; i += 8) {
        character = 0;
        for (var j = 7; j >= 0; j -= 1) {
            character += bits[i + 7 - j] << j
        }
        str += String.fromCharCode(character)
    }
    return str;
}
function createBitsForTextLength(text) {
    var textLength;
    textLength = text.length;

    // кодировка первых 32 битов длиной сообщения.lengthString - длина сообщения
    var lengthString = '';
    lengthString += String.fromCharCode((textLength >> 32) & 255);
    lengthString += String.fromCharCode((textLength >> 24) & 255);
    lengthString += String.fromCharCode((textLength >> 16) & 255);
    lengthString += String.fromCharCode((textLength >>  8) & 255);
    lengthString = stringToBits(lengthString);

    return lengthString;
}
function lengthToInt(length){
    length = bitsToString(length);
    var l = 0;
    l += length.charCodeAt(0) << 32;
    l += length.charCodeAt(1) << 24;
    l += length.charCodeAt(2) << 16;
    l += length.charCodeAt(3) << 8;
    l = l*8;

    return l;
}

function size(length){
    length = bitsToString(length);
    var l = 0;
    l += length.charCodeAt(0) << 32;
    return l;
}
function encode(img, msg, color, filename) {

    Jimp.read(img)
        .then(image => {
            var resImg = new Jimp(image.getWidth(), image.getHeight());
            var lengthMsg = createBitsForTextLength(msg);
            msg = stringToBits(msg);
            var ll=0;
            var lm=0;
            var r,g,b,a = 0;

                for(var i =0; i < image.getWidth(); i++){
                    for(var j=0; j < image.getHeight();j++){
                        var col=0;
                         var pixel = Jimp.intToRGBA(image.getPixelColor(i,j));
                        switch (color) {
                            case 0:
                                col = pixel.r;
                                break;
                            case 1:
                                col = pixel.g;
                                break;
                            case 2:
                                col = pixel.b;
                                break;
                        }

                        r = pixel.r;
                        g = pixel.g;
                        b = pixel.b;
                        a = pixel.a;

                        if(ll<lengthMsg.length){
                            var pixelColor = (col & 254)+(lengthMsg[ll] ? 1 : 0);
                            //*******
                            switch (color) {
                                case 0:
                                    resImg.setPixelColor(Jimp.rgbaToInt(pixelColor, g, b, a), i, j);
                                    break;
                                case 1:
                                    resImg.setPixelColor(Jimp.rgbaToInt(r, pixelColor, b, a), i, j);
                                    break;
                                case 2:
                                    resImg.setPixelColor(Jimp.rgbaToInt(r, g, pixelColor, a), i, j);
                                    break;
                            }
                            ll++;
                        }
                        else if(ll>=lengthMsg.length && lm<msg.length){
                            //************
                            var pixelColor = (col & 254)+(msg[lm] ? 1 : 0);
                            //*******
                            switch (color) {
                                case 0:
                                    resImg.setPixelColor(Jimp.rgbaToInt(pixelColor, g, b, a), i, j);
                                    break;
                                case 1:
                                    resImg.setPixelColor(Jimp.rgbaToInt(r, pixelColor, b, a), i, j);
                                    break;
                                case 2:
                                    resImg.setPixelColor(Jimp.rgbaToInt(r, g, pixelColor, a), i, j);
                                    break;
                            }
                            lm++;
                        } else  resImg.setPixelColor(image.getPixelColor(i,j), i, j);

                    }
                }
           // }
            var file = pathDownload + filename;
            console.log(file);
            resImg.write(file, function (err) {
                if(err) throw err;
                console.log("success encoded");
            });
            console.log(decode(file, color));
            // Do stuff with the image.
        })
        .catch(err => {
            throw err;// Handle an exception.
        });
}

function decode(img, color){
    Jimp.read(img)
        .then(image=>{
            var resultString='';
            var stegotext = [];
            var length = [];
            var index=0;
           var intLength;
            var n =0;

            for(var i =0; i < image.getWidth(); i++){
                for(var j=0; j < image.getHeight();j++){
                    var col=0;
                    var pixel = Jimp.intToRGBA(image.getPixelColor(i,j));
                    switch (color) {
                        case 0:
                            col = pixel.r;
                            break;
                        case 1:
                            col = pixel.g;
                            break;
                        case 2:
                            col = pixel.b;
                            break;
                    }

                    if(n < 32) {
                        length[n] = (col & 1) ? 1 : 0;
                        n++;
                    } else if(n===32){
                        intLength=lengthToInt(length);
                        if(index <intLength){
                            stegotext[index]=(col&1)?1:0;
                            index++;
                        }
                        if(index === intLength) {
                            resultString = bitsToString(stegotext);
                            break;
                        }
                    }


                }
            }
        console.log(resultString.slice(0, size(length)));
            fs.writeFile(pathDownload+'decrypt.txt', resultString.slice(0, size(length)), function (err) {
                if(err) throw err;
                console.log("success");
            });
        })
        .catch(err=>{
            throw err;
        })

}
module.exports={
    encode: encode,
    decode: decode
};
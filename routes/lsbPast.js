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

            //console.log(number);
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
    console.log("stringToBits(lengthString)"+lengthString);

    return lengthString;
}
function lengthToInt(length){
    length = bitsToString(length);
    var l = 0;
    var int = 0
    l += length.charCodeAt(0) << 32;
    int = l;
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
            //var col;

                for(var i =0; i < image.getWidth(); i++){
                    for(var j=0; j < image.getHeight();j++){
                        var pixel = Jimp.intToRGBA(image.getPixelColor(i,j));
                        var r = pixel.r;
                        var g = pixel.g;
                        var b = pixel.b;
                        var a = pixel.a;

                        if(ll<lengthMsg.length){
                            var pixelColor = (r & 254)+(lengthMsg[ll] ? 1 : 0);
                            console.log("lengthMsg[ll] ? 1 : 0  "+lengthMsg[ll] ? 1 : 0);
                            resImg.setPixelColor(Jimp.rgbaToInt(pixelColor, g, b, a), i, j);
                            ll++;

                        }
                        else if(ll>=lengthMsg.length && lm<msg.length){
                            var pixelColor = (r &254)+(msg[lm] ? 1 : 0);
                            resImg.setPixelColor(Jimp.rgbaToInt(pixelColor, g, b, a), i, j);
                            lm++;
                        } else  resImg.setPixelColor(image.getPixelColor(i,j), i, j);

                    }
                }
           // }
            console.log("msg "+msg);
            var file = pathDownload + filename;
            console.log(file);
            console.log(resImg);

            resImg.write(file, function (err) {
                if(err) throw err;
                console.log("success encoded");
            });
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
                    var pixel = Jimp.intToRGBA(image.getPixelColor(i,j));
                    var r = pixel.r;
                    var g = pixel.g;
                    var b = pixel.b;
                    var a = pixel.a;

                    if(n < 32) {
                        length[n] = (r & 1) ? 1 : 0;
                        //console.log("length="+length);
                        //console.log("r="+r);
                       //console.log("(r & 1) ? 1 : 0 "+(r & 1) ? 1 : 0);
                        n++;
                    } else if(n===32){
                        intLength=lengthToInt(length);
                       // console.log("intLeng="+intLength);
                        if(index <intLength+32){
                            stegotext[index]=(r&1)?1:0;
                            index++;
                        } else if(index === intLength+32) {
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

        })

}
module.exports={
    encode: encode,
    decode: decode
};
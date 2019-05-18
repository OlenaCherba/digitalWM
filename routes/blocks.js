var Jimp = require('jimp');
var pathDownload = 'public/download/';
var fs = require('fs');
var bits = require('./bits');
var random = require('random');
var seedrandom = require('seedrandom');

function koef (k) {
    k+=8;
    return k;
}
function encode(img, msg, col, seed) {
    Jimp.read(img)
        .then(image=>{
            var resImg = new Jimp(image.getWidth(), image.getHeight());
            var lengthMsg = bits.createBitsForTextLength(msg);
            msg = bits.stringToBits(msg);
            var i =0;
            var j =0;
            var h= 0;
            var w = 0;
            var mask=[[],[],[],[],[],[],[],[]];
            var pixelBlock=[[],[],[],[],[],[],[],[]];
            //var pixelBlock=[[]];
            var block0 = [];
            var block1= [];
            var k = 0;

            //random.use(seedrandom(20));
            var rng = random.clone(seedrandom(20));
            rng.patch();
                //Создание маски. блок 8х8
            for(var k = 0; k<8;k++){
                for(var l = 0; l<8;l++){
                    mask[k][l] =  rng.int(0,1);
                }
            }
            console.log(mask);

            /*for(var n = 0; n<image.getWidth(); n+=8){
                for(var m = 0; m<image.getHeight();m+=8){
                    var p = 0;
                    if(n!== image.getWidth() && m!==image.getHeight()){
                        for(var i = 0;i<koef(k);i++){
                            for(var j = 0;j<koef(k);j++){
                                if(j===15){
                                    p++
                                }else if(p===7){
                                    break;
                                }
                                else {
                                    var pixel = Jimp.intToRGBA(image.getPixelColor(i, j));
                                    console.log("pixel:" + pixel.r);
                                    console.log(j);
                                    pixelBlock[p].push(pixel.r);

                                }
                            }
                        }//p++
                    }
                    else {
                        break;
                    }
                }
            }*/
            for(var n = 0; n<image.getWidth(); n+=8){
                for(var m = 0; m<image.getHeight();m+=8){
                    var p = 0 ;
                    var b = 0;
                    while (i<b+8){

                        while(j<b+8){
                            var pixel = Jimp.intToRGBA(image.getPixelColor(i,j));
                            pixelBlock[p].push(pixel.r);
                            j++;
                        }
                        p++;
                        i++;
                        j=0;
                    }
                    console.log(pixelBlock);
                    b = koef(k);
                    i = b;
                    j= b;
                }
            }


        })
            .catch(err=>{
                throw err;
            })


}

module.exports = {
    encode:encode
}
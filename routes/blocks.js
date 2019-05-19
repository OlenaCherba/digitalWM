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
function average(subblock) {
    var mean = 0;
    for(var i = 0; i < subblock.length; i++){
        mean += subblock[i];
    }
    return  Math.round(mean/subblock.length);
}

function change(block, id) {
    var k1 = 4;
    var k2 = 45;
    var newBlock = [];
    if(id === 0){
        for(var i = 0; i < block.length;i++){
            if(block[i]<k1){
                newBlock[i] = block[i];
            }
            else newBlock[i] = block[i]-k1;
        }
    } else if(id === 1){
        for(var i = 0; i < block.length;i++){
            if(block[i]>255-k2){
                newBlock[i]=block[i];
            } else newBlock[i] = block[i]+k2;
        }
    }
    return newBlock;
}
function doEncode(mask, pixelBlock, infBit, E) {
   //var  block = pixelBlock;
    console.log("infBit="+infBit);
    var subblock0 = [];
    var subblock1 = [];
    var newSub0 = [];
    var newSub1 = [];
    var newPixelBlock = [[],[],[],[],[],[],[],[]];
    var l0 = 0;
    var l1 = 0;
    var bright0 = 0;
    var bright1 = 0;
    console.log(pixelBlock);
    //console.log(newPixelBlock);
    for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++) {
            var value = 0;
            var m = mask[i][j];

            if (m === 0) {
                value = pixelBlock[i][j];
                subblock0[l0] = value;
                l0++;
            } else if (m === 1) {
                value = pixelBlock[i][j];
                subblock1[l1] = value;
                l1++;
            }
        }
    }
    console.log("block0="+subblock0);
    console.log("block1="+subblock1);
    bright0 = average(subblock0);
    bright1 = average(subblock1);
    console.log("bright0"+bright0);
    console.log("bright1"+bright1);

    switch (infBit) {
        case 0:
            if(bright0-bright1 <= -E){
               newPixelBlock = pixelBlock;
            }
            else if(bright0-bright1 > -E){
                newSub1 = change(subblock1, 1);
                newSub0 = change(subblock0, 0);
                //console.log("newSub1"+newSub1);
                //console.log("newSub0"+newSub0);
                bright0 = average(newSub0);
                bright1 = average(newSub1);
                //console.log("bright00"+bright0);
                //console.log("bright11"+bright1);
                newSub1 = change(subblock1, 1);
                newSub0 = change(subblock0, 0);
                var s0 = 0;
                var s1 = 0;
                for (var x = 0; x < 8; x++) {
                    for (var y = 0; y < 8; y++) {
                        var m = mask[x][y];
                        if (m === 0) {
                              newPixelBlock[x][y]=newSub0[s0];
                               s0++;
                        } else if (m === 1) {
                            newPixelBlock[x][y]=newSub1[s1];
                               //newPixelBlock[p].push(v);
                            //console.log(newPixelBlock);
                               s1++;
                        }
                    }
                }
                //return newPixelBlock;
            }
            break;
        case 1:
            var s0 = 0;
            var s1 = 0;
            if(bright0-bright1 >= E){
                newPixelBlock = pixelBlock;
            }
            else if(bright0-bright1 < E) {
                newSub1 = change(subblock1, 1);
                newSub0 = change(subblock0, 0);
                for (var x = 0; x< 8; x++) {
                    for (var y = 0; y < 8; y++) {
                        var m = mask[x][y];
                        if (m === 0) {
                            v = newSub0[s0];
                            newPixelBlock[x][y]=newSub0[s0];
                            s0++;
                        } else if (m === 1) {
                            v = newSub1[s1];
                            newPixelBlock[x][y]=newSub1[s1];
                            s1++;
                        }
                    }
                }
            }
            break;
    }
    console.log("new"+newPixelBlock);
    return newPixelBlock;
}
function encode(img, msg, color, seed, E, filename) {
    Jimp.read(img)
        .then(image=>{
            var resImg = new Jimp(image.getWidth(), image.getHeight());
            var lengthMsg = bits.createBitsForTextLength(msg);
            msg = bits.stringToBits(msg);
            var i =0;
            var j =0;
            var iN = 0;
            var jN = 0;
            var mask=[[],[],[],[],[],[],[],[]];
            var pixelBlock=[[],[],[],[],[],[],[],[]];
            var newBlock = [[]];
            var ll=0;
            var lm=0;
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

            for(var n = 0; n<image.getHeight(); n+=8){
                for(var m = 0; m<image.getWidth();m+=8){
                    var p = 0 ;
                    i = n;
                    j = m;
                    iN = n;
                    jN = m;
                    ////////////////////////////
                    if(ll<lengthMsg.length){
                        while (i<n+8) {
                            console.log("n:" + n);
                            console.log("m:" + m);
                            //for(var x = 0; x < 8; x++){
                                while (j < m + 8) {
                                    var col = 0;
                                    var pixel = Jimp.intToRGBA(image.getPixelColor(i, j));
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
                                    //var pixel = Jimp.intToRGBA(image.getPixelColor(i,j));
                                   // console.log("i:" + i);
                                   // console.log("j:" + j);
                                    pixelBlock[p].push(col);
                                    j++;
                                }
                           // }
                            p++;
                            i++;
                            j = m;
                        }i = n;

                        newBlock = doEncode(mask, pixelBlock, lengthMsg[ll], E);
                        console.log(newBlock);
                        if(newBlock===pixelBlock){
                            console.log("iN:" + iN);
                            console.log("jN:" + jN);
                            while(iN<n+8){
                                while (jN < m+8){
                                    var col = 0;
                                    var pixel = Jimp.intToRGBA(image.getPixelColor(iN, jN));
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
                                    resImg.setPixelColor(image.getPixelColor(iN, jN), iN, jN);
                                    jN++;
                                }iN++;
                                jN = m;
                            }iN = n;
                        } else if(newBlock!==pixelBlock){
                            console.log("iN - newBlock:" + iN);
                            console.log("jN - newBlock:" + jN);
                            var xN = 0;
                            var yN = 0;
                            while(iN<n+8 && xN < 8 ){
                                while (jN < m+8 && yN < 8){
                                    var col = 0;
                                    var pixel = Jimp.intToRGBA(image.getPixelColor(iN, jN));
                                    var  r = pixel.r;
                                    var  g = pixel.g;
                                    var  b = pixel.b;
                                    var  a = pixel.a;
                                    switch (color) {
                                        case 0:
                                            console.log("newBlock[iN][jN] "+newBlock[xN][yN]);
                                            resImg.setPixelColor(Jimp.rgbaToInt(newBlock[xN][yN], g, b, a), iN, jN);
                                            break;
                                        case 1:
                                            resImg.setPixelColor(Jimp.rgbaToInt(r, newBlock[iN][jN], b, a), iN, jN);
                                            break;
                                        case 2:
                                            resImg.setPixelColor(Jimp.rgbaToInt(r, g, newBlock[iN][jN], a), iN, jN);
                                            break;
                                    }
                                    yN++;
                                    jN++;
                                }iN++;
                                xN++;
                                jN = m;
                            }iN = n;
                        }
                        ll++;
                        pixelBlock = [[],[],[],[],[],[],[],[]];
                    }
                    else if(ll>=lengthMsg.length && lm<msg.length){
                        while (i<n+8){
                            while(j<m+8){
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

                                //console.log("i:"+i);
                                //console.log("j:"+j);
                                pixelBlock[p].push(col);
                                j++;
                            }
                            p++;
                            i++;
                            j=m;
                        }
                        newPixelBlock = doEncode(mask, pixelBlock, msg[lm], E);
                        console.log(newPixelBlock);
                        i = n;
                        if(newBlock===pixelBlock){
                            console.log("iN :" + iN);
                            console.log("jN :" + jN);
                            while(iN<n+8){
                                while (jN < m+8){
                                    var col = 0;
                                    var pixel = Jimp.intToRGBA(image.getPixelColor(iN, jN));
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
                                    resImg.setPixelColor(image.getPixelColor(iN, jN), iN, jN);
                                    jN++;
                                }iN++;
                                yN=0;
                                jN = m;
                            }iN = n;
                        } else if(newBlock!==pixelBlock){
                            console.log("iN - newBlock:" + iN);
                            console.log("jN - newBlock:" + jN);
                            var xN = 0;
                            var yN = 0;
                            while(iN<n+8 || xN < 8){
                                while (jN < m+8 || yN<8){
                                    var col = 0;
                                    var pixel = Jimp.intToRGBA(image.getPixelColor(iN, jN));
                                    var  r = pixel.r;
                                    var  g = pixel.g;
                                    var  b = pixel.b;
                                    var  a = pixel.a;
                                    switch (color) {
                                        case 0:
                                            console.log("newBlock[iN][jN] "+newBlock[xN][yN]);
                                            resImg.setPixelColor(Jimp.rgbaToInt(newBlock[xN][yN], g, b, a), iN, jN);
                                            break;
                                        case 1:
                                            resImg.setPixelColor(Jimp.rgbaToInt(r, newBlock[iN][jN], b, a), iN, jN);
                                            break;
                                        case 2:
                                            resImg.setPixelColor(Jimp.rgbaToInt(r, g, newBlock[iN][jN], a), iN, jN);
                                            break;
                                    }
                                    yN++;
                                    jN++;
                                }xN++;
                                iN++;
                                yN = 0;
                                jN = m;
                            }iN = n;
                        }
                        //j= b;
                        lm++;
                        pixelBlock = [[],[],[],[],[],[],[],[]];
                    } else resImg.setPixelColor(image.getPixelColor(n,m), n, m);

                    ////////////////////////////
                }
            }
            var file = pathDownload + filename;
            console.log(file);
            resImg.write(file, function (err) {
                if(err) throw err;
                console.log("success encoded");
            });
        })
            .catch(err=>{
                throw err;
            })
}
module.exports = {
    encode:encode
}
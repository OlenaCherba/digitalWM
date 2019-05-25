var Jimp = require('jimp');
var pathDownload = 'public/download/';
var fs = require('fs');
var bits = require('./bits');
var random = require('random');
var seedrandom = require('seedrandom');

function average(subblock) {
    var mean = 0;
    for(var i = 0; i < subblock.length; i++){
        mean += subblock[i];
    }
    return  Math.round(mean/subblock.length);
}

function change(block, id, E, diff) {
    console.log("diff: "+diff);
    if(diff===0) {
        diff = E;
    }
    var k1 = diff;
    var k2 = diff;
    var newBlock = block;
    if(id === 0){
        for(var i = 0; i<newBlock.length; i++){
            if(newBlock[i]>=255-k1){
                newBlock[i]=newBlock[i];
            } else newBlock[i]+=k1;
        }

    } else if(id === 1){
        for(var i = 0; i < newBlock.length; i++){
            if(newBlock[i]<=k2){
                newBlock[i]=newBlock[i];
            } else newBlock[i] -= k2;
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

                var diff = Math.abs(bright0-bright1);
                while(bright0-bright1>-E){
                    newSub1 = change(subblock1, 0, E, diff);
                    newSub0 = change(subblock0, 1, E, diff);
                    console.log("newSub1"+newSub1);
                    console.log("newSub0"+newSub0);
                    bright0 = average(newSub0);
                    bright1 = average(newSub1);
                }
                /*newSub1 = change(subblock1, 0, E, diff);
                //newSub0 = subblock0;
                newSub0 = change(subblock0, 1, E, diff);
                console.log("newSub1"+newSub1);
                console.log("newSub0"+newSub0);
                bright0 = average(newSub0);
                bright1 = average(newSub1);*/
                /*if(bright0-bright1 > -E){
                    var diff = Math.abs(bright0-bright1);
                    newSub1 = change(subblock1, 0, E, diff);
                    //newSub0 = subblock0;
                    newSub0 = change(subblock0, 1, E, diff);
                }*/
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
                               s1++;
                        }
                    }
                }

                //return newPixelBlock;
            }
            console.log("bright0"+bright0);
            console.log("bright1"+bright1);
            break;
        case 1:
            var s0 = 0;
            var s1 = 0;
            if(bright0-bright1 >= E){
                newPixelBlock = pixelBlock;
            }
            else if(bright0-bright1 < E) {
                var diff = Math.abs(bright0-bright1);
                while(bright0-bright1< E){
                    newSub1 = change(subblock1, 1, E, diff);
                    newSub0 = change(subblock0, 0, E, diff);
                    console.log("newSub1"+newSub1);
                    console.log("newSub0"+newSub0);
                    bright0 = average(newSub0);
                    bright1 = average(newSub1);
                }
                /*newSub1 = change(subblock1, 1, E, diff);
                //newSub1 = subblock1;
                newSub0 = change(subblock0, 0, E, diff);
                console.log("newSub1"+newSub1);
                console.log("newSub0"+newSub0);
                bright0 = average(newSub0);
                bright1 = average(newSub1);
                if(bright0-bright1 < E){
                    var diff = Math.abs(bright0-bright1);
                    //newSub1 = subblock1;
                    newSub1 = change(subblock1, 1, E, diff);
                    newSub0 = change(subblock0, 0, E, diff);
                }*/
                for (var x = 0; x< 8; x++) {
                    for (var y = 0; y < 8; y++) {
                        var m = mask[x][y];
                        if (m === 0) {
                            newPixelBlock[x][y]=newSub0[s0];
                            s0++;
                        } else if (m === 1) {
                            newPixelBlock[x][y]=newSub1[s1];
                            s1++;
                        }
                    }
                }
            }
            console.log("bright0"+bright0);
            console.log("bright1"+bright1);
            break;
    }
    console.log(newPixelBlock);
    return newPixelBlock;
}
function encode(img, msg, color, seed, E, filename, cb) {
    Jimp.read(img)
        .then(image=>{
            //var resImg = new Jimp(image.getWidth(), image.getHeight());
            var lengthMsg = bits.createBitsForTextLength(msg);
            msg = bits.stringToBits(msg);
            var Ebits= bits.stringToBits(E);
            console.log("msg: "+msg);
            var iN = 0;
            var jN = 0;
            var mask=[[],[],[],[],[],[],[],[]];
            var pixelBlock=[[],[],[],[],[],[],[],[]];
            var newBlock = [[]];
            var ll=0;
            var lm=0;
            //random.use(seedrandom(20));
            var rng = random.clone(seedrandom(seed));
            rng.patch();
            //Создание маски. блок 8х8
            for(var k = 0; k<8;k++){
                for(var l = 0; l<8;l++){
                    mask[k][l] =  rng.int(0,1);
                }
            }
            console.log(mask);

            outer: for(var n = 0; n<image.getWidth(); n+=8){
                for(var m = 0; m<image.getHeight();m+=8){
                    var p = 0 ;
                    iN = n;
                    jN = m;
                    ////////////////////////////
                    if(ll<lengthMsg.length){
                        for(var i = n; i< n+8; i++){
                            for(var j = m; j < m+8; j++){
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
                                pixelBlock[p].push(col);
                            }
                            p++;
                        }

                        newBlock = doEncode(mask, pixelBlock, lengthMsg[ll], E);
                        if(newBlock===pixelBlock){
                            for(var i = n; i< n+8; i++){
                                for(var j = m; j < m+8; j++){
                                    image.setPixelColor(image.getPixelColor(i, j), i, j);
                                }
                            }

                        } else if(newBlock!==pixelBlock){
                            var xN = 0;
                            var yN = 0;
                            for(var i = n; i< n+8; i++){
                                for(var j = m; j < m+8; j++){
                                    var col = 0;
                                    var pixel = Jimp.intToRGBA(image.getPixelColor(i, j));
                                    var  r = pixel.r;
                                    var  g = pixel.g;
                                    var  b = pixel.b;
                                    var  a = pixel.a;
                                    switch (color) {
                                        case 0:
                                            image.setPixelColor(Jimp.rgbaToInt(newBlock[xN][yN], g, b, a), i, j);
                                            yN++;
                                            break;
                                        case 1:
                                            image.setPixelColor(Jimp.rgbaToInt(r, newBlock[xN][yN], b, a), i, j);
                                            yN++;
                                            break;
                                        case 2:
                                            image.setPixelColor(Jimp.rgbaToInt(r, g, newBlock[xN][yN], a), i, j);
                                            yN++;
                                            break;
                                    }

                                }
                                yN=0;
                                xN++;
                            }
                        }
                        ll++;
                        pixelBlock = [[],[],[],[],[],[],[],[]];
                    }
                    else if(ll>=lengthMsg.length && lm<msg.length){
                        for(var i = n; i< n+8; i++){
                            for(var j = m; j < m+8; j++){
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
                                pixelBlock[p].push(col);
                            }
                            p++;
                        }
                        newBlock = doEncode(mask, pixelBlock, msg[lm], E);
                        if(newBlock===pixelBlock){
                            for(var i = n; i< n+8; i++){
                                for(var j = m; j < m+8; j++){
                                    image.setPixelColor(image.getPixelColor(i, j), i, j);
                                }
                            }
                        } else if(newBlock!==pixelBlock){
                            var xN = 0;
                            var yN = 0;
                            for(var i = n; i< n+8; i++){
                                for(var j = m; j < m+8; j++){
                                    var col = 0;
                                    var pixel = Jimp.intToRGBA(image.getPixelColor(i, j));
                                    var  r = pixel.r;
                                    var  g = pixel.g;
                                    var  b = pixel.b;
                                    var  a = pixel.a;
                                    switch (color) {
                                        case 0:
                                            image.setPixelColor(Jimp.rgbaToInt(newBlock[xN][yN], g, b, a), i, j);
                                            yN++;
                                            break;
                                        case 1:
                                            image.setPixelColor(Jimp.rgbaToInt(r, newBlock[xN][yN], b, a), i, j);
                                            yN++;
                                            break;
                                        case 2:
                                            image.setPixelColor(Jimp.rgbaToInt(r, g, newBlock[xN][yN], a), i, j);
                                            yN++;
                                            break;
                                    }
                                }
                                yN=0;
                                xN++;
                            }
                        }
                        lm++;
                        pixelBlock = [[],[],[],[],[],[],[],[]];
                    } else {
                        break outer;
                    }
                }
            }

            var file = pathDownload + filename;
            console.log(file);
            image.write(file, function (err) {
                if(err) throw err;
                console.log("success encoded");
            });
            cb();
        })
        .catch(err=>{
            throw err;
        })
}

function  checkValue(mask, pixelBlock, E) {
    var subblock0 = [];
    var subblock1 = [];
    var l0 = 0;
    var l1 = 0;
    var bright0 = 0;
    var bright1 = 0;
    var v;
   // console.log(pixelBlock);
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
    //console.log("block0="+subblock0);
    //console.log("block1="+subblock1);
    bright0 = average(subblock0);
    bright1 = average(subblock1);
    //console.log("bright0"+bright0);
    //console.log("bright1"+bright1);

    if(bright0-bright1 >= E){
        v = 1;
    } else if (bright0-bright1 < E){
        v = 0;
    } else if(bright0-bright1 <= -E){
        v = 0;
    } else if (bright0-bright1 > -E) {
        v = 0;
    }else return;

    console.log("v: "+v);
    return v;
}

function decode(img, color, seed, E, cb) {
    Jimp.read(img)
        .then(image=>{
            var resultString='';
            var stegotext = [];
            var length = [];
            var index=0;
            var intLength;
            var l =0;

            var iN = 0;
            var jN = 0;
            var mask=[[],[],[],[],[],[],[],[]];
            var pixelBlock=[[],[],[],[],[],[],[],[]];
            //var newBlock = [[]];
            var ll=0;
            var lm=0;

            //random.use(seedrandom(20));
            var rng = random.clone(seedrandom(seed));
            rng.patch();
            //Создание маски. блок 8х8
            for(var k = 0; k<8;k++){
                for(var t = 0; t<8;t++){
                    mask[k][t] =  rng.int(0,1);
                }
            }
            console.log(mask);

            for(var n = 0; n<image.getWidth(); n+=8){
                for(var m = 0; m<image.getHeight();m+=8){
                    var p = 0 ;
                    iN = n;
                    jN = m;
                    ////////////////////////////
                    for(var i = n; i< n+8; i++){
                        for(var j = m; j < m+8; j++){
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
                            pixelBlock[p].push(col);
                        }
                        p++;
                    }
                    if(l<32){
                        //console.log("i: "+ i);
                        //console.log("j: "+ j);
                        length[l]=checkValue(mask, pixelBlock, E);
                        console.log(length);
                        l++;
                    }
                    else if(l === 32) {
                        //console.log("i: "+ i);
                        //console.log("j: "+ j);
                        intLength= bits.lengthToInt(length);
                        //console.log("intLeng: "+ intLength);
                        if(index < intLength){
                            stegotext[index]=checkValue(mask, pixelBlock, E);
                           // console.log("stego: "+stegotext);
                            index++;
                        }
                        else if(index === intLength) {
                            resultString = bits.bitsToString(stegotext);
                            break;
                        }
                    }
                    pixelBlock = [[],[],[],[],[],[],[],[]];

                }
                ////////////////////////////
            }
            console.log("decoded: "+ resultString);
            fs.writeFile(pathDownload+'decrypt.txt', resultString.slice(0, bits.size(length)), function (err) {
                if(err) throw err;
                console.log("success");
            });

            //return resultString.slice(0, bits.size(length));
            cb(resultString);


        })
        .catch(err=>{
            throw err;
        })
}

module.exports = {
    encode:encode,
    decode: decode,
}
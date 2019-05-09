var spaceCode = ' '.charCodeAt(0);

function stringToBits(str) {
    var bits = [];
    if(str !== undefined){
        for(var i = 0, l = str.length; i<l; i++){
            var character = str[i];
            var number = str.charCodeAt(i);

            console.log(number);
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

function test(channel) {
    return channel;
}
function encode(channel, stegotext, key) {
    var fn= function index(n) {
        n +=3;
        return n;
    };
    var i = 0;
    var channelLength = channel.length;
    console.log("channelLength: "+channelLength);
    var textLength;
    var index;
    var k = key;

    console.log("k: "+k);
    textLength = stegotext.length;
    console.log("textLength: "+textLength);
    stegotext = stringToBits(stegotext);
    console.log("stringToBits(stegotext): "+stegotext);

    // кодировка первых 32 битов длиной сообщения.lengthString - длина сообщения
    var lengthString = '';
    lengthString += String.fromCharCode((textLength >> 32) & 255);
    lengthString += String.fromCharCode((textLength >> 24) & 255);
    lengthString += String.fromCharCode((textLength >> 16) & 255);
    lengthString += String.fromCharCode((textLength >>  8) & 255);
    lengthString = stringToBits(lengthString);
    console.log("stringToBits(lengthString)"+lengthString);

    function unload(data) {
        var length = data.length;
        console.log("data.length: "+length);
        var j = 0;
        //********
        /*if(start!==null){index = start;}
        else {
            index = fn(k);
            console.log("index: "+index);
        }*/
        //Запись сообщения. пока существуют значения изображения и внедряемой информации.
        while (i < channelLength && j < length) {
            index = fn(k);
            if (index < 0) {
                break;
            }
            channel[index] = (channel[index] & 254) + (data[j] ? 1 : 0);
           // index = fn(k);
            k = index;
            i += 1;
            j += 1;
        }
        console.log("index: "+index);
        console.log("K: "+index);
    }
    unload(lengthString);
    unload(stegotext);

    return channel;
}

function decode(channel, key, start) {
    var fn = function index(n) {
        n +=3;
        return n
    };

    var i = 0;
    var l = 0;
    var stegotext = [];
    var length = [];
    var index;
    var k = key;
    var lengthIndex;
    var lengthKey= key-3;

    //определение длины сообщения
    for (var n = 0; n < 32; n += 1) {
        lengthIndex = fn(lengthKey);
        length[n] = (channel[fn(lengthIndex)] & 1) ? 1 : 0;
        lengthKey = lengthIndex;
    }
    console.log("bit length: "+length);
    length = bitsToString(length);
    l += length.charCodeAt(0) << 32;
    console.log(l);
    l += length.charCodeAt(1) << 24;
    l += length.charCodeAt(2) << 16;
    l += length.charCodeAt(3) << 8;
    l = Math.min(l * 8, channel.length);

    console.log("l: "+l);
    index = start;
    while (i < l+32) {
        index = fn(k);
        if (index < 0) break;
        stegotext[i] = (channel[index] & 1) ? 1 : 0;
        //index = fn(k);
        i += 1;
        k = index;
    }
    var resultString = bitsToString(stegotext);

   return resultString.slice(3);
}

module.exports = {
    encode: encode
    , decode: decode
    , bitsToString: bitsToString
    , stringToBits: stringToBits
    , test : test
};

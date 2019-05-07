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


function encode(channel, stegotext, fn) {
    fn= fn || function index(n) { return n };

    var i = 0;
    var channelLength = channel.length;
    console.log("channelLength: "+channelLength);
    var textLength;
    var index;

    textLength = stegotext.length;
    console.log("textLength: "+textLength);
    stegotext = stringToBits(stegotext);
    console.log("stringToBits(stegotext): "+stegotext);
    // Encode length into the first 32 bytes
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

        //пока существуют значения изображения и внедряемой информации
        while (i < channelLength && j < length) {

            index = fn(i);
            if (index < 0) {
                break;
            }
            channel[index] = (channel[index] & 254) + (data[j] ? 1 : 0);
            i += 1;
            j += 1;
        }
    }

    unload(lengthString);
    unload(stegotext);

    return channel
}

function decode(channel, fn) {
    fn = fn || function index(n) { return n }

    var i = 0
        , l = 0
        , stegotext = []
        , length = []
        , index

    for (var n = 0; n < 32; n += 1) {
        length[n] = (channel[fn(n)] & 1) ? 1 : 0
    }
    length = bitsToString(length)

    l += length.charCodeAt(0) << 32
    l += length.charCodeAt(1) << 24
    l += length.charCodeAt(2) << 16
    l += length.charCodeAt(3) << 8
    l = Math.min(l * 8, channel.length)

    while (i < l) {
        index = fn(i + 32)
        if (index < 0) break
        stegotext[i] = (channel[index] & 1) ? 1 : 0
        i += 1
    }

    return bitsToString(stegotext)
}

module.exports = {
    encode: encode
    , decode: decode
    , bitsToString: bitsToString
    , stringToBits: stringToBits
}

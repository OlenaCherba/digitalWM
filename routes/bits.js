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

module.exports = {
    stringToBits: stringToBits,
    bitsToString: bitsToString,
    createBitsForTextLength: createBitsForTextLength,
    lengthToInt: lengthToInt,
    size:size
}
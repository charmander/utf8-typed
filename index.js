'use strict';

var REPLACEMENT_CHARACTER = 0xfffd;
var REPLACEMENT_CHARACTER_1 = '\ufffd';
var REPLACEMENT_CHARACTER_3 = '\ufffd\ufffd\ufffd';

// Taken from https://mths.be/punycode
function utf16Decode(string) {
	var output = [];
	var counter = 0;
	while (counter < string.length) {
		var value = string.charCodeAt(counter++);
		if (value >= 0xd800 && value <= 0xdbff && counter < string.length) {
			// high surrogate, and there is a next character
			var extra = string.charCodeAt(counter);
			if ((extra & 0xfc00) === 0xdc00) { // low surrogate
				output.push(((value & 0x3ff) << 10) + (extra & 0x3ff) + 0x10000);
				counter++;
			} else {
				// unmatched surrogate; only append this code unit, in case the next
				// code unit is the high surrogate of a surrogate pair
				output.push(value);
			}
		} else {
			output.push(value);
		}
	}
	return output;
}

function utf16Encode(value) {
	value -= 0x10000;
	return String.fromCharCode(value >>> 10 & 0x3ff | 0xd800) + String.fromCharCode(0xdc00 | value & 0x3ff);
}

function checkScalarValue(codePoint) {
	return codePoint < 0xd800 || codePoint > 0xdfff;
}

function createByte(codePoint, shift) {
	return ((codePoint >> shift) & 0x3f) | 0x80;
}

function getUtf8Length(codePoint) {
	if ((codePoint & 0xffffff80) === 0) {
		return 1;
	} else if ((codePoint & 0xfffff800) === 0) {
		return 2;
	} else if ((codePoint & 0xffff0000) === 0) {
		return 3;
	} else {
		return 4;
	}
}

function encodeCodePoint(buffer, index, codePoint) {
	if ((codePoint & 0xffffff80) === 0) { // 1-byte sequence
		buffer[index] = codePoint;
		return 1;
	}

	var length;

	if ((codePoint & 0xfffff800) === 0) { // 2-byte sequence
		length = 2;
		buffer[index++] = ((codePoint >> 6) & 0x1f) | 0xc0;
	} else if ((codePoint & 0xffff0000) === 0) { // 3-byte sequence
		length = 3;

		if (!checkScalarValue(codePoint)) {
			codePoint = REPLACEMENT_CHARACTER;
		}

		buffer[index++] = ((codePoint >> 12) & 0x0f) | 0xe0;
		buffer[index++] = createByte(codePoint, 6);
	} else { // 4-byte sequence
		length = 4;
		buffer[index++] = ((codePoint >> 18) & 0x07) | 0xf0;
		buffer[index++] = createByte(codePoint, 12);
		buffer[index++] = createByte(codePoint, 6);
	}
	buffer[index] = (codePoint & 0x3f) | 0x80;
	return length;
}

function utf8Encode(string) {
	var codePoints = utf16Decode(string);
	var utf8Length = 0;
	var i;

	for (i = 0; i < codePoints.length; i++) {
		utf8Length += getUtf8Length(codePoints[i]);
	}

	var encoded = new Uint8Array(utf8Length);
	var offset = 0;

	for (i = 0; i < codePoints.length; i++) {
		offset += encodeCodePoint(encoded, offset, codePoints[i]);
	}

	return encoded;
}

function isContinuation(byte) {
	return (byte & 0xc0) === 0x80;
}

function utf8Decode(byteArray) {
	var l = byteArray.length;
	var result = '';

	for (var i = 0; i < l; i++) {
		var c = byteArray[i];
		var c2;
		var c3;
		var c4;

		if (c < 0x80) {
			result += String.fromCharCode(c);
		} else if ((c & 0xe0) === 0xc0) {
			// 2-byte sequence
			if (c < (0xc0 | 2)) {
				result += REPLACEMENT_CHARACTER_1;
				continue;
			}

			if (i + 1 === l) {
				return result + REPLACEMENT_CHARACTER_1;
			}
			c2 = byteArray[i + 1];
			if (!isContinuation(c2)) {
				result += REPLACEMENT_CHARACTER_1;
				continue;
			}
			i++;

			result += String.fromCharCode((c & 0x1f) << 6 | (c2 & 0x3f));
		} else if ((c & 0xf0) === 0xe0) {
			// 3-byte sequence
			if (i + 1 === l) {
				return result + REPLACEMENT_CHARACTER_1;
			}
			c2 = byteArray[i + 1];
			if (!isContinuation(c2) || (c === 0xe0 && c2 < (0x80 | 0x20))) {
				result += REPLACEMENT_CHARACTER_1;
				continue;
			}
			i++;

			if (i + 1 === l) {
				return result + REPLACEMENT_CHARACTER_1;
			}
			c3 = byteArray[i + 1];
			if (!isContinuation(c3)) {
				result += REPLACEMENT_CHARACTER_1;
				continue;
			}
			i++;

			var codePoint = (c & 0x0f) << 12 | (c2 & 0x3f) << 6 | (c3 & 0x3f);

			if (!checkScalarValue(codePoint)) {
				result += REPLACEMENT_CHARACTER_3;
				continue;
			}

			result += codePoint >= 0x10000 ?
				utf16Encode(codePoint) :
				String.fromCharCode(codePoint);
		} else if ((c & 0xf8) === 0xf0) {
			// 4-byte sequence
			if (i + 1 === l) {
				return result + REPLACEMENT_CHARACTER_1;
			}
			c2 = byteArray[i + 1];
			if (!isContinuation(c2) || (c === 0xf0 && c2 < (0x80 | 0x10))) {
				result += REPLACEMENT_CHARACTER_1;
				continue;
			}
			i++;

			if (i + 1 === l) {
				return result + REPLACEMENT_CHARACTER_1;
			}
			c3 = byteArray[i + 1];
			if (!isContinuation(c3)) {
				result += REPLACEMENT_CHARACTER_1;
				continue;
			}
			i++;

			if (i + 1 === l) {
				return result + REPLACEMENT_CHARACTER_1;
			}
			c4 = byteArray[i + 1];
			if (!isContinuation(c4)) {
				result += REPLACEMENT_CHARACTER_1;
				continue;
			}
			i++;

			result += utf16Encode((c & 0x07) << 18 | (c2 & 0x3f) << 12 | (c3 & 0x3f) << 6 | (c4 & 0x3f));
		} else {
			result += REPLACEMENT_CHARACTER_1;
		}
	}

	return result;
}

exports.encode = utf8Encode;
exports.decode = utf8Decode;

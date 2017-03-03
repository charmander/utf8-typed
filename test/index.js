'use strict';

var assert = require('assert');

var utf8 = require('../');

var runExtendedTests = process.argv[2] === '--extended';

function same(a, b) {
	if (!(a instanceof Uint8Array) || !(b instanceof Uint8Array) || a.length !== b.length) {
		return false;
	}

	for (var i = 0; i < a.length; i++) {
		if (a[i] !== b[i]) {
			return false;
		}
	}

	return true;
}

function assertSame(a, b, message) {
	if (!same(a, b)) {
		assert.fail(a, b, message, 'same as');
	}
}

var data = [
	// 1-byte
	{
		'codePoint': 0x0000,
		'decoded': '\0',
		'encoded': [0]
	},
	{
		'codePoint': 0x005C,
		'decoded': '\x5C',
		'encoded': [0x5C]
	},
	{
		'codePoint': 0x007F,
		'decoded': '\x7F',
		'encoded': [0x7F]
	},

	// 2-byte
	{
		'codePoint': 0x0080,
		'decoded': '\x80',
		'encoded': [0xC2, 0x80]
	},
	{
		'codePoint': 0x05CA,
		'decoded': '\u05CA',
		'encoded': [0xD7, 0x8A]
	},
	{
		'codePoint': 0x07FF,
		'decoded': '\u07FF',
		'encoded': [0xDF, 0xBF],
	},

	// 3-byte
	{
		'codePoint': 0x0800,
		'decoded': '\u0800',
		'encoded': [0xE0, 0xA0, 0x80],
	},
	{
		'codePoint': 0x2C3C,
		'decoded': '\u2C3C',
		'encoded': [0xE2, 0xB0, 0xBC]
	},
	{
		'codePoint': 0xFFFF,
		'decoded': '\uFFFF',
		'encoded': [0xEF, 0xBF, 0xBF]
	},
	// unmatched surrogate halves
	// high surrogates: 0xD800 to 0xDBFF
	{
		'codePoint': 0xD800,
		'decoded': '\uD800',
		'encoded': [0xEF, 0xBF, 0xBD],
		'error': true
	},
	{
		'description': 'High surrogate followed by another high surrogate',
		'decoded': '\uD800\uD800',
		'encoded': [0xEF, 0xBF, 0xBD, 0xEF, 0xBF, 0xBD],
		'error': true
	},
	{
		'description': 'High surrogate followed by a symbol that is not a surrogate',
		'decoded': '\uD800A',
		'encoded': [0xEF, 0xBF, 0xBD, 0x41],
		'error': true
	},
	{
		'description': 'Unmatched high surrogate, followed by a surrogate pair, followed by an unmatched high surrogate',
		'decoded': '\uD800\uD834\uDF06\uD800',
		'encoded': [0xEF, 0xBF, 0xBD, 0xF0, 0x9D, 0x8C, 0x86, 0xEF, 0xBF, 0xBD],
		'error': true
	},
	{
		'codePoint': 0xD9AF,
		'decoded': '\uD9AF',
		'encoded': [0xEF, 0xBF, 0xBD],
		'error': true
	},
	{
		'codePoint': 0xDBFF,
		'decoded': '\uDBFF',
		'encoded': [0xEF, 0xBF, 0xBD],
		'error': true
	},
	// low surrogates: 0xDC00 to 0xDFFF
	{
		'codePoint': 0xDC00,
		'decoded': '\uDC00',
		'encoded': [0xEF, 0xBF, 0xBD],
		'error': true
	},
	{
		'description': 'Low surrogate followed by another low surrogate',
		'decoded': '\uDC00\uDC00',
		'encoded': [0xEF, 0xBF, 0xBD, 0xEF, 0xBF, 0xBD],
		'error': true
	},
	{
		'description': 'Low surrogate followed by a symbol that is not a surrogate',
		'decoded': '\uDC00A',
		'encoded': [0xEF, 0xBF, 0xBD, 0x41],
		'error': true
	},
	{
		'description': 'Unmatched low surrogate, followed by a surrogate pair, followed by an unmatched low surrogate',
		'decoded': '\uDC00\uD834\uDF06\uDC00',
		'encoded': [0xEF, 0xBF, 0xBD, 0xF0, 0x9D, 0x8C, 0x86, 0xEF, 0xBF, 0xBD],
		'error': true
	},
	{
		'codePoint': 0xDEEE,
		'decoded': '\uDEEE',
		'encoded': [0xEF, 0xBF, 0xBD],
		'error': true
	},
	{
		'codePoint': 0xDFFF,
		'decoded': '\uDFFF',
		'encoded': [0xEF, 0xBF, 0xBD],
		'error': true
	},

	// 4-byte
	{
		'codePoint': 0x010000,
		'decoded': '\uD800\uDC00',
		'encoded': [0xF0, 0x90, 0x80, 0x80]
	},
	{
		'codePoint': 0x01D306,
		'decoded': '\uD834\uDF06',
		'encoded': [0xF0, 0x9D, 0x8C, 0x86]
	},
	{
		'codePoint': 0x10FFF,
		'decoded': '\uDBFF\uDFFF',
		'encoded': [0xF4, 0x8F, 0xBF, 0xBF]
	}
];

if (runExtendedTests) {
	data = data.concat(require('./data.json'));
}

var decodingErrors = [
	{
		'encoded': [237, 160, 128],
		'decoded': '���'
	},
	{
		'encoded': [237, 160, 128, 237, 160, 128],
		'decoded': '������'
	},
	{
		'encoded': [237, 160, 128, 65],
		'decoded': '���A'
	},
	{
		'encoded': [237, 160, 128, 240, 157, 140, 134, 237, 160, 128],
		'decoded': '���𝌆���'
	},
	{
		'encoded': [237, 166, 175],
		'decoded': '���'
	},
	{
		'encoded': [237, 175, 191],
		'decoded': '���'
	},
	{
		'encoded': [237, 176, 128],
		'decoded': '���'
	},
	{
		'encoded': [237, 176, 128, 237, 176, 128],
		'decoded': '������'
	},
	{
		'encoded': [237, 176, 128, 65],
		'decoded': '���A'
	},
	{
		'encoded': [237, 176, 128, 240, 157, 140, 134, 237, 176, 128],
		'decoded': '���𝌆���'
	},
	{
		'encoded': [237, 187, 174],
		'decoded': '���'
	},
	{
		'encoded': [237, 191, 191],
		'decoded': '���'
	},
	{
		'encoded': [233, 0, 0],
		'decoded': '�\x00\x00'
	},
	{
		'encoded': [240, 157],
		'decoded': '�'
	}
];

data.forEach(function(object) {
	var description = object.description || 'U+' + object.codePoint.toString(16).toUpperCase();

	assertSame(
		utf8.encode(object.decoded),
		new Uint8Array(object.encoded),
		'Encoding: ' + description
	);

	if (!object.error) {
		assert.strictEqual(
			utf8.decode(new Uint8Array(object.encoded)),
			object.decoded,
			'Decoding: ' + description
		);
	}
});

decodingErrors.forEach(function(object) {
	assert.strictEqual(
		utf8.decode(new Uint8Array(object.encoded)),
		object.decoded,
		object.encoded
	);
});

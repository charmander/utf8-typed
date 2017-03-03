/* global process */
/* eslint global-require: 0 */
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
		codePoint: 0x0000,
		decoded: '\0',
		encoded: [0],
	},
	{
		codePoint: 0x005c,
		decoded: '\x5c',
		encoded: [0x5c],
	},
	{
		codePoint: 0x007f,
		decoded: '\x7f',
		encoded: [0x7f],
	},

	// 2-byte
	{
		codePoint: 0x0080,
		decoded: '\x80',
		encoded: [0xc2, 0x80],
	},
	{
		codePoint: 0x05ca,
		decoded: '\u05ca',
		encoded: [0xd7, 0x8a],
	},
	{
		codePoint: 0x07ff,
		decoded: '\u07ff',
		encoded: [0xdf, 0xbf],
	},

	// 3-byte
	{
		codePoint: 0x0800,
		decoded: '\u0800',
		encoded: [0xe0, 0xa0, 0x80],
	},
	{
		codePoint: 0x2c3c,
		decoded: '\u2c3c',
		encoded: [0xe2, 0xb0, 0xbc],
	},
	{
		codePoint: 0xffff,
		decoded: '\uffff',
		encoded: [0xef, 0xbf, 0xbf],
	},

	// unmatched surrogate halves
	// high surrogates: 0xd800 to 0xdbff
	{
		codePoint: 0xd800,
		decoded: '\ud800',
		encoded: [0xef, 0xbf, 0xbd],
		'error': true,
	},
	{
		'description': 'High surrogate followed by another high surrogate',
		decoded: '\ud800\ud800',
		encoded: [0xef, 0xbf, 0xbd, 0xef, 0xbf, 0xbd],
		'error': true,
	},
	{
		'description': 'High surrogate followed by a symbol that is not a surrogate',
		decoded: '\ud800A',
		encoded: [0xef, 0xbf, 0xbd, 0x41],
		'error': true,
	},
	{
		'description': 'Unmatched high surrogate, followed by a surrogate pair, followed by an unmatched high surrogate',
		decoded: '\ud800\ud834\udf06\ud800',
		encoded: [0xef, 0xbf, 0xbd, 0xf0, 0x9d, 0x8c, 0x86, 0xef, 0xbf, 0xbd],
		'error': true,
	},
	{
		codePoint: 0xd9af,
		decoded: '\ud9af',
		encoded: [0xef, 0xbf, 0xbd],
		'error': true,
	},
	{
		codePoint: 0xdbff,
		decoded: '\udbff',
		encoded: [0xef, 0xbf, 0xbd],
		'error': true,
	},

	// low surrogates: 0xdc00 to 0xdfff
	{
		codePoint: 0xdc00,
		decoded: '\udc00',
		encoded: [0xef, 0xbf, 0xbd],
		'error': true,
	},
	{
		'description': 'Low surrogate followed by another low surrogate',
		decoded: '\udc00\udc00',
		encoded: [0xef, 0xbf, 0xbd, 0xef, 0xbf, 0xbd],
		'error': true,
	},
	{
		'description': 'Low surrogate followed by a symbol that is not a surrogate',
		decoded: '\udc00A',
		encoded: [0xef, 0xbf, 0xbd, 0x41],
		'error': true,
	},
	{
		'description': 'Unmatched low surrogate, followed by a surrogate pair, followed by an unmatched low surrogate',
		decoded: '\udc00\ud834\udf06\udc00',
		encoded: [0xef, 0xbf, 0xbd, 0xf0, 0x9d, 0x8c, 0x86, 0xef, 0xbf, 0xbd],
		'error': true,
	},
	{
		codePoint: 0xdeee,
		decoded: '\udeee',
		encoded: [0xef, 0xbf, 0xbd],
		'error': true,
	},
	{
		codePoint: 0xdfff,
		decoded: '\udfff',
		encoded: [0xef, 0xbf, 0xbd],
		'error': true,
	},

	// 4-byte
	{
		codePoint: 0x010000,
		decoded: '\ud800\udc00',
		encoded: [0xf0, 0x90, 0x80, 0x80],
	},
	{
		codePoint: 0x01d306,
		decoded: '\ud834\udf06',
		encoded: [0xf0, 0x9d, 0x8c, 0x86],
	},
	{
		codePoint: 0x10fff,
		decoded: '\udbff\udfff',
		encoded: [0xf4, 0x8f, 0xbf, 0xbf],
	},
];

if (runExtendedTests) {
	data = data.concat(require('./data.json'));
}

var decodingErrors = [
	{
		encoded: [237, 160, 128],
		decoded: '���',
	},
	{
		encoded: [237, 160, 128, 237, 160, 128],
		decoded: '������',
	},
	{
		encoded: [237, 160, 128, 65],
		decoded: '���A',
	},
	{
		encoded: [237, 160, 128, 240, 157, 140, 134, 237, 160, 128],
		decoded: '���𝌆���',
	},
	{
		encoded: [237, 166, 175],
		decoded: '���',
	},
	{
		encoded: [237, 175, 191],
		decoded: '���',
	},
	{
		encoded: [237, 176, 128],
		decoded: '���',
	},
	{
		encoded: [237, 176, 128, 237, 176, 128],
		decoded: '������',
	},
	{
		encoded: [237, 176, 128, 65],
		decoded: '���A',
	},
	{
		encoded: [237, 176, 128, 240, 157, 140, 134, 237, 176, 128],
		decoded: '���𝌆���',
	},
	{
		encoded: [237, 187, 174],
		decoded: '���',
	},
	{
		encoded: [237, 191, 191],
		decoded: '���',
	},
	{
		encoded: [233, 0, 0],
		decoded: '�\x00\x00',
	},
	{
		encoded: [240, 157],
		decoded: '�',
	},
];

data.forEach(function (object) {
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

decodingErrors.forEach(function (object) {
	assert.strictEqual(
		utf8.decode(new Uint8Array(object.encoded)),
		object.decoded,
		object.encoded
	);
});

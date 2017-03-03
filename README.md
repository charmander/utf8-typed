# utf8-typed [![Build status](https://travis-ci.org/charmander/utf8-typed.svg?branch=master)](https://travis-ci.org/charmander/utf8-typed)

_utf8-typed_ is a well-tested UTF-8 encoder/decoder written in JavaScript. Unlike many other JavaScript solutions, it is designed to be a _proper_ UTF-8 encoder/decoder: it can encode/decode any scalar Unicode code point values, as per [the Encoding Standard][standard].

Feel free to fork if you see possible improvements!

## Installation

Via [npm][]:

```shellsession
$ npm install utf8-typed
```

## API

### `utf8.encode(string)`

Encodes any given JavaScript string (`string`) as UTF-8, returning a UTF-8-encoded `Uint8Array`. It replaces non-scalar values (i.e. lone surrogates) with U+FFFD replacement characters.

```js
// U+00A9 COPYRIGHT SIGN; see http://codepoints.net/U+00A9
utf8.encode('\xa9');
// → '\xc2\xa9'
// U+10001 LINEAR B SYLLABLE B038 E; see http://codepoints.net/U+10001
utf8.encode('\ud800\udc01');
// → '\xf0\x90\x80\x81'
```

### `utf8.decode(byteArray)`

Decodes any given UTF-8-encoded `Uint8Array` (`byteArray`) as UTF-8, and returns the UTF-8-decoded version of the string. It replaces malformed UTF-8 with U+FFFD replacement characters.

```js
utf8.decode(new Uint8Array([0xc2, 0xa9]));
// → '\xa9'

utf8.decode(new Uint8Array([0xf0, 0x90, 0x80, 0x81]));
// → '\ud800\udc01'
// → U+10001 LINEAR B SYLLABLE B038 E
```


  [standard]: https://encoding.spec.whatwg.org/#utf-8
  [npm]: https://www.npmjs.com/

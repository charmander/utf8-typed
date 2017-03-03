# utf8.js [![Build status](https://travis-ci.org/charmander/utf8-typed.svg?branch=master)](https://travis-ci.org/charmander/utf8-typed)

_utf8.js_ is a well-tested UTF-8 encoder/decoder written in JavaScript. Unlike many other JavaScript solutions, it is designed to be a _proper_ UTF-8 encoder/decoder: it can encode/decode any scalar Unicode code point values, as per [the Encoding Standard](https://encoding.spec.whatwg.org/#utf-8). [Here’s an online demo.](https://mothereff.in/utf-8)

Feel free to fork if you see possible improvements!

## Installation

Via [npm](https://www.npmjs.com/):

```bash
npm install utf8
```

## API

### `utf8.encode(string)`

Encodes any given JavaScript string (`string`) as UTF-8, and returns the UTF-8-encoded version of the string. It throws an error if the input string contains a non-scalar value, i.e. a lone surrogate. (If you need to be able to encode non-scalar values as well, use [WTF-8](https://mths.be/wtf8) instead.)

```js
// U+00A9 COPYRIGHT SIGN; see http://codepoints.net/U+00A9
utf8.encode('\xA9');
// → '\xC2\xA9'
// U+10001 LINEAR B SYLLABLE B038 E; see http://codepoints.net/U+10001
utf8.encode('\uD800\uDC01');
// → '\xF0\x90\x80\x81'
```

### `utf8.decode(byteString)`

Decodes any given UTF-8-encoded string (`byteString`) as UTF-8, and returns the UTF-8-decoded version of the string. It throws an error when malformed UTF-8 is detected. (If you need to be able to decode encoded non-scalar values as well, use [WTF-8](https://mths.be/wtf8) instead.)

```js
utf8.decode('\xC2\xA9');
// → '\xA9'

utf8.decode('\xF0\x90\x80\x81');
// → '\uD800\uDC01'
// → U+10001 LINEAR B SYLLABLE B038 E
```

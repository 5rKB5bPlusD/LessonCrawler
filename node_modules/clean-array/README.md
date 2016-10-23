# clean-array

[![NPM version][npm-img]][npm-url]
[![License][license-img]][license-url]
[![Build status][travis-img]][travis-url]

Safely remove empty values from an array.

## Installation

```
npm install clean-array
```

## Usage

``` javascript
var cleanArray = require('clean-array')

var arr = [null, undefined, [], {}, '', true, false, 1, 0, 'string']

cleanArray(arr)
// => [true, false, 1, 0, 'string']
```

[npm-img]: https://img.shields.io/npm/v/clean-array.svg?style=flat-square
[npm-url]: https://npmjs.org/package/clean-array
[license-img]: http://img.shields.io/npm/l/clean-array.svg?style=flat-square
[license-url]: LICENSE
[travis-img]: https://img.shields.io/travis/gummesson/clean-array.svg?style=flat-square
[travis-url]: https://travis-ci.org/gummesson/clean-array

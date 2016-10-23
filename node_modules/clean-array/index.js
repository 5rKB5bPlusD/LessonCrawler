/**
 * Dependencies
 */

var isEmptyArray  = require('is-empty-array')
var isEmptyObject = require('is-empty-object')

/**
 * Safely remove empty values from `arr`.
 *
 * @param  {array} arr
 * @return {array}
 *
 * @api public
 */

function cleanArray(arr) {
  var results = arr.filter(function(item) {
    if (isEmptyArray(item) || isEmptyObject(item)) return
    return item || item === 0 || item === false
  })
  return results
}

/**
 * Exports
 */

module.exports = cleanArray

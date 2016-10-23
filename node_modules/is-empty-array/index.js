/**
 * Dependencies
 */

var isArray = Array.isArray

/**
 * Check if `arr` is empty.
 *
 * @param  {array} arr
 * @return {boolean}
 *
 * @api public
 */

function isEmptyArray(arr) {
  if (!arr || !isArray(arr)) return false
  return !arr.length
}

/**
 * Exports
 */

module.exports = isEmptyArray

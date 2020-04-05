/**
 * 
 */

import _ from 'lodash';
Data = {}
/** */
Data.countArra = function (arr,country) {
    var counts = {};
    arr.forEach(function (x) {
        counts[x] = (counts[x] || 0) + 1;
    });
    var counts = _.chain(counts).map((value, key) => ({ [country]: key, counts: value })).value()
    return counts;
}
/**
 * 
 */
Data.mergeArrays = function (arr) {
    var newArr = Array.prototype.concat(...arr);
    return newArr
}
/** */
Data.capitalize = (s) => {
    if (typeof s !== 'string') return ''
    return s.charAt(0).toUpperCase() + s.slice(1)
}
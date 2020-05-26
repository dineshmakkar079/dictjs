/**
 * Removes html tags from a string by matchin regex
 * @param {String} str | String to format
 */
function formatString(str = "") {
    // remove html tags by regex
    return str.replace(/(<\/.*>)/g, '').replace(/(<.*>)/g, '');
}

/**
 * This capitalizes the first letter of the string
 * @param {String} str | String to capitalize
 */
function capitalizeString(str = "") {
    if (!str.length) return str;
    if (str.length === 1) return str.toUpperCase();
    let [first, ...rest] = str;
    return [first.toUpperCase(), ...rest].join("");
}

module.exports = {
    formatString,
    capitalizeString
};
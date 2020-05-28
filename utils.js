/**
 * Removes html tags from a string by matchin regex
 * @param {String} str | String to format
 */
function formatString(str = "") {
    // remove html tags by regex
    return str.replace(/(<\/.*>)/g, '').replace(/(<.*>)/g, '');
}

function convertArrayToString(arr = []) {
    return arr.map((str, index) => {
        return `${index+1}. ${formatString(str)}`
    }).join('\n');
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
    capitalizeString,
    convertArrayToString
};
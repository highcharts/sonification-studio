// Adapted from http://stackoverflow.com/a/1293163/2343
// TODO: Definitely needs tests. Look online for acid tests.
export function parseCSV (strData: string, strDelimiter = ';'): Array<Array<string>> {
    // Create a regular expression to parse the CSV values.
    const objPattern = new RegExp(
        (
            // Delimiters.
            '(\\' + strDelimiter + '|\\r?\\n|\\r|^)' +

            // Quoted fields.
            '(?:"([^"]*(?:""[^"]*)*)"|' +

            // Standard fields.
            '([^"\\' + strDelimiter + '\\r\\n]*))'
        ),
        'gi'
    );

    // Create an array to hold our data. Give the array
    // a default empty first row.
    const arrData: Array<Array<string>> = [[]];

    // Create an array to hold our individual pattern
    // matching groups.
    let arrMatches: RegExpExecArray | null;

    // Keep looping over the regular expression matches
    // until we can no longer find a match.
    while (arrMatches = objPattern.exec(strData)) { // eslint-disable-line

        // Get the delimiter that was found.
        const strMatchedDelimiter = arrMatches[1];

        // Data that starts with a field delimiter starts with an empty field,
        // which the pattern skips: it takes the delimiter as the start of
        // the second field
        if (arrMatches.index === 0 && strMatchedDelimiter === strDelimiter) {
            arrData[0].push('');
        }

        // Check to see if the given delimiter has a length
        // (is not the start of string) and if it matches
        // field delimiter. If id does not, then we know
        // that this delimiter is a row delimiter.
        if (
            strMatchedDelimiter.length &&
            strMatchedDelimiter !== strDelimiter
        ) {

            // Since we have reached a new row of data,
            // add an empty row to our data array.
            arrData.push([]);
        }

        let strMatchedValue;

        // Now that we have our delimiter out of the way,
        // let's check to see which kind of value we
        // captured (quoted or unquoted).
        if (arrMatches[2]) {

            // We found a quoted value. When we capture
            // this value, unescape any double quotes.
            strMatchedValue = arrMatches[2].replace(
                new RegExp('""', 'g'),
                '"'
            );

        } else {
            // We found a non-quoted value.
            strMatchedValue = arrMatches[3];
        }

        // Now that we have our value string, let's add
        // it to the data array.
        arrData[arrData.length - 1].push(strMatchedValue);
    }

    // Return the parsed data.
    return arrData;
}


const utils = exports;

/**
 *
 * @param string
 * @returns {string}
 */
utils.capitalizeFirstLetter = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

/**
 *
 * @param obj
 * @returns {Array}
 */
utils.objToArray = function(obj) {

    let array = [];

    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            array.push({
                key: key,
                obj: obj[key]
            })
        }
    }

    return array;

};

/**
 * creazione dell'array di possibilità partendo dalla classe degli endpoint
 *
 * @returns {Array}
 */
utils.askForEndpoints = function(endpoints_class, stdout) {
    let endpoint_arr = utils.objToArray(endpoints_class.EndPoints);
    let select_endpoint_question = "";
    select_endpoint_question += "Seleziona fra i seguenti gli endpoint con cui fare il web service:\n\n";

    endpoint_arr.forEach((obj, index) => {
        select_endpoint_question += "[" + index + "]" + obj.key + "\n";
    });

    stdout.write(select_endpoint_question + "\n(utilizza i numeri separati da uno spazio):");

    return endpoint_arr;
};

/**
 * ricavo i metodi dagli indici
 *
 * @param index_metodi_arr
 * @param endpoint_arr
 * @returns {Array}
 */
utils.createNameArray = function(index_metodi_arr, endpoint_arr) {
    let nomi_metodi_arr = [];
    index_metodi_arr.forEach((num) => {
        let key = endpoint_arr[parseInt(num)].key.toLowerCase();
        let name = key.split("_")
            .map((str, index) => {
                return (index > 0) ? utils.capitalizeFirstLetter(str) : str
            })
            .join("");
        nomi_metodi_arr.push(name);
    });

    return nomi_metodi_arr;
}
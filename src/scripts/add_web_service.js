#!/usr/bin/env node

require("typescript-require");

let fs = require('fs');
let path = require('path');
let cp = require('child_process');
let stdin = process.stdin;
let stdout = process.stdout;
let endpoints_class = require("./../src/utils/EndPoints");

let re_mtd_1 = /{nome_mtd}/gi;
let re_mtd_2 = /{nome_mtd_u}/gi;
let re_srv_1 = /{nome_srv}/gi;
let re_srv_2 = /{nome_srv_u}/gi;
let endpoint_obj = /{endpoint_obj}/gi;
let http_method = /{http_method}/gi;

const base_path = "./src/services/web/";

  ///////////////////
 ////// UTILS //////
///////////////////

/**
 *
 * @param string
 * @returns {string}
 */
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 *
 * @param nomi_metodi_arr
 * @param text
 * @param result
 * @param endpoint_arr
 * @param index_metodi_arr
 */
function addModifiedText(nomi_metodi_arr, text, result, endpoint_arr, index_metodi_arr) {

    let text_mod;

    nomi_metodi_arr.forEach(function (nome, index) {
        nome = nome.replace('\n', '');
        text_mod = text.replace(re_mtd_1, nome);
        text_mod = text_mod.replace(re_mtd_2, capitalizeFirstLetter(nome));
        text_mod = text_mod.replace(endpoint_obj, "EndPoints." + endpoint_arr[parseInt(index_metodi_arr[index])].key);
        text_mod = text_mod.replace(http_method, endpoint_arr[parseInt(index_metodi_arr[index])].obj.default_method);

        if (text_mod.includes('-->')) {
            result.value += text_mod.replace('-->', '') + "\n";
        }
        else {
            result.value += text_mod + "\n";
        }

    });
}

/**
 * creazione dell'array di possibilità partendo dalla classe degli endpoint
 *
 * @returns {Array}
 */
function askForEndpoints() {
    let endpoint_arr = objToArray(endpoints_class.EndPoints);
    let select_endpoint_question = "";
    select_endpoint_question += "Seleziona fra i seguenti gli endpoint con cui fare il web service:\n\n";

    endpoint_arr.forEach((obj, index) => {
        select_endpoint_question += "[" + index + "]" + obj.key + "\n";
    });

    stdout.write(select_endpoint_question + "\n(utilizza i numeri separati da uno spazio):");

    return endpoint_arr;
}

/**
 * ricavo i metodi dagli indici
 *
 * @param index_metodi_arr
 * @param endpoint_arr
 * @returns {Array}
 */
function createNameArray(index_metodi_arr, endpoint_arr) {
    let nomi_metodi_arr = [];
    index_metodi_arr.forEach((num) => {
        let key = endpoint_arr[parseInt(num)].key.toLowerCase();
        let name = key.split("_")
            .map((str, index) => {
                return (index > 0) ? capitalizeFirstLetter(str) : str
            })
            .join("");
        nomi_metodi_arr.push(name);
    });

    return nomi_metodi_arr;
}

/**
 *
 * @param obj
 * @returns {Array}
 */
function objToArray(obj) {

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

}

  ////////////////////
 ////// SCRIPT //////
////////////////////

stdin.resume();
stdout.write("Nome del service: ");

stdin.once('data', function(data) {
    let nome_classe = data.toString().trim().replace(' ', '').toLowerCase();

    stdin.resume();

    let endpoint_arr = askForEndpoints();

    stdin.once('data', function(data) {

        let index_metodi_arr = data.toString().split(' ');
        let nomi_metodi_arr = createNameArray(index_metodi_arr, endpoint_arr);

        // creo la cartella del service...
        fs.mkdirSync(base_path + nome_classe);

        // e quella dei decorators
        fs.mkdirSync(base_path + nome_classe + "/decorators");

        // popolo il service.template
        let service_template_source = fs.readFileSync('./scripts/templates/service.template.txt', 'utf8');
        let service_template_result = {value: ""};
        let service_template_line_arr;

        service_template_line_arr = service_template_source.split('\n');

        let l = service_template_line_arr.length;
        // Per ogni riga del file service.template.txt ...
        for (let j = 0; j < l; j++) {

            let line = service_template_line_arr[j];
            let line_mod;

            // .... duplica la riga che inizia per --> per ogni metodo richiesto, oppure ...
            if (line.includes('-->')) {
                addModifiedText(nomi_metodi_arr, line, service_template_result, endpoint_arr, index_metodi_arr);
            }
            // ... duplica il blocco chiuso tra </ e /> per ogni metodo richiesto, oppure ...
            else if (line.includes('</')) {

                let i = 1;
                let block = "";

                while (!service_template_line_arr[j + i].includes('/>')) {
                    block += service_template_line_arr[j + i] + "\n";
                    i++;
                }

                addModifiedText(nomi_metodi_arr, block, service_template_result, endpoint_arr, index_metodi_arr);

                j = j + i;
            }
            // ... sostituisci normalmente senza duplicare
            else {
                line_mod = line.replace(re_srv_1, nome_classe);
                line_mod = line_mod.replace(re_srv_2, capitalizeFirstLetter(nome_classe));
                service_template_result.value += line_mod + "\n";
            }
        }

        fs.writeFileSync(base_path +
            nome_classe + '/' + nome_classe + '.service.ts', service_template_result.value, 'utf8');

        // creazione dei file che devono stare dentro a /decorators
        nomi_metodi_arr.forEach((name) => {

            let service_method_signal_template = fs.readFileSync('./scripts/templates/serviceMethodSignalContainer.template.txt', 'utf8');
            service_method_signal_template = service_method_signal_template.replace(re_srv_2, capitalizeFirstLetter(name));

            let service_method_listener_template = fs.readFileSync('./scripts/templates/onServiceMethodListener.template.txt', 'utf8');
            service_method_listener_template = service_method_listener_template.replace(re_srv_2, capitalizeFirstLetter(name));

            fs.writeFileSync(base_path +
                nome_classe + '/decorators/' + capitalizeFirstLetter(name) + 'ServiceMethodSignalContainer.ts',
                service_method_signal_template, 'utf8');
            fs.writeFileSync(base_path +
                nome_classe + '/decorators/' + 'On' + capitalizeFirstLetter(name) + 'ServiceMethodListener.ts',
                service_method_listener_template, 'utf8');
        });

        // alla fine aggiungo i file al worktree di git
        cp.exec('git add ./src/services/web/' + nome_classe);

        process.exit();
    });
});

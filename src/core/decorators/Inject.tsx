import {injector} from "../RegisterService";

export function Inject(arr_services:Array<any>) {

    return (target: Function) => {

        console.log("target", target);
        console.log("target.prototype", target.prototype);

        // save a reference to the original constructor
        let original = target;

        // a utility function to generate instances of a class
        function construct(constructor, args) {
            let c: any = function () {
                return constructor.apply(this, args);
            };
            c.prototype = constructor.prototype;

            return new c();
        }

        // the new constructor behaviour
        let f: any = function (...args) {
            return construct(original, args);
        };

        // copy prototype so intanceof operator still works
        f.prototype = original.prototype;

        arr_services.forEach((service:any) => {

            let service_instance = new service;
            let service_name = service_instance.constructor.name;
            let service_name_mod = service_name.replace(/([A-Z])/g, '_$1').toLowerCase();
            let l = service_name_mod.length;

            let prop_name = service_name_mod.slice(1, l);

            if (!injector[service]) {
                console.log("new instance of", service_name);
                injector[service] = new service;
            }
            f.prototype[prop_name] = injector[service];
        });

        // return new constructor (will override original)
        return f;
    };
}
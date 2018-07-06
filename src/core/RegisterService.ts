export let injector = {};

export function RegisterService(arr_services:Array<any>) {
    arr_services.map((service) => {
        injector[service.name] = null;
    });
}
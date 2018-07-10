import {RequestVO} from "../../../vo/RequestVO";
import {AbsListener} from "../Listener/AbsListener";
import {WarningLevel} from "../../../utils/Emun";
import {AbsBaseService} from "../Abs/AbsBaseService";
import {RequestManager} from "../System/RequestManager";
import {ResponseVO} from "../../../vo/ResponseVO";

interface IDecoratorOptions {
    onStartRequest:(request:RequestManager<ResponseVO<any>, AbsListener>) => void
    onFinishRequest:(request:RequestManager<ResponseVO<any>, AbsListener>) => void
}

export function AppIonicBaseServiceDecorator(handlers:IDecoratorOptions = <IDecoratorOptions>{}) {
    return (target: any): any => {

        // save a reference to the original constructor
        let original = target;

        // a utility function to generate instances of a class
        function construct(constructor:any, args:any) {
            let c : any = function () {
                return constructor.apply(this, args);
            };
            c.prototype = constructor.prototype;
            return new c();
        }

        // the new constructor behaviour
        let f : any = function (...args:Array<any>) {
            return construct(original, args);
        };

        Object.defineProperty(f.prototype, "setHandlers", {
            value: function (request_manager:RequestManager<ResponseVO<any>, AbsListener> ,options:RequestVO) : void {
                request_manager.setStartAndFinishReqHandlers(options,
                    (request:RequestManager<ResponseVO<any>, AbsListener>) => { handlers.onStartRequest.call(this, request); },
                    (request:RequestManager<ResponseVO<any>, AbsListener>) => { handlers.onFinishRequest.call(this, request); });
            }
        });

        // copy prototype so intanceof operator still works
        f.prototype = original.prototype;

        // return new constructor (will override original)
        return f.c;

    }
}


export function WebBaseServiceDecorator(options: any = null) {
    return (target: any): any => {

        Object.defineProperty(target.prototype, "setHandlers",  {
            value: function (request_manager:RequestManager<ResponseVO<any>, AbsListener> ,options:RequestVO) : void {
                request_manager.setStartAndFinishReqHandlers(options,
                    (request:RequestManager<ResponseVO<any>, AbsListener>) => {

                        let warning_level:WarningLevel;

                        if (request.options.warning_level_override) {
                            warning_level = request.options.warning_level_override;
                        }
                        else {
                            warning_level = request.options.endpoint.warning_level
                        }

                        if (warning_level !== WarningLevel.SILENT) {
                            if (!AbsBaseService["is_loading_active"] && (RequestManager.request_counter > 0)) {
                                this.presentLoadingDefault();
                            }
                        }
                    },
                    (request:RequestManager<ResponseVO<any>, AbsListener>) => {
                        if (AbsBaseService["is_loading_active"] && (RequestManager.request_counter == 0)) {
                            console.log("dismiss!!");
                            this.dismissLoadingDefault();
                        }
                    }
                );
            }
        });

    }
}
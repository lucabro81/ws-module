import {WarningLevel} from "../utils/Emun";

export interface EndPointVO {
    url:string,
    warning_level:WarningLevel,
    access:boolean,
    refresh:boolean,
    retry?:number,
    default_method:string,
    debounce?:number
}
import {WarningLevel} from "../utils/Emun";

interface OverrideRequestDataVO {
    warning_level:WarningLevel
    retry: number;
    debounce:number;
}
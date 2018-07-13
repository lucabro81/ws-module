import {EndPointVO} from "../vo/EndPointVO";
import {WarningLevel} from "./Emun";

export class EndPoints {

    static TEST_ENDPOINT:EndPointVO = {
        url:"https://private-447d56-mediaaggregator.apiary-proxy.com/json/testi_app_20170502_1505",
        warning_level:WarningLevel.LOW,
        access: false,
        refresh: false,
        methods: ["Post", "Get"],
        retry:0
    };

}

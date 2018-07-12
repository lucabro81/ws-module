#ws-module

Modulo per la gestione di richieste http, da utilizzare per creare ws-module declinati per framework/piattaforma

###Installazione

```
npm install ws-module --save
```

###Utilizzo

1) Creazione di una classe service (la creazione di una classe service è automatizzata usando i [ws-module-scripts](#))

        import {EndPoints} from "EndPoints";
        import {OnTestServiceMethodListener} from "./decorators/OnTestServiceMethodListener";
        import {TestServiceMethodSignalContainer} from "./decorators/TestServiceMethodSignalContainer";
        import {AbsBaseService} from "ws-module";
        import {IService} from "ws-module";
        import {Get} from "ws-module";
         
        class testSrvProperties {
            prop1:string;
            prop2:number;
        }
         
        export class TestService extends AbsBaseService {
         
            public testSrv:IService<any, OnTestServiceMethodListener, TestServiceMethodSignalContainer, testSrvProperties>;
         
            constructor() {
                super();
                this.testSrv = this.setServiceObj(TestServiceMethodSignalContainer, "testSrv", testSrvProperties);
            }
        
            /**
            *
            * @param params
            * @returns {RequestManager<ResponseVO<ResponseVO<any>>, onTestServiceMethodListener>}
            */
            @Get<ResponseVO<any>, OnTestServiceMethodListener>({
                endpoint: EndPoints.USERS_ME,
                config: {}
            })
            private _testSrv(params:any):any {
                return {
                    success_handler:
                        (response: ResponseVO<any>) => {
                            this.testSrv.properties.prop2 = Math.random();
                            this.testSrv.properties.prop1 = "" + Math.random();
                            this.testSrv.signals.onTestServiceSuccess.dispatch(this.testSrv, ["asdadasd"]);
                            this.fireEvent(params.request_manager, "eventOne", response);
                            this.testSrv.signals.onTestServiceEventOne.dispatch(this.testSrv, ["asdadasd1"]);
                        },
        
                    error_handler:
                        (error) => {
                            this.testSrv.signals.onTestServiceError.dispatch();
                            this.fireEvent(params.request_manager, "eventTwo", error);
                            this.testSrv.signals.onTestServiceEventOne.dispatch(this.testSrv, ["asdadasd2"]);
                        }
                }
            }
         
        }
        
        
2) Creazione di un'istanza (la modalità di creazione dell'istanza del service varia molto dalla declinazione di questo mod per altri framework)

        import { TestService } from './TestService.ts';
        
        let test_service = new TestService();
   
        
3) Creazione richiesta

        /*******************************/
        /** Registrazione dei signals **/
        /*******************************/
        
        test_service
            .testSrv
            .signals
            .onTestServiceSuccess
                .add((evt:any) => {
                    console.log('onTestServiceSuccess', evt);
                })
            .onTestServiceError
                .add((evt:any) => {
                    console.log('onTestServiceError', evt);
                });
        
        /***************************************/
        /** Creazione e invio della richiesta **/
        /***************************************/
        
        // È possibile settare dei listener privati con scope limitato alla classe in cui vengono creati 
        // estendendo una classe preventivamente creata
        
        test_service
            .testSrv
            .request({some_data:"data", other_data:"more_data"})
            .synchronize()
            .setRequestId("ziocan")
            .setListener(new class extends OnTestServiceMethodListener {
        
                public onSuccess(evt):void {
                    super.onSuccess(evt);
                    console.log("anonym.onSuccess");

                }

                public onError(error):void {
                    super.onError(error);
                    console.log("anonym.onError");
                }

                public eventOne():void {
                    super.eventOne();
                    console.log("eventOne");
                }

                public eventTwo():void {
                    super.eventTwo();
                    console.log("eventTwo");
                }

                public destroy():void {
                    super.destroy();
                    console.log("destroy");
                }
            })
            .run();

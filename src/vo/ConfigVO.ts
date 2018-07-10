export interface ConfigVO {
    defaultLoading: {
        enable: boolean,
        loading?: any,  // viene settato "privatamente" per framework come ionic e contiene, per esempio,  il riferimento del popup di alert
        presentLoadingDefault: () => void,
        dismissLoadingDefault: () => void
    },
    cache: {
        enable: boolean
    }
}
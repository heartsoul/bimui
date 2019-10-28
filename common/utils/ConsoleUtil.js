/**
 *  Console的工具类
 */
export function initConsole() {
    if (!__DEV__) {
        global.console = {
            info: () => { },
            log: () => { },
            warn: () => { },
            debug: () => { },
            error: () => { },
            assert: () => { },
        };
    }
}

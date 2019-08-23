let isCalled = false; let
    timer;

/**
 * @param functionTobeCalled 被包装的方法
 * @param interval 时间间隔，可省略，默认600毫秒
 */
const callOnceInInterval = (functionTobeCalled, interval = 600) => {
    if (!isCalled) {
        isCalled = true;
        clearTimeout(timer);
        timer = setTimeout(() => {
            isCalled = false;
        }, interval);
        return functionTobeCalled();
    }
    return null;
};
export default callOnceInInterval;

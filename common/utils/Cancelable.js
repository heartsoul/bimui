/* eslint-disable prefer-promise-reject-errors */
/**
 * Cancelable
 * GitHub:https://github.com/crazycodeboy
 * Eamil:crazycodeboy@gmail.com
 * @flow
 * */

export default function makeCancelable(promise) {
    let hasCanceled = false;
    const wrappedPromise = new Promise((resolve, reject) => {
        promise.then(val => (hasCanceled ? reject({ isCanceled: true }) : resolve(val)));
        promise.catch(error => (hasCanceled ? reject({ isCanceled: true }) : reject(error)));
    });

    return {
        promise: wrappedPromise,
        cancel() {
            hasCanceled = true;
        },
    };
}

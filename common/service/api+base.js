/* eslint-disable no-multi-assign */
/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */
/**
 * 描述：api底层封装
 * 作者：
 * 版权：广联达
 */
import { Platform } from 'react-native';
import { RNFetchBlob } from '../extension';
import { BASE_URL } from '../constant/server-config';
// 关于fetch https://github.com/github/fetch
// fetch('/users', {
//   method: 'POST',
//   headers: {
//     'Content-Type': 'application/json'
//   },
//   body: JSON.stringify({
//     name: 'Hubot',
//     login: 'hubot',
//   })
// })

function getContentType(headers) {
    let ContentType = '';
    if (headers) {
        const headerKey = Object.keys(headers).find(key => key.toLowerCase() == 'content-type');
        if (headerKey) {
            ContentType = headers[headerKey];
        }
    }
    return ContentType;
}

const apiTaskLst = [];
function parseJSON(response) {
    const ContentType = response.headers.get('Content-Type');
    if (ContentType && ContentType.toLowerCase().indexOf('application/json', 0) > -1) {
        const ret = response.json();
        return ret;
    }
    return response.text();
}

function parseJSONBlob(response) {
    if (!response.respInfo.status) {
        return response.json();
    }
    const ContentType = getContentType(response.respInfo.headers);
    if (ContentType && ContentType.toLowerCase().indexOf('application/json', 0) > -1) {
        const ret = response.json();
        return ret;
    }
    return response.text();
}
function parseHTML(response) {
    return response;
}

// eslint-disable-next-line no-unused-vars
function printErr(response) {
    const text = response.text();
    console.log(`请求异常，返回值code=${response.status}`);
    text.then((result) => {
        console.log('err msg = ', result);
    });
}

function checkStatus(response) {
    // console.log(">>>返回数据："+JSON.stringify(response));
    if (response.status >= 200 && response.status < 300) {
        return response;
    } if (response.status === 403) {
        console.log('请联系管理员获取相应操作权限(code:403)');

        const error = new Error('您没有浏览权限，请联系管理员进行授权');
        error.response = response;
        throw error;
        // Message.error('请联系管理员获取相应操作权限');
    } if (response.status === 401) {
        const error = new Error('您没有浏览权限，请联系管理员进行授权');
        // console.log(">>>返回数据："+JSON.stringify(response));
        console.log('请联系管理员获取相应操作权限(code:401)');
        // printErr(response);
        error.response = response;
        error.needLogin = true;
        throw error;
    } else if (response.status === 500) {
        // alert('数据获取失败(code:500).');
        // return ;
        // Message.error('请联系管理员获取相应操作权限');
        // Toast.info('数据获取失败(code:500)',3)
        console.log('数据获取失败(code:500)');
        // response.text().then((result)=>{
        //     console.log('result-',result)
        // })
        // printErr(response);

        // {"code":"ERROR_SERVICE_INVOKE","message":"没有指定租户上下文"
        const error = new Error('数据获取失败');
        error.response = response;
        throw error;
    }

    const error = new Error(response.statusText);
    error.response = response;
    throw error;
}

function checkStatusBlob(response) {
    if (!response.respInfo.status) {
        return response;
    }
    response.status = response.respInfo.status;
    // console.log(">>>返回数据："+JSON.stringify(response));
    if (response.respInfo.status >= 200 && response.respInfo.status < 300) {
        return response;
    } if (response.respInfo.status === 403) {
        console.log('请联系管理员获取相应操作权限(code:403)');
        // console.log('response',response)
        const error = new Error('您没有浏览权限，请联系管理员进行授权');
        error.response = response;
        error.response.status = response.respInfo.status;
        throw error;
        // Message.error('请联系管理员获取相应操作权限');
    } else if (response.respInfo.status === 401) {
        const error = new Error('您没有浏览权限，请联系管理员进行授权');
        console.log('请联系管理员获取相应操作权限(code:401)');
        // printErr(response);
        error.response = response;
        error.response.status = response.respInfo.status;
        error.needLogin = true;
        throw error;
    } else if (response.respInfo.status === 500) {
        // alert('数据获取失败(code:500).');
        // return ;
        // Message.error('请联系管理员获取相应操作权限');
        // Toast.info('数据获取失败(code:500)',3)
        console.log('数据获取失败(code:500)');
        // response.text().then((result)=>{
        //     console.log('result-',result)
        // })
        // printErr(response);

        // {"code":"ERROR_SERVICE_INVOKE","message":"没有指定租户上下文"
        const error = new Error('数据获取失败');
        error.response = response;
        error.response.status = response.respInfo.status;
        throw error;
    }

    const error = new Error('数据获取失败');
    error.response = response;
    error.response.status = response.respInfo.status;
    throw error;
}

function processOptions(options) {
    const ops = {
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json;charset=utf-8',
            'X-Requested-With': 'XMLHttpRequest',
            'Cache-Control': 'no-cache',
        },
    };
    for (const i in ops) {
        if (options[i] && typeof options[i]) {
            if (typeof options[i] == 'object') {
                options[i] = ops[i] = { ...ops[i], ...options[i] };
            }
        }
    }
    return { ...ops, ...options };
}

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * @param  {string} server     The host we want to request defalut BASE_URL
 * @return {object} 原样返回请求数据，不进行处理
 */
export function requestSimple(url, options, server = null) {
    const ops = processOptions(options);
    if (Platform.OS === 'web') {
        return fetch((server || BASE_URL) + url, ops);
    }
    const task = RNFetchBlob.fetch(ops.method, (server || BASE_URL) + url, ops.headers, ops.body);
    return task.progress({ interval: 500 }, (received, total) => {
        if (ops.progress) {
            ops.progress(received, total, task);
        }
    }).uploadProgress({ interval: 500 }, (sent, total) => {
        if (ops.uploadProgress) {
            ops.onProgress(sent, total, task);
        }
    });
}

// 处理重复请求
function canRequest(options) {
    const { syncKey = null } = options || {};
    if (!syncKey) {
        return true;
    }

    let findTask = apiTaskLst[syncKey] || {};
    const { taskItem, expries } = findTask;
    try {
        if (taskItem) {
            const tms = new Date().getTime();
            if (expries && tms < expries) {
                console.log('！！！重复调用！短期内');
                return false;
            }
            console.log('！！！重复调用！');
            apiTaskLst[syncKey] = null;
            delete apiTaskLst[syncKey];
            if (findTask.cancel) {
                findTask.cancel();
            }
        }
    } catch (error) {
        console.log(error);
    }
    findTask = null;
    return true;
}

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * forceFetch: 直接使用fetch请求
 * syncKey：请求唯一，防止多次请求
 * expires: 过期时间，毫秒与syncKey配合使用，在过期之前都不会重复请求，如果没设置，则直接取消上次的请求（web版本没有取消功能）
 * silent：静默模式，设置后即使401了也不会跳到登录页面
 * @return {object}           An object containing either "data" or "err"
 */
export function requestJSON(url, options, server = null) {
    return new Promise((resolve, reject) => {
        const ops = processOptions(options);
        const { syncKey = null, expries = null, forceFetch } = ops || {};
        if (!canRequest(ops)) {
            reject(new Error('重复请求'));
            return;
        }
        let taskItem = {};
        if (Platform.OS === 'web' || !syncKey || forceFetch) {
            taskItem = fetch((server || BASE_URL) + url, ops)
            .then(checkStatus)
            .then(parseJSON);
        } else {
            taskItem = RNFetchBlob.fetch(ops.method, (server || BASE_URL) + url, ops.headers, ops.body)
            .progress({ interval: 500 }, (received, total) => {
                if (ops.progress) {
                    ops.progress(received, total, taskItem);
                }
            }).uploadProgress({ interval: 500 }, (sent, total) => {
                if (ops.uploadProgress) {
                    ops.onProgress(sent, total, taskItem);
                }
            }).then(checkStatusBlob)
            .then(parseJSONBlob);
        }
        if (syncKey) {
            apiTaskLst[syncKey] = {
                expries,
                taskItem,
            };
        }
        taskItem.then((data) => {
                if (syncKey) {
                    const { taskItem: taskItemFind = null } = apiTaskLst[syncKey] || {};
                    if (taskItemFind != taskItem) {
                        throw new Error('cancel'); // 任务被取消了
                    }
                    apiTaskLst[syncKey] = null;
                    delete apiTaskLst[syncKey];
                }
                if (resolve) {
                    resolve({ data });
                }
                return { data };
            })
            .catch((err) => {
                try {
                    if (syncKey) {
                        apiTaskLst[syncKey] = null;
                        delete apiTaskLst[syncKey];
                    }
                } catch (error) {
                    console.log(error);
                }
                if (err) {
                    if (err.message == 'cancel' || err.message == 'canceled' || err.message == '已取消') {
                        console.log('重复调用！');
                        return;
                    }
                    if (!err.response) {
                        err.OffNetWork = true;// 没有连接到网络
                    }
                }
                if (reject) {
                    reject(err);
                } else {
                    throw err;
                }
            });
    }).then(data => data);
}

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
export function requestHTML(url, options) {
    let ops = {
        // headers: {
        //   'Content-Type': 'application/json;charset=utf-8',
        // },
        // credentials: 'include', // 带上cookie
    };
    for (const i in ops) {
        if (options[i]) {
            options[i] = ops[i] = { ...ops[i], ...options[i] };
        }
    }
    ops = { ...ops, ...options };
    if (ops.isSpecial) {
        return fetch(BASE_URL + url, ops);
    }
    // console.log(BASE_URL + url);
    return fetch(BASE_URL + url, ops)
        .then(checkStatus)
        .then(parseHTML)
        .then((data) => {
            // if (data && data.code === 'FALSE') {
            //   const msg = data.message || '操作失败';
            // }
            // console.log(data);
            if (!data) {
                const error = new Error('没有数据返回');
                error.response = null;
                throw error;
            }
            return data;
        });
}

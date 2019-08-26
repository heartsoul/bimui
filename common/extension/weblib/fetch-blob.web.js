/* eslint-disable prefer-destructuring */
/* eslint-disable no-unused-expressions */

function getUUID() {
    return Math.random().toString(36).substring(2, 15)
    + Math.random().toString(36).substring(2, 15);
}
// const oldFetch = window.fetch;

function uploadFetch(url, formData, uploadComplete, uploadFailed, progressFunction, onloadstart) {
    const xhr = new XMLHttpRequest();// XMLHttpRequest 对象
    let ot;
    xhr.open('post', url, true); // post方式，url为服务器请求地址，true 该参数规定请求是否异步处理。
    xhr.onload = (event) => {
        uploadComplete && uploadComplete(event);
    }; // 请求完成
    xhr.onerror = (event) => {
        uploadFailed && uploadFailed(event);
    }; // 请求失败
    xhr.upload.onprogress = (event) => {
        //  event.loaded
        progressFunction && progressFunction(event);
    }; // 【上传进度调用方法实现】
    xhr.upload.onloadstart = () => { // 上传开始执行方法
        ot = new Date().getTime(); // 设置上传开始时间
        onloadstart && onloadstart(ot);
    };
    xhr.send(formData); // 开始上传，发送form数据
    return xhr;
}
// const emitter = DeviceEventEmitter

// // register message channel event handler.
// emitter.addListener("RNFetchBlobMessage", (e) => {

//     if (e.event === 'warn') {
//         console.warn(e.detail)
//     }
//     else if (e.event === 'error') {
//         throw e.detail
//     }
//     else {
//         console.log("RNFetchBlob native message", e.detail)
//     }
// })

/**
 * RNFetchBlob response object class.
 */
class FetchBlobResponse {
    // taskId : string;
    // path : () => string | null;
    // type : 'base64' | 'path' | 'utf8';
    // data : any;
    // blob : (contentType:string, sliceSize:number) => Promise<Blob>;
    // text : () => string | Promise<any>;
    // json : () => any;
    // base64 : () => any;
    // flush : () => void;
    // respInfo : RNFetchBlobResponseInfo;
    // session : (name:string) => RNFetchBlobSession | null;
    // readFile : (encode: 'base64' | 'utf8' | 'ascii') => ?Promise<any>;
    // readStream : (
    //   encode: 'utf8' | 'ascii' | 'base64',
    // ) => RNFetchBlobStream | null;

    constructor(taskId, info, data) {
        this.data = data;
        this.taskId = taskId;
        this.respInfo = info;
        /**
         * Convert result to text.
         * @return {string} Decoded base64 string.
         */
        this.text = () => this.data;
        /**
         * Convert result to JSON object.
         * @return {object} Parsed javascript object.
         */
        this.json = () => JSON.parse(this.data);
    }
}

function wrap(path) {
    return path;
}

/**
 * Calling this method will inject configurations into followed `fetch` method.
 * @param  {RNFetchBlobConfig} options
 *         Fetch API configurations, contains the following options :
 *         @property {boolean} fileCache
 *                   When fileCache is `true`, response data will be saved in
 *                   storage with a random generated file name, rather than
 *                   a BASE64 encoded string.
 *         @property {string} appendExt
 *                   Set this property to change file extension of random-
 *                   generated file name.
 *         @property {string} path
 *                   If this property has a valid string format, resonse data
 *                   will be saved to specific file path. Default string format
 *                   is : `RNFetchBlob-file://path-to-file`
 *         @property {string} key
 *                   If this property is set, it will be converted to md5, to
 *                   check if a file with this name exists.
 *                   If it exists, the absolute path is returned (no network
 *                   activity takes place )
 *                   If it doesn't exist, the file is downloaded as usual
 *         @property {number} timeout
 *                   Request timeout in millionseconds, by default it's 30000ms.
 *
 * @return {function} This method returns a `fetch` method instance.
 */
// function config(options) {
//     return { fetch: fetch.bind(options) };
// }

//   /**
//    * Fetch from file system, use the same interface as RNFB.fetch
//    * @param  {RNFetchBlobConfig} [options={}] Fetch configurations
//    * @param  {string} method     Should be one of `get`, `post`, `put`
//    * @param  {string} url        A file URI string
//    * @param  {string} headers    Arguments of file system API
//    * @param  {any} body       Data to put or post to file systen.
//    * @return {Promise}
//    */
//   function fetchFile(options = {}, method, url, headers = {}, body) {

//     let promise = null
//     let cursor = 0
//     let total = -1
//     let cacheData = ''
//     let info = null
//     let _progress, _uploadProgress, _stateChange

//     switch(method.toLowerCase()) {

//       case 'post':
//       break

//       case 'put':
//       break

//       // read data from file system
//       default:
//         promise = fs.stat(url)
//         .then((stat) => {
//           total = stat.size
//           return fs.readStream(url,
//             headers.encoding || 'utf8',
//             Math.floor(headers.bufferSize) || 409600,
//             Math.floor(headers.interval) || 100
//           )
//         })
//         .then((stream) => new Promise((resolve, reject) => {
//           stream.open()
//           info = {
//             state : "2",
//             headers : { 'source' : 'system-fs' },
//             status : 200,
//             respType : 'text',
//             rnfbEncode : headers.encoding || 'utf8'
//           }
//           _stateChange(info)
//           stream.onData((chunk) => {
//             _progress && _progress(cursor, total, chunk)
//             if(headers.noCache)
//               return
//             cacheData += chunk
//           })
//           stream.onError((err) => { reject(err) })
//           stream.onEnd(() => {
//             resolve(new FetchBlobResponse(null, info, cacheData))
//           })
//         }))
//       break
//     }

//     promise.progress = (fn) => {
//       _progress = fn
//       return promise
//     }
//     promise.stateChange = (fn) => {
//       _stateChange = fn
//       return promise
//     }
//     promise.uploadProgress = (fn) => {
//       _uploadProgress = fn
//       return promise
//     }

//     return promise
//   }

/**
 * Create a HTTP request by settings, the `this` context is a `RNFetchBlobConfig` object.
 * @param  {string} method HTTP method, should be `GET`, `POST`, `PUT`, `DELETE`
 * @param  {string} url Request target url string.
 * @param  {object} headers HTTP request headers.
 * @param  {string} body
 *         Request body, can be either a BASE64 encoded data string,
 *         or a file path with prefix `RNFetchBlob-file://` (can be changed)
 * @return {Promise}
 *         This promise instance also contains a Customized method `progress`for
 *         register progress event handler.
 */
function fetchBlob(...args) {
    // create task ID for receiving progress event

    const taskId = getUUID();
    // eslint-disable-next-line no-unused-vars
    const [method, url, headers, bodys] = [...args];
    // let [body] = bodys;
    // from remote HTTP(S)
    const promise = new Promise((resolve, reject) => {
        const formData = new FormData();
        bodys && bodys.map && bodys.map((dataItem) => {
            if (dataItem.name) {
                if (dataItem.fileName) {
                    formData.append(dataItem.name, dataItem.data, dataItem.fileName);
                } else {
                    formData.append(dataItem.name, dataItem.data);
                }
            }
            return dataItem;
        });


        // let ops = {
        //     method: 'POST',
        //     body: formData,
        // };
        // oldFetch(url, ops).then((data) => {
        //     delete promise['progress']
        //     delete promise['uploadProgress']
        //     delete promise['stateChange']
        //     delete promise['part']
        //     delete promise['cancel']
        //     // delete promise['expire']
        //     promise.cancel = () => { }
        //     resolve(new FetchBlobResponse(taskId, {}, data))
        // }).catch(err => {
        //     reject(new Error(err, {}))

        // })
       uploadFetch(url, formData, (evt) => {
            delete promise.progress;
            delete promise.uploadProgress;
            delete promise.stateChange;
            delete promise.part;
            delete promise.cancel;
            // delete promise['expire']
            promise.cancel = () => { };
            const data = evt.target.responseText;
            resolve(new FetchBlobResponse(taskId, {}, data));
        }, (evt) => {
            reject(new Error(JSON.stringify(evt)));
        }, (evt) => {
            if (evt.lengthComputable) {
                promise.onUploadProgress && promise.onUploadProgress(evt.loaded, evt.total);
            }
        }, (evt) => {

        });
    });

    // extend Promise object, add `progress`, `uploadProgress`, and `cancel`
    // method for register progress event handler and cancel request.
    // Add second parameter for performance purpose #140
    // When there's only one argument pass to this method, use default `interval`
    // and `count`, otherwise use the given on.
    // TODO : code refactor, move `uploadProgress` and `progress` to StatefulPromise
    promise.progress = (...argsIn) => {
        // let interval = 250
        // let count = -1
        let fn = () => { };
        if (argsIn.length === 2) {
            // interval = argsIn[0].interval || interval
            // count = argsIn[0].count || count
            fn = argsIn[1];
        } else {
            fn = argsIn[0];
        }
        promise.onProgress = fn;
        // RNFetchBlob.enableProgressReport(taskId, interval, count)
        return promise;
    };
    promise.uploadProgress = (...argsIn) => {
        // let interval = 250;
        // let count = -1;
        let fn = () => { };
        if (argsIn.length === 2) {
            // interval = argsIn[0].interval || interval;
            // count = argsIn[0].count || count;
            fn = argsIn[1];
        } else {
            fn = argsIn[0];
        }
        promise.onUploadProgress = fn;
        return promise;
    };
    promise.part = (fn) => {
        promise.onPartData = fn;
        return promise;
    };
    promise.stateChange = (fn) => {
        promise.onStateChange = fn;
        return promise;
    };
    promise.expire = (fn) => {
        promise.onExpire = fn;
        return promise;
    };
    promise.cancel = (fn) => {
        promise.onCancel = fn || (() => { });
    };
    promise.taskId = taskId;

    return promise;
}

const fetch = fetchBlob;

export default {
    fetch,
    wrap,
};

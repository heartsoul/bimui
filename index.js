import { RNFetchBlob } from './extension';
import { requestJSON, requestHTML, requestSimple } from './service/api+base';
import callOnceInInterval from './utils/callOnceInInterval';
import PinYinUtil from './utils/PinYinUtil';
import * as mime from './utils/mime';
import DateUtil from './utils/DateUtil';
import * as ConsoleUtil from './utils/ConsoleUtil';
import * as config from './constant/server-config';

export default {
    RNFetchBlob,
    fetch: {
        requestJSON,
        requestHTML,
        requestSimple,
    },
    callOnceInInterval,
    PinYinUtil,
    mime,
    DateUtil,
    ConsoleUtil,
    config,
};

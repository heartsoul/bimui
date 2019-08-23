/**
 * 描述：应用文件
 * 作者：soul
 * 版权：广联达
*/

const ENV = require('./server-config-local');

export const PDF_PREVIEW_PREFIX = ENV.PDF_PREVIEW_PREFIX || '/proxyGDOCOSS';
// 服务器地址
export const BASE_UPLOAD_URL = ENV.BASE_UPLOAD_URL || 'https://api.glodon.com';// "http://172.16.233.183:8093";//图片服务
export const BASE_URL = ENV.BASE_URL || 'http://bimcop-test.glodon.com'; // 应用服务
export const BIZ_URL = BASE_URL;
export const BASE_URL_BLUEPRINT_TOKEN = `${BASE_URL}/app.html?param=`;// 图纸的url地址
export const BASE_SHARE_URL = `${BASE_URL}/share.html?t=`;// 文档分享地址
export const BASE_DOC_SIGNED_URL_PREFIX = ENV.BASE_DOC_SIGNED_URL_PREFIX || 'https://gly-dev-gdoc.oss-cn-shanghai.aliyuncs.com';// 文档下载地址
export const BASE_CONFIG = ENV;// 环境配置信息

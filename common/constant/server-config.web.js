/**
 * 描述：应用文件
 * 作者：soul
 * 版权：广联达
*/
const ENV = require('./server-config-local');
// 服务器地址

// 测试服务器
export const PDF_PREVIEW_PREFIX = ENV.PDF_PREVIEW_PREFIX || '/proxyGDOCOSS';
export const BASE_UPLOAD_URL = __DEV__ ? '' : ENV.BASE_UPLOAD_URL;// 图片服务
export const BASE_URL = ''; // 应用服务 通过webpack代理配置
export const BIZ_URL = ENV.BASE_URL || 'http://10.20.1.54';
export const BASE_URL_BLUEPRINT_TOKEN = `${BASE_URL}/app.html?param=`;// 图纸的url地址
export const BASE_SHARE_URL = `${BIZ_URL}/share.html?t=`;// 文档分享地址
export const BASE_DOC_SIGNED_URL_PREFIX = ENV.BASE_DOC_SIGNED_URL_PREFIX || 'https://gly-dev-gdoc.oss-cn-shanghai.aliyuncs.com';// 文档下载地址
export const BASE_CONFIG = ENV;// 环境配置信息
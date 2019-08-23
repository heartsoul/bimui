/**
 * 描述：应用文件
 * 作者：soul
 * 版权：广联达
*/

// 服务器地址
const ENV = require('./server-config-local');

// 测试服务器
exports.BASE_URL_PROXY = ENV.BASE_URL_PROXY;
exports.UPLOAD_URL_PROXY = ENV.UPLOAD_URL_PROXY; // 图片服务
exports.WEB_HOST_PROXY = ENV.WEB_HOST_PROXY;
// 预生产服务器
// exports.BASE_URL_PROXY = "http://bimcop-test.glodon.com"; // 应用服务
// exports.UPLOAD_URL_PROXY =  "https://api.glodon.com";//图片服务
// 生产服务器
// exports.BASE_URL_PROXY = "http://bimcop.glodon.com";
// exports.UPLOAD_URL_PROXY = "https://api.glodon.com/";

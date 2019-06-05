
import React from 'react';
import PropTypes from 'prop-types';

export default class WebView extends React.Component {
    static propTypes = {
        landscape: PropTypes.bool,
        onMessage: PropTypes.func,
        onLoad: PropTypes.func,
        injectedJavaScript: PropTypes.string,
        source: PropTypes.shape({
                    /**
                     * 标题
                     */
                    uri: PropTypes.string,
                    /**
                     * 标题颜色
                     */
                    html: PropTypes.string,
                }),
    };

    static defaultProps = {
        landscape: false,
        onMessage: null,
        onLoad: null,
        injectedJavaScript: null,
        source: { html: '<div>参数无效</div>' },
    };

    constructor(props) {
        super(props);
        const uniqueKey = this.genUniqueKey();
        this.state = {
            uniqueKey,
        };
        this.webFrameRef = null;
    }

    /**
     * 获取唯一的key
     */
    genUniqueKey = () => `webRef_${Number(Math.random().toString().substr(3, 5) + Date.now()).toString(36)}`;

    injectJavaScript = (script) => {
        if (this.webFrameRef) {
            this.webFrameRef.contentWindow.window.eval(`${script} ${this.getWebCoreBridgeJS()}`);
        }
    }

    onMessage = (e) => {
        const { onMessage } = this.props;
        if (onMessage) {
            onMessage(e);
        }
    }

    /**
     * H5版本和js交互,存在多个iframe时，每个iframe的onMessage方法设置唯一的key
     */
    getWebCoreBridgeJS = () => {
        const { uniqueKey } = this.state;
        return `
            function callMessage(action = 'unknown', data = {}) {
                if (!action) {
                    console.log('无效调用');
                    return;
                }
                const cmd = JSON.stringify({ action, data });
                window.parent.window.messageCallback.${uniqueKey}({nativeEvent:{data:cmd}});
            }
        `;
    }

    componentWillMount = () => {
        if (!window.messageCallback) {
            window.messageCallback = {};
        }
        const { uniqueKey } = this.state;
        window.messageCallback[uniqueKey] = this.onMessage;
   }

    componentDidMount = () => {
        const { injectedJavaScript, source } = this.props;
        if (this.webFrameRef.attachEvent) {
            this.webFrameRef.attachEvent('onload', () => {
                if (injectedJavaScript) {
                    this.injectJavaScript(`javascript:${injectedJavaScript}`);
                }
            });
        } else {
            this.webFrameRef.onload = () => {
                if (injectedJavaScript) {
                    this.injectJavaScript(`javascript:${injectedJavaScript}`);
                }
                if (source.html) {
                    const htmlNode = this.webFrameRef.contentWindow.document.getElementById('loadingNode');
                    htmlNode.innerHTML = source.html;
                }
                const { onLoad } = this.props;
                if (onLoad) {
                    onLoad();
                }
            };
        }
    }

    componentWillUnmount = () => {
        const { uniqueKey } = this.state;
        window.messageCallback[uniqueKey] = null;
    }

    renderUrl = (url) => {
        const { landscape = false } = this.props;
        const off = Math.abs((document.body.clientWidth - document.body.clientHeight) / 2);
        const myStyle = landscape ? { transform: `matrix(0,1,-1,0,${-off},${off})`, width: document.body.clientHeight, height: document.body.clientWidth } : { width: '100%', height: '100%' };
        return (
        <iframe
            title="title"
            ref={(ref) => { this.webFrameRef = ref; }}
            name="myFrame"
            src={url}
            style={myStyle}
            frameBorder={0}
        />
        );
    }

    renderHtml = (html) => {
        const { landscape = false } = this.props;
        const off = Math.abs((document.body.clientWidth - document.body.clientHeight) / 2);
        const myStyle = landscape ? { transform: `matrix(0,1,-1,0,${-off},${off})`, width: document.body.clientHeight, height: document.body.clientWidth } : { width: '100%', height: '100%' };
        return (
        <iframe
            title="title"
            ref={(ref) => { this.webFrameRef = ref; }}
            name="myFrame"
            srcDoc={html}
            style={myStyle}
            frameBorder={0}
        />
        );
    }

    render = () => {
        const { source } = this.props;
        const { uri, html } = source;
        if (html) {
            return this.renderHtml(html);
        }
        return this.renderUrl(uri);
    }
}

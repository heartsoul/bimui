/* eslint-disable react/no-string-refs */
/* eslint-disable jsx-a11y/iframe-has-title */
/* eslint-disable react/prop-types */
/* eslint-disable react/destructuring-assignment */
import React from 'react';

export default class WebView extends React.Component {
    constructor(props) {
        super(props);
        const uniqueKey = this.genUniqueKey();
        this.state = {
            uniqueKey,
        };
    }

    /**
     * 获取唯一的key
     */
    genUniqueKey = () => `webRef_${Number(Math.random().toString().substr(3, 5) + Date.now()).toString(36)}`;

    injectJavaScript = (script) => {
        this.refs.webFrame.contentWindow.window.eval(`${script} ${this.getWebCoreBridgeJS()}`);
    }

    onMessage = (e) => {
        // eslint-disable-next-line react/prop-types
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
        if (this.refs.webFrame.attachEvent) {
            this.refs.webFrame.attachEvent('onload', () => {
                if (injectedJavaScript) {
                    this.injectJavaScript(`javascript:${this.props.injectedJavaScript}`);
                }
            });
        } else {
            this.refs.webFrame.onload = () => {
                if (injectedJavaScript) {
                    this.injectJavaScript(`javascript:${this.props.injectedJavaScript}`);
                }
                if (source.html) {
                    const htmlNode = this.refs.webFrame.contentWindow.document.getElementById('loadingNode');
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
        const off = Math.abs((document.body.clientWidth - document.body.clientHeight) / 2);
        const myStyle = this.props.landscape ? { transform: `matrix(0,1,-1,0,${-off},${off})`, width: document.body.clientHeight, height: document.body.clientWidth } : { width: '100%', height: '100%' };
        return (
        <iframe
            ref="webFrame"
            name="myFrame"
            src={url}
            style={myStyle}
            frameBorder={0}
        />
        );
    }

    renderHtml = html => (
        <iframe
            ref="webFrame"
            name="myFrame"
            srcDoc={html}
            height="100%"
            width="100%"
            frameBorder={0}
        />
    )

    render = () => {
        const { source } = this.props;
        const { uri, html } = source;
        if (html) {
            return this.renderHtml(html);
        }
        return this.renderUrl(uri);
    }
}

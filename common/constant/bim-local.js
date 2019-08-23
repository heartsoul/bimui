
    const jssdk={
        online:'https://static.bimface.com/api/BimfaceSDKLoader/BimfaceSDKLoader@latest-release.js',
        offline:'./jssdk/BimfaceSDKLoader@latest-release.js',
    }

    function init(token, show){
        return `
function isEmptyObject(obj = {}) {
    let name;
    for (name in obj) {
        return !1;
    }
    return !0
}

function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
}

function removeDrawableItem() {
    if (!drawableContainer) {
        return;
    }
    drawableContainer.clear();

    if (!initCircleData) {
        return;
    }
    loadCircleItems(initCircleData);
}

function circleType(qState) {
    var circle = document.createElement('div');
    var colorsTypes = {
        'red': {
            background: '#F33D3D',
            border: '1px solid #F33D3D',
            boxShadow: '0 1px 4px 0 #732424'
        },
        'yellow': {
            background: '#F39B3D',
            border: '1px solid #F39B3D',
            boxShadow: '0 1px 4px 0 #9B6711'
        },
        'green': {
            background: '#28D575',
            border: '1px solid #28D575',
            boxShadow: '0 1px 4px 0 rgba(66,96,35,0.80)'
        },
        'default': {
            background: '',
            border: '',
            boxShadow: '',
            opacity: 0
        },
    };
    var background = "#fff",
        border = "1px solid #28D575",
        boxShadow = "0 1px 4px 0 rgba(66,96,35,0.80)",
        type;
    switch (qState) {
        case 'unrectified':
            type = "red";
            break;
        case 'delayed':
            type = "red";
            break;
        case 'unreviewed':
            type = "red";
            break;
        case 'reviewed':
            type = "yellow";
            break;
        case 'inspected':
            type = "green";
            break;
        case 'accepted':
            type = "green";
            break;
        default:
            type = "default";
    }
    if(type == "default"){
        return null;
    }
    circle.style.width = '10px';
    circle.style.height = '10px';
    circle.style.borderRadius = '5px';
    circle.style.background = colorsTypes[type].background;
    circle.style.border = colorsTypes[type].border;
    circle.style.boxShadow = colorsTypes[type].boxShadow;
    return circle;
}

function item3Dcircle(qState) {
    var imgSrc = "";
    switch (qState) {
        case 'unrectified':
            imgSrc = window.marker3DRed;
            break;
        case 'delayed':
            imgSrc = window.marker3DRed;
            break;
        case 'unreviewed':
            imgSrc = window.marker3DRed;
            break;
        case 'reviewed':
            imgSrc = window.marker3DYellow;
            break;
        case 'inspected':
            imgSrc = window.marker3DGreen;
            break;
        case 'accepted':
            imgSrc = window.marker3DGreen;
            break;
        case 'standard':
            imgSrc = window.markerFacility3DGreen;
            break;
        case 'notStandard':
            imgSrc = window.markerFacility3DRed;
            break;
        case 'edit':
            imgSrc = window.markerFacility3DYellow;
            break;
        default:
            imgSrc = null;
            break;
    }
    return imgSrc;
}

function load2DItems(initData) {
    var items = [];
    for (var i in initData) {
        var config = new Glodon.Bimface.Plugins.Drawable.CustomItemConfig();
        var x = initData[i].drawingPositionX,
            y = initData[i].drawingPositionY,
            z = 0;
        if (!!x && !!y) {
            console.log(initData[i].qcState);
            var circle = circleType(initData[i].qcState);
            if(!circle){
                continue;
            }
            circle.setAttribute("id", JSON.stringify(initData[i]));

            config.content = circle;
            config.viewer = modelViewer;
            config.worldPosition = {
                x: parseFloat(x),
                y: parseFloat(y),
                z
            };


            var tag = new Glodon.Bimface.Plugins.Drawable.CustomItem(config);

            var startTime, clientX, clientY;
            tag._domElement.addEventListener("touchstart", function (event) {
                startTime = new Date().getTime(),
                    clientX = event.changedTouches[0].clientX,
                    clientY = event.changedTouches[0].clientY;
            });

            tag._domElement.addEventListener("touchend", function (item) {
                var x = event.changedTouches[0].clientX;
                var y = event.changedTouches[0].clientY;

                endTime = new Date().getTime();

                if (endTime - startTime < 300 && Math.abs(x - clientX) < 10 && Math.abs(y - clientY) < 10) {
                    var tempData = item && item.changedTouches[0] && item.changedTouches[0].target.getAttribute("id") || '';
                    getPositionInfo(tempData);
                }
            });
            items.push(tag);
        }

    }
    return items;
}


function load3DItems(tempData, drawableContainer) {

    var items = [];
    for (var i in tempData) {
        var config = new Glodon.Bimface.Plugins.Marker3D.Marker3DConfig();

        var x = tempData[i].drawingPositionX,
            y = tempData[i].drawingPositionY,
            z = tempData[i].drawingPositionZ;
        if ((x != undefined && x != null) && (y != undefined && y != null) && (z != undefined && z != null)) {
            var dotCircle = item3Dcircle(tempData[i].qcState);
            if(!dotCircle){
                continue;
            }
            config.src = dotCircle;
            config.id = JSON.stringify(tempData[i]);
            config.worldPosition = {
                x,
                y,
                z
            };
            var tag = new Glodon.Bimface.Plugins.Marker3D.Marker3D(config);
            tag.onClick(function (item) {
                console.log(item.id, "item.id");
                getPositionInfo(item.id);
            });

            drawableContainer.addItem(tag);
            modelViewer.render();
            items.push(tag);

        }
    }
}

function extendProcessTouchend(event) {
    let myCloud = CLOUD;
    if (this.timeId) {
        clearTimeout(this.timeId);
    }
    
    event.preventDefault();
    
    if (this.longTapFlag) {
    this.longTapFlag = false;
    }
    let cameraControl = this.cameraControl;

    function dispatchPickEvent(intersect, selectable, canvasXY = {x:0, y:0}) {
        let modelManager = cameraControl.viewer.modelManager;
        modelManager.dispatchEvent({
            type: myCloud.EVENTS.ON_CLICK_PICK,
            event: event,
            doubleClick: false,
            canvasPos: {
                x: canvasXY.x,
                y: canvasXY.y
            },
            intersectInfo: intersect ? {
                selectedObjectId: intersect.userId,
                objectType: intersect.objectType,
                selectable: selectable,
                modelId: intersect.databagId,
                worldPosition: intersect.worldPosition,
                worldBoundingBox: intersect.worldBoundingBox,
                point: intersect.point,
                innnerDebugging: intersect.innnerDebugging
            } : null
        });
    }
    switch (event.touches.length) {
        case 0:
            {
                let needClearSelection = this.state === this.StateType.ROTATE;
                this.state = this.StateType.NONE;

                if (cameraControl.pivotBallGroup && cameraControl.pivotBallGroup.visible) {
                    needClearSelection = false;
                }
                
                cameraControl.touchEndHandler(event);

                if (!needClearSelection) {
                    return;
                }

                let sceneState = cameraControl.viewer.modelManager.sceneState;

                let scope = this;
                let screenPos = new THREE.Vector2(event.changedTouches[0].clientX, event.changedTouches[0].clientY);

                let canvasXY = cameraControl.screenToCanvas(event.changedTouches[0].clientX, event.changedTouches[0].clientY);



                let intersectContext = cameraControl.getIntersectContext(screenPos);
                let intersect = cameraControl.intersector.pick(intersectContext, null);
                let oldSelection = sceneState.getSelection();

                if (oldSelection.length > 0) {
                    sceneState.clearSelection();
                    cameraControl.updateView(true);
                }

                if (!intersect) {
                    dispatchPickEvent(null);
                    return;
                }

                let userId = intersect.userId;

                scope.lastPickedUserId = userId;

                if (myCloud.Utils.isMobileDevice()) {
                    cameraControl.pivot = intersect.point;
                }

                cameraControl.scene.intersectToWorld(intersect);

                intersect.innnerDebugging = event.altKey;
                intersect.cx = screenPos.x;
                intersect.cy = screenPos.y;

                sceneState.addSelection([userId]);

                dispatchPickEvent(intersect, true, canvasXY);
                cameraControl.updateView(true);
            }
            break;

        case 1:
            if (myCloud.EditorConfig.NoRotate) return;

            this._rotateStart.set(event.touches[0].clientX, event.touches[0].clientY);
            this.state = this.StateType.ROTATE;
            break;

        default:
            break;
    }

};

function loadCircleItems(data) {
    if (!data) {
        return;
    }
    initCircleData = data;
    initData = JSON.parse(data);
    if (!drawableContainer) {
        return;
    }
    if (viewType == 'DWGVIEW' || viewType == "DRAWINGVIEW") {
        drawableContainer.addItems(load2DItems(initData));
        return;
    }
    if (viewType == '3DVIEW') {
        load3DItems(JSON.parse(initCircleData), drawableContainer);
        return;
    }
}

function loadPinItems(data) {
    if (!data || !drawableContainer) {
        return;
    }
    initData = JSON.parse(data);
    var x = initData.drawingPositionX || initData.x;
    var y = initData.drawingPositionY || initData.y;
    if (!!x && !!y) {
        var config = new Glodon.Bimface.Plugins.Drawable.ImageConfig();
        config.src = window.imgSrc;
        config.worldPosition = {
            x,
            y,
        };
        var tag = new Glodon.Bimface.Plugins.Drawable.Image(config);
        drawableContainer.addItem(tag);
    }
}


function showSelectedComponent(data) {
    if (!data) {
        return;
    }
    initData = JSON.parse(data);
    if (!modelViewer) {
        return;
    }
    modelViewer.setSelectedComponentsById(initData);
    modelViewer.render();
}

function getSelectedComponentsEx(components) {
    if (!modelViewer) {
        return [];
    }
    let tempObj = modelViewer.getSelectedComponents();
    if (!Array.isArray(tempObj) && tempObj) {
        let rtnObj = [];
        components && Object.keys(components).map((property) => {
            rtnObj.push(property);
        });
        return rtnObj;
    }
    return components;
}

function getSelectedComponent() {
    if (!modelViewer) {
        return;
    }
    var result = {};
    var tempObj = getSelectedComponentsEx(modelViewer.getSelectedComponents());
    for (var i = 0; i < tempObj.length; ++i) {
        result = Object.assign(result, {
            elementId: tempObj[i],
            fileId: '',
            objectId: tempObj[i]
        });
    }

    if (window.modelEvent && window.modelEvent.getPosition) {
        if (isEmptyObject(result)) {
            window.modelEvent.getPosition("");
        } else {
            window.modelEvent.getPosition(JSON.stringify(result));
        }
    }
    return;
}

function getPositionInfo(obj) {
    if (!window.modelEvent || typeof modelEvent.getPositionInfo != 'function') {
        return 'modelEvent不存在';
    }
    if (window.modelEvent && window.modelEvent.getPositionInfo) {
        window.modelEvent.getPositionInfo(obj);
    }
    return;
}

function getPosition(obj) {
    if (!window.modelEvent || typeof modelEvent.getPosition != 'function') {
        return 'modelEvent不存在';
    }
    if (isEmptyObject(obj)) {
        return '无对应的位置信息';
    }
    if (window.modelEvent && window.modelEvent.getPosition) {
        window.modelEvent.getPosition(JSON.stringify(obj));
    }
    return;
}

function cancelPosition() {
    if (window.modelEvent && window.modelEvent.cancelPosition) {
        window.modelEvent.cancelPosition();
    }
    return;
}

function load2DMarkup(xdata) {
    var xdata = JSON.parse(xdata);
    var Viewer = modelViewer;
    if (typeof app == 'undefined') {
        window.tempAnnotation = {};
    } else {
        window.tempAnnotation = app;
    }
    if (!window.tempAnnotation.annotation) {
        var toolbarConfig = new Glodon.Bimface.Plugins.Annotation.AnnotationToolbarConfig();
        toolbarConfig.viewer = Viewer;
        var annotationToolbar = new Glodon.Bimface.Plugins.Annotation.AnnotationToolbar(toolbarConfig);
        window.tempAnnotation.annotation = annotationToolbar;
    }
    let annoList = window.tempAnnotation.annotation._annotationManager.jsonifyAnnotationList(xdata.obj);
    if (xdata.obj) window.tempAnnotation.annotation._annotationManager.setAnnotationList(annoList);
}


function loadMarkup(xdata) {
    if (!xdata) {
        return;
    }
    if (viewType == "DRAWINGVIEW" || viewType == "DWGVIEW") {
        load2DMarkup(xdata);
        return;
    }
    var filter = JSON.parse(xdata.filter);
    var Viewer = modelViewer;
    if (!filter.state) {
        xdata = Viewer.getViewer().convertAnnotationsToV3(xdata);
    }
    if (typeof xdata.camera == 'string') {
    }

    var viewer = modelViewer;
    if (typeof app == 'undefined') {
        window.tempAnnotation = {};
    } else {
        window.tempAnnotation = app;
    }
    if (!window.tempAnnotation.annotation) {
        var toolbarConfig = new Glodon.Bimface.Plugins.Annotation.AnnotationToolbarConfig();
        toolbarConfig.viewer = viewer;
        var annotationToolbar = new Glodon.Bimface.Plugins.Annotation.AnnotationToolbar(toolbarConfig);
        window.tempAnnotation.annotation = annotationToolbar;
    }
    if (xdata.cutting) {
        Viewer.setSectionBoxState(xdata.cutting);
        Viewer.disableSectionBox();
        Viewer.hideSectionBox();
    }
    if (xdata.filter) {
        Viewer.setState(JSON.parse(xdata.filter));
    }
    Viewer.setCameraStatus(filter.camera, () => {
        if (xdata.obj) window.tempAnnotation.annotation._annotationManager.setAnnotationList(xdata.obj);
        Viewer.render();
    });
}

function successCallback(viewMetaData) {
    var view = document.getElementById('model');
    var appConfig = "";
    viewType = viewMetaData.viewType.toUpperCase();
    if (viewType == "DWGVIEW") {
        appConfig = new Glodon.Bimface.Application.WebApplication2DConfig();
        appConfig.domElement = view;

        app = new Glodon.Bimface.Application.WebApplication2D(appConfig);
        app.load(viewToken);
        modelViewer = app.getViewer();
    } else if (viewType == "DRAWINGVIEW") {
        appConfig = new Glodon.Bimface.Application["WebApplicationDrawingConfig"]();
        appConfig.domElement = view;
        app = new Glodon.Bimface.Application.WebApplicationDrawing(appConfig);
        app.load(viewToken);
        modelViewer = app.getViewer();
    } else if (viewType == "3DVIEW") {

        // 注入处理，解决触屏不能选中问题，modify by soul 2018.12.26
        let myCloud = CLOUD;
        myCloud.PickEditor.prototype.processTouchend = extendProcessTouchend;

        appConfig = new Glodon.Bimface.Application.WebApplication3DConfig();
        appConfig.domElement = view;

        app = new Glodon.Bimface.Application.WebApplication3D(appConfig);
        app.addView(viewToken);
        modelViewer = app.getViewer();
    }

    if (!app) {
        return;
    }

    if (viewType == "DWGVIEW" || viewType == "DRAWINGVIEW") {

        var drawaleContainerConfig = new Glodon.Bimface.Plugins.Drawable.DrawableContainerConfig();
        drawaleContainerConfig.viewer = modelViewer;
        drawableContainer = new Glodon.Bimface.Plugins.Drawable.DrawableContainer(drawaleContainerConfig);
        var startTime, endTime, clientX, clientY;
        var domElement = modelViewer.getDomElement();
        if (viewType == "DWGVIEW") {
            var toolbar = app.getToolbar("MainToolbar");
            var leftSubToolBar = app.getToolbar("LeftSubToolbar");
            if (toolbar) {
                toolbar.hide();
            }
            if (leftSubToolBar) {
                leftSubToolBar.hide();
            }
        }

        view.addEventListener("touchstart", function (event) {
            startTime = new Date().getTime(),
                clientX = event.changedTouches[0].clientX,
                clientY = event.changedTouches[0].clientY;
        });

        view.addEventListener("touchend", function (event) {
            var offset = {};
            var x = event.changedTouches[0].clientX;
            var y = event.changedTouches[0].clientY;

            var viewer = self._dwgViewer,
                endTime = new Date().getTime(),
                position = domElement.getBoundingClientRect(),
                clientPosition = {
                    x: x - position.left,
                    y: y - position.top
                },
                worldPosition = modelViewer.clientToWorld(clientPosition);
            if (endTime - startTime > 300 && Math.abs(x - clientX) < 10 && Math.abs(y - clientY) < 10 && isShow == 'false') {
                removeDrawableItem();

                var config = new Glodon.Bimface.Plugins.Drawable.ImageConfig();
                config.src = window.imgSrc;
                config.draggable = true;


                config.worldPosition = worldPosition;
                var tag = new Glodon.Bimface.Plugins.Drawable.Image(config);

                drawableContainer.addItem(tag);
                getPosition(worldPosition);
            }

        });


        modelViewer.addEventListener(Glodon.Bimface.Application.WebApplication2DEvent.Loaded, function () {
            if (window.modelEvent && window.modelEvent.loadDotsData) {
                window.modelEvent.loadDotsData();
            }

            if (window.modelEvent && window.modelEvent.loadMarkup) {
                window.modelEvent.loadMarkup();
            }
        });
    } else if (viewType == "3DVIEW") {
        var drawaleContainerConfig = new Glodon.Bimface.Plugins.Marker3D.Marker3DContainerConfig();
        drawaleContainerConfig.viewer = modelViewer;
        drawableContainer = new Glodon.Bimface.Plugins.Marker3D.Marker3DContainer(drawaleContainerConfig);

        app.addEventListener(Glodon.Bimface.Application.WebApplication3DEvent.ViewAdded, function () {
            if (window.modelEvent && window.modelEvent.loadDotsData) {
                window.modelEvent.loadDotsData();
            }
            if (window.modelEvent && window.modelEvent.loadMarkup) {
                window.modelEvent.loadMarkup();
            }
        });

    }
}

function failureCallback(error) {
    if (window.modelEvent && window.modelEvent.invalidateToken) {
        window.modelEvent.invalidateToken();
        return;
    }
}; `
    }

    const load ={
        online: `var options = new BimfaceSDKLoaderConfig();
        options.viewToken = viewToken;
        BimfaceSDKLoader.load(options, successCallback, failureCallback);`,
    }

    export function getHtml(token, type, cmdString, show){
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <script src="${jssdk[type]}" charset="utf-8"></script>
    <title>App图纸选择</title>
    <style type="text/css">
        html,
        body {
            height: 100%;
            margin: 0;
            padding: 0
        }
        
        .bf-toolbar[title='主菜单'] {
            /* display: none; */
        }
        
        .bf-toolbar[title='ModelTree'] {
            /* display: none; */
        }
        * {
        -webkit-touch-callout:none;
        -webkit-user-select:none;
        -khtml-user-select:none;
        -moz-user-select:none;
        -ms-user-select:none;
        user-select:none;
      }
    </style>
</head>

<body>
    <div id="model" style="width:100%; height:100%;text-align:left;"></div>
    <script>
        window.viewToken="",
        window.imgSrc = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAABICAYAAACwc3YrAAAAAXNSR0IArs4c6QAABP9JREFUaAXtW09oHFUYf+/NbrbB0qSGZKNVD6KgWIUiiKCCFxEUFbKZTSQUg0IQPEjx4E0KCnqqQgWhwV6MuOtsGxEP4sWLB4UiFMFTRfDQZJO0sYlpO+nM+/ze7M7OzmR2M++9TWYCO4e8f9+f3+/73rz3ZmZDyAG/qAr+erlUAiBvAIEjhNCGDSCBLQpenXYZQ79NvYY+atiotjheq30mgylwmlBr1TSfdMC9lFBcWoxRY6JoWYtJFVlSQV/OBTjh1/ei5OBK2ZcmkDOMy3sB3LfJGJWyL01gpFK5hPNuyXfY05LSW+zw0E8yNqUJUEoBHZyVcZJUFgPz5ej585tJ5YWcNAGhZBwZ/hzXjr9EvWcXpauGkf9Y1p4SARElg+XL6MyWdRgnj1l1CYWp0Urlatx4tz4lAsLgaLX6O6P0VDfjSccowPv3fHvx56Ty7XLKBISRonXhC4ze3+0GZes4752x4098Kqvny2sRaBoZ842plLgi5NauXCmq6AodLQI3TPNuALhL1bmv59j2/X5dttQicJsxZcftQBnlyna0CABxlR23E8Bp9EB7W6auRQAXP2XHIZCcKAdCiwBQUHbcTkDHjhYB3Hx6QgCfA5TtaBEADcftGSAElKeiFgGq4ThEgNIizM3lQ30JG8oEcP3HTZQeS+inqxjaYssbG0q2lAmsnTw5jo6VohbHxiCO0n2gTEBn94wjAI7akqxMwNDYfGIJKK5oygS4xvafCQJEY/eMI6C6FyhnQGf3jCOguhcoERDHaFxCH48HotgL5MG110uPyGrjWp78gtOn2cqff8xxDh+h1khyzYSSlG4joDPFoyMf0nPnbibRSkxgdXr6XsfdrhIgzyYxrCVD6T8GYTNjlvXLbnYSEViannyeOryK53atx8fdwETGbUbYW8Va7etIf6i56z2wUi69RBz+4z6DFyALnPCFuln6IIQ40uiagSXTfJkQfpEADET09rVJCTvV6bV7RwLLU1PHCXd+7cVDuy5bfHXDCaOvjVdrP0RtxU6h9dnZYQS/mAXwArA4rRIO33hBjTCIJWDf3DiDSg9FZFNtIp7DhN+ZxzI0a3YQqJcnnsFjwmyqaDs4x89aTy+bZgjbDgKc07O44oRYdrCXSjcl/BNvije9hwjUTfMFnHFSn3j2m4VYzu2tzbd9vyECuO6+5w9kugTypo+vReDazMx9eLu/6A9kucTPuw+vTE8+JzC2CDjbt1/JMugoNu7ArOhrEeAEXo0KZbztZaC12ixPTqzjDTKccdAteAgc8FvdkJeBNdM8dpDACxZiqYf//j3hEXApf7RF7QBVcFN+zCOAJw2pb7NZ4QiMXvUIjFcu/IY/LPkqK8AS4LDxlzDzxYr1fesmFkrisdF13RHCGE4xnGfM8coBp9Fu9DXrzTFoG2vpGQ7wO+QdPHi9K3TEhUfi7wbxCQvy+YbtgQGvFGOwtRXq44VCMLa56dX5oUNeWRwcBLK+blPLcoVuTvzxr+aHZumPzb5+e1kvT15DAkEXkO2hmnU96OhNzZtCvTGVjpU+gXTiHnjtZyCIRTq1fgbSiXvgtZ+BIBbp1PoZSCfugdd+BoJYpFPrZyCduAde+xkIYpFOrZ+BTnEHvuNNx41Osjr9e5aBfKFQwyf5VQEOH+i3ckZuXgdoJ93QW4lOQqr94icJ+PP2p2ihcHl0YWFv/mlCFVxW9P4HnQN2SCnmLTYAAAAASUVORK5CYII=";
        window.marker3DRed = "data:image/png;base64,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";
        window.marker3DYellow = "data:image/png;base64,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";
        window.marker3DGreen = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAYAAADhAJiYAAAAAXNSR0IArs4c6QAACBBJREFUWAmtWEtvG9cVvq+Z0VCkaUqmXLOq4yR10YQFiqAwHARZqIsWXRRdFd4W3QRF/0KBCt7lJwRZZJOd0QZF0QJBsmEWDWw4rwKVU9RNKsuCUpm2KIqP4czcR8434mVIW7IrlxeQ5s7w3u/75txzzz1nODtBc87x6eFXr16dufe/ra+vO9/HlXM+cz/928P9IwGnB3kRnnxjY4O3m22+Nh60s9ObwWg0KgV5i36vb9Rds9ks7r3IJ4lTY9xHLtNCZkQ02yJ+kPLN5VU+6KZ8RAaYntzppm6xGrn4wbZjzTaJadsWDdi4slGII9xi+HHCZsA8sBdz5coVAWt8j6xwN+qKsyRi54s9Wa0Y3tGJLJdO8Tw1XGe2wFGhcEEkXX944GoqNt2edI3nl8wuiftOWrX/IuvBateuXbPgOkrUIxaCGCwPrNIkMRusLbJGXST3RoqARVCO5UjnMsxiNdCJUMIIMX4tmzM2SKUNbWxHLNdBWUCMSUxks0ZF18lazSazeFEsJaz1sKgZCz0s5saDbanSquS6L00UqtwNAz2UQXLp/NLghxd/ZirRT6yS32VcrBTWdfae0Obfspe+v/j32+/GN7f2VMnkAS/lMs20U2Wjo665vLxqNsb+Bd+aFjURdJQYs19SNu6rmKlgpHloz1bLu7+49Jo+VXqNBFQKEcf/66mD4Ztn/3zzTbHb7S8olyVM5yIpa3l6qI8TNSPo0JRtDstATCZFEPN+wCSLOj+6+Ez3lRffcEr84HgNj/7Ctf1H9cNbv6l9fPsOMyxNXDkPjc2nRcGnvJUEILx14MDwGSxTYRkSY5hb2Lv0woX9V19856RiCmx6AcwFBrDwgsAGB7jACZ+FBowvBKEDJ8ZuWmR1AZ/RtEywTHauVj24fPENJsZ+gsEnbTQXGMACJrDBAS5wgttDSnTIXOLWyi0xzNryfj8NlCQxuV1gzMa7v3z1t7Yc/9xPeOqrFCujby+bymdffiystCIKbXs4YMNg4LrPKHfngzus1Wo54U21RkyIM7FMBXaTtDxMnl1Z0UuVXz+1iIcmAguYwAYHuMAJbjRoKZYMJsN6IugJHUts7Txg4cGlF35K5isfDp/Df8ICJrDBAS5wgtsvWyEIjtWn4wARWJhUskAqafNQL5V/PAcZMxDABDY4wAVOcEMDBk6cGqbDcWCyQFG4UJbxwIbq2Rm0OdwAE9jgABc4we2hC0FrdIeDsjibhBZOSuWMUFaIM37gvK7ABDY4cuICJ7ihAU1ihzG2ye/uJcpYrbjLIooIC1y4+ODl7/+KfCg4HDqn/47p6s3P36bzLwu4zZ2TuUmZaVQi8wHttMJCPqfxp7YzjlvjBDdmb04yJjDABDY48NBzeg0TH5rMmOrINN+aup1LV46yx2IWgnyWh3wGrFxyJyS34e7+9bmomAIJ73WvAxsceOw5vQbhU8uFxbBIrjRFUWOFdVqYxRv//Bu3bjiF9391gQVMYIMDXEjowA1gaCks1KIbpJ3I9AKrLK2z5tLqeKfXCe7e/xMGz6MBC5jABge4wAnu1pigEIQ+ZXZF2inDHGefFszlJDc98+5Hf5DD9D/j8U99AQawgAlscIALqS64PXAhCHlueTlyyIGtjAzLjTYiyJhjqRxkB7W/fvQ616bjJ530irnAABYwC2ziABc4wQ0NwC0EIb9tsrpFQm5VYoq0M2cZ53pknR1Gd3e3zvzxw9+JQbp5UjGYg7nAABYwA8IGB7jACW5fLgmfqbWICaZDQo4c2AiXUaAYCcsT7mR/YWvvzrfeev/30Rf/fYcZlzxRGI3BWMzBXGAUWIQJbHCAC5zgRoOWIjjh2Ef6Wqt9SRVGRe5tfRUcKBfF1i5kXJUEMyVneNlxU2aWl029cqb30sWXs9Xll2wpPEfn0ykAikwfUFL1Vbj94NPKp7evy3bvPhOuDzGcqiPL5DB0epgIMTqlebp0/lwe7vRMp/Oc9WnspAyCyVqs7epUqqA6UKyTMyO4ZDk3lK8JSwkoxW4hRM7a/dHp9z75C73PexTTA07pJAQ5Zi1FsNzR+UPvO6KxSbFM1iVWyqHUOVmWp0ro3KmaGRDXZqPu1hqH1S0wCkEwFbVxdcnsjWjbiP0yT6TglAMz6TQ5u0M1qMmYOee0U5wIKT4EXNAhTEcBwIQUllEEk0zmpIw2BR9R/BuRdUbKORS5h0l+YrU+3SXfWbUoh9avrU9KoYmFAAgrUaLELjeZucG2WbhfYnlsHZVBjsogCmNcU3KVUQI6sjwPLBOB4FYwMgvmU1Ft6TSnqtTkggWFH1Kml8FnQkllEFkmJDHTFYd35mI+/ZsI8laiCgAJ/0RUlNYcJeQ2jEJDaad2Q0klqUwZRSsekk1ovRyFXQDSElnnhLUZBXvKqlhKwZh2U0gOzKlQjGmZYJnL/0uh6BXCwVGWIKVsjssiVAeb99oKOTDSTmR6SK6Qz6CU9nNxLY4DisAIeogz2NrYTRdW6ho+gy1+XNWK+RML4QbNW4q67vBjA7O1nZ6Lo9Qhszv82BDwDjv6Y8PizMcGTh8bVotITLupcGCIedzHhpm3KxSNRaGPiWtszWJbJmTmC2SA6vMm71Nesto4nwY8ToUJ01AujPCHPp7hN4zBWMzBXGAA63FiwPmIhfAQDZbCFbsPFywjOuRgLqGlvIB+NWI7A8TPb1qDDkrc0fcjVsZxQBtlje6xk/Dc46J/VJsBO2rA9DP41/T9ROT0Q+r7lMY/fpIIPw7XrwGDw0CqNQhJZAAAAABJRU5ErkJggg==";
        window.markerFacility3DRed = "data:image/png;base64,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";
        window.markerFacility3DYellow = "data:image/png;base64,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";
        window.markerFacility3DGreen = "data:image/png;base64,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";
        let viewToken = '${token}',
            drawableContainer = '',
            modelViewer = "",
            app = "",
            isShow = '${show}',
            initCircleData = '',
            viewType = '';
        ${cmdString}
        ${init(token, show)}
        ${load[type]}
    </script>
</body>
 </html> `
    }
        
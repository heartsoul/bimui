/* eslint-disable import/prefer-default-export */
/* eslint-disable no-prototype-builtins */

/**
 * redux 工具类
 * 1、reset 处理
 *  需要 reset 的 reducers，在 combine 到根reducer之前需要调用 composeResetReducer 方法，
 *  可以在模块导出 reducer 的时候统一调用。同一个模块如果想要更加细分的去reset的话，
 *  可以根据子模块分组调用 composeResetReducer，moduelName使用子模块的名字，
 *  例如列表的reducers可以一起调用，新建的可reducers以分成一组来调用。
 *
 *  dispatch moduleResetAction 方法重置当前模块的数据
 *  dispatch reducerResetAction 可以重置单一的一个reducer的数据
 *
 * 2、makeActionCreator 统一生成action创建函数
 *
 * 3、消息处理,AppMessageDispatcher 调用 dispatch 发送消息，消息格式为{text,type}
 *    dispatch 方法会自动为 message 添加 id，id是当前的时间戳
 *    需要先把 AppMessageDispatcher 的 reducer combine到App的根reducer中，
 *    在生成store的时候调用 AppMessageDispatcher.subscribe((message)=>{}) 监听消息变化，
 *    在 subscribe 的回调方法中处理消息
 */

/**
 * 重置模块下的数据
 * @param {*} moduleName 模块名字
 */
function generateModuleResetAction(moduleName) {
    return `ACTION_MODULE_${moduleName}_RESET`;
}

/**
 * 重置单个reducer的数据
 * @param {*} moduleName 模块名字
 */
function generateReducerResetAction(moduleName, reducerName) {
    return `ACTION_${moduleName}_${reducerName}_RESET`;
}

/**
 * 重置reducer，添加 module case 和 reducerName case
 * 分别处理module的reset和单独reducer的reset
 */
function resetReducer(state, action, initialState, reducerName, moduleName) {
    switch (action.type) {
        case generateModuleResetAction(moduleName):// 每个reducer的reset
        case generateReducerResetAction(moduleName, reducerName):// module的reset
            return initialState;
        default:
            return state;
    }
}

/**
 * 把 reset action 添加到每个reducer中
 * @param {*} reducers
 */
function composeResetReducer(reducers, moduleName) {
    const reducerKeys = Object.keys(reducers);
    const finalReducers = {};
    reducerKeys.forEach((reducerName) => {
        const reducer = reducers[reducerName];
        // 获取当前reducer返回的初始值，reducer 方法中参数 state 是 undefined 时，state 是默认值
        const initialState = reducer(undefined, {});

        // compose([a,b,c]) 返回一个方法 (...args)=>{a(b(c(...args)))}
        finalReducers[reducerName] = (state, action) => resetReducer(
            reducer(state, action),
            action,
            initialState,
            reducerName,
            moduleName,
        );
    });
    return finalReducers;
}

/**
 * 重置reducer的数据
 */
function reducerResetAction(moduleName, reducerName) {
    return {
        type: generateReducerResetAction(moduleName, reducerName),
    };
}

/**
 *重置module下的数据
 */
function moduleResetAction(moduleName) {
    return {
        type: generateModuleResetAction(moduleName),
    };
}

/**
 * reducer创建工具
 * @param {*} initialState
 * @param {*} handlers key(type名字)/value(reducer纯函数方法) 对象
 * eg：{[ActionTypes.Action_Name](state, action) { return newState; },}
 */
function createReducer(initialState, handlers) {
    return function reducer(state = initialState, action) {
        if (handlers.hasOwnProperty(action.type)) {
            return handlers[action.type](state, action);
        }
        return state;
    };
}

/**
 * action创建函数辅助类
 * @param {*} type action type
 * @param  {...any} argNames 要存储到store中的数据的名称
 * 每个模块可以统一创建一个actionCreators类，里面只放入纯粹的action函数，不做业务处理，
 * 这样可以更容易复用
 * eg：
    actionCreators.js

    export const types = {
        ACTION_A,
        ACTION_B,
    };
    export const actionA = makeActionCreator(types.ACTION_A, 'user');

    use:
    const user = {name:'a'};
    dispatch(actionA(user));
 */
function makeActionCreator(type, ...argNames) {
    return (...args) => {
        const action = { type };
        argNames.forEach((name, index) => {
            action[name] = args[index];
        });
        return action;
    };
}

/**
 * 消息处理器
 */
export const AppMessageDispatcher = {
    type: 'ACTION_APP_MEASSAGE',
    dispatch: (text, type) => {
        if (AppMessageDispatcher.store) {
            const id = new Date().getTime();
            AppMessageDispatcher.store.dispatch({
                type: AppMessageDispatcher.type,
                message: { text, type, id },
            });
        } else {
            console.log('you need to invoke subscribe first');
        }
    },
    reducer: {
        appMessage: (state = { message: {} }, action) => {
            switch (action.type) {
                case AppMessageDispatcher.type:
                    return { ...state, message: action.message };
                default:
                    return state;
            }
        },
    },
    currentMessageId: 0,
    subscribe: (store, callback) => {
        AppMessageDispatcher.store = store;
        store.subscribe(() => {
            const previousValue = AppMessageDispatcher.currentMessageId;
            const state = store.getState();
            AppMessageDispatcher.currentMessageId = state.appMessage.message
                ? state.appMessage.message.id : 0;
            if (AppMessageDispatcher.currentMessageId
                && previousValue !== AppMessageDispatcher.currentMessageId) {
                if (callback) {
                    callback(state.appMessage.message);
                }
            }
        });
    },
};

export const GLDRedux = {
    composeResetReducer,
    reducerResetAction,
    moduleResetAction,
    createReducer,
    makeActionCreator,
};

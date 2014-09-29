/**
 * Created by taddeng on 2014/8/8.
 */
/**
 * @name event
 * @description dom无关事件处理类
 * @module event
 */
define(function (require, exports, module) {
    var klass = require('./klass'),
        slice = [].slice;

    /** @ignore
     */
    function _callEvent(callbacks, args) {
        for (var i = 0, j = callbacks.length; i < j; ++i) {
            callbacks[i].apply(null, args);
        }
    }

    /**
     * @constructor
     * @alias module:event
     * @requires klass
     */
    var Event = module.exports = klass(null,
        /** @lends Event.prototype */
        {
            /** @constructs */
            __construct: function () {
                this._callbacks = {};//事件列表
            },
            /**
             * @param {String} event 事件名称
             * @param {Function} callback 事件处理函数
             * @returns {Object} 当前处理器对象以便链式调用
             */
            on: function (event, callback) {
                (this._callbacks[event] || (this._callbacks[event] = [])).push(callback);
                return this;
            },
            /**
             *
             * @param {String} event 事件名称
             * @returns {Object} 当前事件处理器实例用于链式调用
             */
            emit: function (event) {
                var args = slice.call(arguments, 1);
                var callbacks;
                if (callbacks = this._callbacks[event]) {
                    _callEvent(callbacks, args);
                    return this;
                }
                if ((callbacks = this._onceCallbacks) && (callbacks = callbacks[event])) {
                    _callEvent(callbacks, args);
                    (delete this._onceCallbacks[event]) && (this._onceCallbacks[event] = null);
                    return this;
                }
            },
            /**
             *
             * @param {String} event 要卸载的事件处理器名称
             * @param {Function} [func] 指定要卸载的事件函数，如果为空会卸载当前名字的所有事件处理器
             * @returns {Object} 当前处理器实例用于链式调用
             */
            off: function (event, func) {
                var callbacks, index;
                if (!func) {
                    this._callbacks[event]&&((delete this._callbacks[event]) || (this._callbacks[event] = null));
                    this._onceCallbacks[event]&&((delete this._onceCallbacks[event])||(this._onceCallbacks[event]=null));
                    return this;
                }
                callbacks = this._callbacks[event] || this._onceCallbacks[event];
                callbacks && (index = callbacks.indexOf(func)) && (callbacks.splice(index, 1));
                return this;
            },
            /**
             *
             * @param {Object} event 当前要注册的事件名称
             * @param {Function} callback 要注册的事件处理器
             * @returns {Object} 当前处理器实例,用于链式调用
             */
            once: function (event, callback) {
                this._onceCallbacks = this._onceCallbacks || {};
                (this._onceCallbacks[event] || (this._onceCallbacks[event] = [])).push(callback);
                return this;
            }
        });
});
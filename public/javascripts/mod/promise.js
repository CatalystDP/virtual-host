/**
 * @name promise
 * @description 简易Promise模块
 * @module promise
 */
define(function (require, exports, module) {
    var _slice = [].slice;

    /**
     * @constructor
     * @alias module:promise
     * @param {successCallback} successFn 成功调用的函数
     * @param {failCallback} [failFn] - 失败调用的函数
     * @example
     * var promise=new Promise(function(next,c){
     * console.log('correct'+c)
     * next.resolve('correct');
     * //next.reject('error');
     * },
     * [function(e){console.log('error'+e)}]);
     * promise.then(function(next,c){console.log(c)},
     * function(e){console.log(e)}).then(function(c){console.log(c)},function(e){console.log(e);});
     * promise.resolve('123');
     */
    function Promise(successFn, failFn) {

        if (!this instanceof Promise) {
            return new Promise(successFn, failFn);
        }
        this._success = successFn;
        this._fail = failFn;
    }


    Promise.prototype =
    {
        /**
         *@callback successCallback
         * @param {Object} [next] - 指向下一个Promise 实例
         * @param {*} arg1,arg2,.... 后面可以有任意数量及类型的参数
         */
        /**
         * @callback failCallback
         * @param {*} args1,args2,.....后面可以有任意数量及类型的参数
         */
        /**
         *
         * @param {successCallback} successFn
         * @param {failCallback} failFn
         * @returns {Promise} 新Promise实例，为当前实例的下一个
         */
        then: function (successFn, failFn) {
            return this.next = new Promise(successFn, failFn);
        },
        /**
         * @param {*} arg1,arg2,... 可以接受任意数量类型的参数，视then函数中successFn的参数而定
         */
        resolve: function () {
            var args = _slice.call(arguments);
            this.next && args.unshift(this.next);
            this._success.apply(null, args);
        },
        /**
         * @param {*} arg1,arg2,... 可以接受任意数量类型的参数，视then函数中failFn的参数而定
         */
        reject: function () {
            var args = _slice.call(arguments);
            this._fail.apply(null, args);
            this.next && (this.next = null);
        },
        constructor: Promise
    };
    module.exports = Promise;
});

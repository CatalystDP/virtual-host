/**
 * @name 模拟类行为的组件
 * @description 模拟类行为的函数
 * @module klass
 */
define(function (require, exports, module) {
    var slice = [].slice;

    /**
     * @alias module:klass
     * @param {Function|null} Parent 用于继承的父构造函数无父类就传入null
     * @param {Object} props 成员函数
     * @param {Function} [props.__construct] - 构造函数，如果有父类构造函数内部必须手动调用构造函数
     * @return {Function} 一个类
     * @example
     * var parent=klass(null,{__construct:function(){}});
     * var child=klass(parent,{__construct:function(){klass.parent(child,'__construct',this,aruments)}});
     */

    var _klass = function (Parent, props) {
        var Child, i;
        var F;
        /** 传入参数为可变参数*/
        /**
         *
         * @ignore
         */
        Child = function () {
	        var Child=arguments.callee;
            var __proto = Child.prototype,
                parent = Child.parent;
            if (__proto.hasOwnProperty("__construct")) {
                __proto.__construct.apply(this, arguments);
            } else {
                if (parent && parent.hasOwnProperty("__construct")) {
                    parent.__construct.apply(this, arguments);
                    /**Child.parent指向parent的原型*/
                }
            }
        };
        /**构造函数内判断__construct*/
        /**
         *
         * @ignore
         */
        Parent = Parent || Object;
        if (Parent !== Object) {
            if (typeof Parent == "object") {
                F = function () {
                };
                F.prototype = Parent;
                Child.prototype = new F();
                Child.parent = Parent;
            } else if (typeof Parent == "function") {
                F = function () {
                };
                F.prototype = Parent.prototype;
                Child.prototype = new F();
                Child.parent = Parent.prototype;

            }
        }
        /**继承*/
        Child.prototype.constructor = Child;

        for (i in props) {
            if (props.hasOwnProperty(i))
                Child.prototype[i] = props[i];
        }
        //释放Child闭包引用的外部对象
        F=i=Parent=props=null;
        return Child;
    };
    /**
     * @description 用于扩展实例对象
     * @param {Function} Child 要被扩展的构造函数
     * @param {Function|Object} parent 原始的父类可以是构造函数或对象
     */
    _klass.extend = function (Child, parent) {
        var toString = Object.prototype.toString;
        var proto = Child.prototype,
            p;
        if (toString.call(parent) == "[object Object]")
            for (p in parent) {
                if (parent.hasOwnProperty(p))
                    proto[p] = parent[p];
            }
        if (typeof parent == "function") {
            var _p = parent.prototype;
            for (p in _p) {
                proto[p] = _p[p];
            }
        }
    };
    /**
     * @description 用于调用父类的函数,前三个参数为必须的后面的参数为调用函数的所需要的参数
     * @param {Function} curClass 当前类(构造函数)
     * @param {Function} func 要调用的函数
     * @param {Object} context 上下文,指向当前对象行为同this
     * @param {*} [arguments={}] 默认是没有参数
     */
    _klass.parent = function (curClass, func, context) {
        var args, l;
        if ((l = arguments.length) < 3) {
            throw new Error('At least 3 arguments should be provided but ' + l + ' provided');
        }
        args = slice.call(arguments, 3);
        if (curClass.parent) {
            curClass.parent[func].apply(context, args);
            return true;
        }
        return false;
    };
    module.exports = _klass;
});

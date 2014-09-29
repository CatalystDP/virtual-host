/**
 * @name widget
 * @description 所有ui空间的祖先
 * @module widget
 */
define(function (require, exports, module) {
    var klass = require('../mod/klass');
    var $ = require('../lib/jquery-1.10.2.min');
    var base = require('./base');
    /**
     * @constructor
     * @alias module:widget
     * @requires klass
     * @requires base
     * @requires jQuery
     */
    var slice = [].slice;

    var DATA_WIDGET_CID = 'data-widget-cid';
    var Widget = module.exports = klass(base,
        /**@lends Widget.prototype*/
        {
            /**
             * @constructs
             * @param {String} [option.template='<div></div>'] 模板，默认模板是'&ltdiv&gt&lt/div&gt'
             * @param {String|Array} [option.inlineId=null] 指定内联模板的id，当传入时会自动去内联模板获取内容,当传入为数组时会按顺序拼接模板
             * @param {String|jQueryObject} [option.elment=null] 直接传入dom对象或选择器
             * @param {String} [option.position='body:append'] 在元素的某个位置插入当前元素,格式为‘选择器:[索引]:位置,当选择器为类选择器时
             * 可以加入索引, 位置after、before、append
             * @param {Object} [option.events={}] 要注册的事件表
             * @param {Object} [option.attrs={}] 要赋予元素的属性,建议键和值都加上引号。
             * @example
             * new Widget({
             *      position:'.class:0:after',
             *      element:$('#id')
             * });
             * */
            __construct: function (option) {
                var defaultOption = {
                    position: 'body:append',
                    template: '<div></div>',
                    inlineId: null,
                    element: null,
                    events: null,
                    attrs: {}
                };
                option = option ? $.extend(defaultOption, option) : defaultOption;
                _init.call(this, option);
                this._stamp();
            },
            /**
             * @method
             * @description 根据this.element构建好element
             */
            parseElement: function () {
                if ($.type(this.element) == 'string') {
                    this.element = $(this.element);
                    _setDom(this.element, this.position);
                }
            },
            /**
             * @method
             * @description 根据this.template渲染好element
             */
            parseTemplateElement: function () {
                if (!this.template) {
                    throw new Error('cannot render widget!!');
                    return;
                }
                var tpl = this.template;
                var element = this.element = $(this.toDom(tpl));
                _setDom(element, this.position);
            },
            /**
             * @description 有两种方式去注册事件,见示例
             * @returns {boolean}
             * @example
             * widget.delegateEvents({'click:.panel':function(){}})
             * widget.delegateEvents('click:.panel',function(){});
             */
            delegateEvents: function () {
                try {
                    var args = slice.call(arguments, 0),
                        length = args.length,
                        ele = this.element;

                    if (length == 1 && $.isPlainObject(args[0])) {
                        args = args[0];
                        $.each(args, function (key, func) {
                            _delegateEvents(ele, key, func);
                        });
                    }
                    else if (length == 2 && $.type(args[0])=='string' && $.isFunction(args[1])) {
                        _delegateEvents(ele, args[0], args[1]);
                    }
                    else {
                        throw new Error('arguments illegal!!');
                    }
                }
                catch (e) {
                    console.log(e);
                    return false;
                }
                return true;
            },
            /**
             * @description  有四种方式对事件进行解除绑定
             * @returns {boolean}
             * @example
             * widget.undelegateEvents({'click:selector':func});这种方式是精确到事件处理函数进行解绑的
             * widget.undelegateEvents('click:selector');这种方式会解绑全部事件处理器
             * widget.undelegateEvents(['click:selector','mousemove:selector'])这种方式会依次解绑事件
             * widget.undelegateEvents();不传参数的时候，解绑所有事件
             */
            undelegateEvents: function () {
                try {
                    var args = slice.call(arguments, 0),
                        length = args.length,
                        parent = this.element;
                    if (length == 0) {
                        _undelegateEvents(parent);
                    }
                    else if (length == 1) {
                        args = args[0];
                        if ($.isPlainObject(args)) {
                            $.each(args, function (key, item) {
                                _undelegateEvents(parent, key, item);
                            });
                        }
                        else if ($.isArray(args)) {
                            $.each(args, function (key,item) {
                                _undelegateEvents(parent, item);
                            });
                        }
                        else if ($.type(args)=='string') {
                            _undelegateEvents(parent, args);
                        }
                    }
                    else if (length == 2 && $.type(args[0])=='string' && $.isFunction(args[1])) {
                        _undelegateEvents(parent, args[0], args[1]);
                    }
                    else {
                        throw new Error('arguments illegal!');
                    }
                }
                catch (e) {
                    console.log(e);
                    return false;
                }
                return true;
            },
            /**
             * @description 在当前父元素下查找子元素,并且对已选中的dom对象进行了缓存
             * @param {String} selector - 选择器
             * @param {Bool} cache 清除缓存,此时不会返回元素
             */
            $: function (selector,cache) {
                cache === undefined && (cache = true);
                var selectorStore = this.selectorStore || (this.selectorStore = {});
                if (cache && selectorStore[selector]) {
                    return selectorStore[selector];
                }
                if(!cache && selectorStore[selector]){
                    (delete selectorStore[selector]) || (selectorStore[selector]=null);
                    return;
                }
                var ele = this.element;
                var finded = ele.find(selector);
                selectorStore[selector] = finded;
                return finded;
            },
            /**
             * @method
             * @description 获取当前widget的总元素
             * */
            getElement: function () {
                return this.element;
            },
            /**
             * @descrption 渲染好this.element 由于dom结构变化，会解绑调所有事件
             * @param {Object} options 选项同构造函数
             */
            reRender: function (options) {
                var whiteList = ['cid', 'parentNode', 'position'];
                var self = this;
                var op = {}, index;
                this.undelegateEvents();
                this.getElement().remove();
                $.each(this, function (key, value) {
                    if (self.hasOwnProperty(key)) {
                        index = $.inArray(key, whiteList);
                        index == -1 && (self[key] = null);
                        index != -1 && (op[key] = value);
                    }
                });
                options = $.extend(op, options);
                _init.call(this, options);
                this.getElement().attr(DATA_WIDGET_CID, this.cid);
            },
            /**
             * @description 销毁对象上所有属性,事件和dom
             */
            destory: function () {
                var self = this;
                this.undelegateEvents();
                this.element.remove();
                (delete cachedInstances[this.cid]) || (cachedInstances[this.cid] = null);
                $.each(this, function (key,value) {
                    if (self.hasOwnProperty(key)) {
                        (delete self[key]) || (self[key] = null);
                    }
                });
            },
            /**
             * @description 生成实例id
             * @private
             */
            _stamp: function () {
                var cid = this.cid = uniqueId();
                this.element.attr(DATA_WIDGET_CID, cid);
                cachedInstances[cid] = this;
            }
        });
    Widget.query = function (selector) {
        var element = $(selector).eq(0),
            cid;
        element && (cid = element.attr(DATA_WIDGET_CID));
        return cachedInstances[cid];
    };
    function _setDom(element, position) {
        var pos = position.split(':'),
            length = pos.length,
            relativeEle,
            i,
            method;
        if (length != 2 && length != 3) return;
        if (length == 2) {
            relativeEle = $(pos[0]);
            method = pos[1];
        }
        if (length == 3) {
            relativeEle = $(pos[0]);
            i = parseInt(pos[1]);
            method = pos[2];
        }
        var fragMent = document.createDocumentFragment();
        $.each(element, function (index, item) {
            fragMent.appendChild(item);
        });

        i != undefined ? $(relativeEle[i])[method](fragMent) : relativeEle[method](fragMent);
    }

    function _init(option) {
        this.element = option.element;
        this.inlineId = option.inlineId;
        this.template = option.template;
        this.position = $.type(option.position) ? option.position : 'body:append';
        this.attrs = option.attrs;
        this.element && this.parseElement();
        this.inlineId && (this.template = this.getInlineTpl(this.inlineId)) && this.parseTemplateElement();
        !this.element && !this.inlineId && this.parseTemplateElement();
        _initAttrs.call(this);
        option.events && this.delegateEvents(option.events);
        this.parentNode = this.getElement().parent();
    }

    function _initAttrs() {
        var ele = this.getElement(),
            attrs = this.attrs;
        ele.attr(attrs);
    }

    /**
     * @param {ZeptoObject} parent - 等价于this.element
     * @param {String} name 事件与被代理元素选择器的字符串拼接用冒号分割 e.g 'click:#id'
     * @param {Function} func 事件处理函数
     * @private
     */
    function _delegateEvents(parent, name, func) {
        var t = name.split(':'),
            eventType = t[0],
            targetEle = t[1];
        targetEle !== undefined ? parent.on(eventType, targetEle, func) : parent.on(eventType, func);
    }

    function _undelegateEvents(parent, name, func) {
        if (name != undefined) {
            var t = name.split(':'),
                eventType = t[0],
                targetEle = t[1];
            if (eventType && targetEle) {
                func && $.isFunction(func) ? parent.off(eventType, targetEle, func) : parent.off(eventType, targetEle);
            }
            if (eventType && !targetEle) {
                func && $.isFunction(func) ? parent.off(eventType, func) : parent.off(eventType);
            }
        } else {
            parent.off();
        }
    }

    var cachedInstances = {};
    var count = 0;

    function uniqueId() {
        return 'widget-' + (count++);
    }


});
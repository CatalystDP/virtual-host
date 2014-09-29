define('dp_mz',['jQuery'],function(require,exports,module){
    var $=require('jQuery');
    (function(root, $) {
        if (!$) {
            alert("jQuery未加载");
            return;
        }
        var dm = root.dm = function() {}; //向全局对象添加dm属性
        if (!root.Object.create)
            dm.create = function(o) {
                var F = function() {};
                F.prototype = o;
                return new F();
            };
        else
            dm.create = root.Object.create; //对象生成器
        (function() {
            dm.klass = function(Parent, props) {
                var Child, i;
                var F;
                Child = function() {
                    /*Child函数内必须手动调用构造函数*/
                    if (Child.prototype.hasOwnProperty("__construct")) {
                        Child.prototype.__construct.apply(this, arguments);
                    } else {
                        if (Child.superKlass && Child.superKlass.hasOwnProperty("__construct")) {
                            Child.superKlass.__construct.apply(this, arguments);
                            //Child.superKlass指向parent的原型
                        }
                    }
                };
                //构造函数内判断__construct
                Parent = Parent || Object;
                if (Parent !== Object) {
                    if (typeof Parent == "object") {
                        F = function() {};
                        F.prototype = Parent;
                        Child.prototype = new F();
                        Child.superKlass = Parent;
                    } else if (typeof Parent == "function") {
                        F = function() {};
                        F.prototype = Parent.prototype;
                        Child.prototype = new F();
                        Child.superKlass = Parent.prototype;

                    }
                }
                //    继承
                Child.prototype.constructor = Child;
                //    将props中的属性放到Child原形中
                for (i in props) {
                    if (props.hasOwnProperty(i))
                        Child.prototype[i] = props[i];
                }
                return Child;
            };
            dm.klass.extend = function(currentClass, ex) {
                var toString = Object.prototype.toString;
                var proto = currentClass.prototype,
                    p;
                if (toString.call(ex) == "[object Object]")
                    for (p in ex) {
                        if (ex.hasOwnProperty(p))
                            proto[p] = ex[p];
                    }
                if (typeof ex == "function") {
                    var _p = ex.prototype;
                    for (p in _p) {
                        proto[p] = _p[p];
                    }
                }
            };
        })();
        (function() {
            /*
             */
            var e = dm.event = {};
            e.create = function() {
                return new EventsHandler(); //内置一个dom无关事件处理
            };

            function EventsHandler() {
                this._callbacks = {}; //事件表
            }

            var ep = EventsHandler.prototype;
            ep.on = function(event, callback) {
                /*
                 @param string event 事件名称，如果要以命名空间形式，分隔符为:
                 例如a:b:c
                 @param function callback 事件触发后的回调函数*/
                (this._callbacks[event] || (this._callbacks[event] = [])).push(callback);
                return this;
            }; //注册一个事件
            ep.emit = function() {
                /*
                 @param string arguments[0]  事件名称，如果要以命名空间形式，分隔符为:
                 例如a:b:c
                 @param function arguments[1]... 传入事件处理函数的参数*/
                var args = Array.prototype.slice.call(arguments, 0),
                    ev = args.shift();
                var list;
                if (!(list = this._callbacks[ev])) return this;
                for (var i = 0, j = list.length; i < j; i++)
                    list[i].apply(null, args);
                return this;
            }; //触发一个事件
            ep.off = function(events) {
                var c = this._callbacks;
                if (!events) {
                    for (var p in c)
                        delete c[p];
                    return this;
                } //删除所有事件
                if (Object.prototype.toString.call(events) == "[object Array]")
                    for (var i = 0, j = events.length; i < j; i++) {
                        delete c[events[i]];
                    } //移除列表中指定事件
                if (typeof events == "string")
                    delete c[events];
                return this;
            }; //移除一个事件
        })(); //Events类
        (function() {
            dm.SandBox = function() {
                /*
                 * 参数至少包含一个factory函数，
                 * 且factory至少包含一个参数用于导出，放在最后面*/
                var args = Array.prototype.slice.call(arguments, 0),
                    callback,
                    length = args.length;
                if (length == 1) {
                    //此时是有factory参数为一个无参匿名函数
                    callback = args.pop();
                    return callback.call(null);
                } else if (length == 2 && (Object.prototype.toString.call(args[0]) == "[object Array]")) {
                    callback = args.pop();
                    return callback.apply(null, args[0]);
                } else {
                    callback = args.pop();
                    return callback.apply(null, args);
                }
            };
        })(); //沙箱类
        var r = {
            addRouter: function(name, factory) {
                /*
                 * @param String name 路由名称
                 * @param Function factory 路由函数;
                 该函数需要形参context：对当前this的引用
                 * @return Object this 返回当前对象;
                 * */
                var routerStore = this.routerStore;
                var SandBox = dm.SandBox;
                var args = Array.prototype.slice.call(arguments, 0);
                var i, j, currentList;
                if (args.length == 1 && (Object.prototype.toString.call(args[0]) == "[object Object]")) {
                    for (var p in args[0]) {
                        routerStore[p] = SandBox(this, args[0][p]);
                    }
                    return this;
                } //
                if (args.length == 2) {
                    routerStore[name] = SandBox(this, factory);
                    return this;
                }
            }, //
            removeRouter: function() {
                var p, routerStore = this.routerStore,
                    tmp;
                if (arguments.length == 0) {
                    for (p in routerStore)
                        delete routerStore[p];
                    return this;
                } //没有参数时删除所有ROUTER
                var args = Array.prototype.slice.call(arguments),
                    length = args.length;
                if ((Object.prototype.toString.call(args[0]) == "[object Array]"))
                    tmp = args[0];
                if (length >= 1 && (typeof args[0] == "string"))
                    tmp = args;
                for (var i = 0, j = tmp.length; i < j; i++)
                    delete routerStore[tmp[i]];
                return this;
            } //父ROUTER，需要被view,controller,model继承
        };
        (function() {
            var Controller = dm.klass(r, {
                __construct: function(config) {
                    /*
                     * @param Object config 配置，
                     * 格式:{[optional,Object]domStore,[optional,Object]events}*/
                    var configEv;
                    this.domStore = config ? (config.domStore ? config.domStore : {}) : {};
                    this.routerStore = {}; //存放router名与内部沙箱导出对象映射
                    var ev = this.events = dm.event.create();
                    if (config)
                        if (config.events) {
                            configEv = config.events;
                            for (var p in configEv)
                                ev.on(p, configEv[p]);
                        }
                },
                addDom: function() {
                    var args = Array.prototype.slice.call(arguments, 0);
                    var p;
                    if ((args.length == 1) && (typeof args[0] == "object")) {
                        for (p in args[0])
                            this.domStore[p] = args[0][p];
                    }
                    if (args.length == 2)
                        this.domStore[args[0]] = args[1];
                    return this;
                },
                removeDom: function() {
                    var args = Array.prototype.slice.call(arguments, 0),
                        d = this.domStore;
                    if (arguments.length == 0) {
                        for (var p in d)
                            delete d[p];
                        return this;
                    }
                    var i, j, tmp;

                    if ((Object.prototype.toString.call(args[0]) == "[object Array]")) {
                        tmp = args[0];
                        for (i = 0, j = tmp.length; i < j; i++)
                            delete d[tmp[i]];
                    }
                    if (args.length >= 1 && (typeof args[0] == "string")) {
                        for (i = 0, j = args.length; i < j; i++)
                            delete d[args[i]];
                    }
                    return this;
                },
                addEvent: function() {
                    var args = Array.prototype.slice.call(arguments, 0);
                    var p, ev = this.events;
                    if (args.length == 1 && (typeof args[0] == "object"))
                        for (p in args[0])
                            ev.on(p, args[0][p]);
                    if (args.length == 2) {
                        if ((typeof args[0] == 'string') && (typeof args[1] == "function"))
                            ev.on(args[0], args[1]);
                    }
                    return this;
                },
                removeEvent: function() {
                    if (arguments.length == 0) {
                        this.events.off();
                        return this;
                    }
                    var args = Array.prototype.slice.call(arguments, 0),
                        length = args.length;
                    var ev = this.events;
                    if (length == 1 && (Object.prototype.toString.call(args[0]) == "[object Array]")) {
                        ev.off(args[0]);
                        return this;
                    }
                    if (length == 1 && (typeof args[0] == 'string')) {
                        ev.off(args[0]);
                        return this;
                    }
                    if (length > 1) {
                        ev.off(args);
                        return this;
                    }
                }
            });
            dm.Controller = Controller;
        })(); //Controller类
        (function() {
            /*
             * model要使用事件之前必须与至少一个控制器绑定*/
            var Model = dm.klass(r, {
                __construct: function(request) {
                    /*
                     * @param Object request 请求函数存储{funcName:'',func:function(){}}*/
                    this.events = undefined;
                    this.record = {};
                    this.routerStore = {}; //提供路由存储
                    this.requestStore = request || {};
                },
                addRecord: function() {
                    var args = Array.prototype.slice.call(arguments, 0),
                        length = args.length;
                    var record = this.record;
                    if (length == 1 && (Object.prototype.toString.call(args[0]) == "[object Object]")) {
                        for (var p in args[0])
                            record[p] = args[0][p];
                        return this;
                    }
                    if (length == 2 && (typeof args[0] == "string")) {
                        record[args[0]] = args[1];
                        return this;
                    }
                },
                removeRecord: function() {
                    var p, record = this.record,
                        args, length, i, j;
                    if (arguments.length == 0) {
                        for (p in record)
                            delete record[p];
                        return this;
                    }
                    args = Array.prototype.slice.call(arguments, 0);
                    length = args.length;
                    if (length == 1 && (Object.prototype.toString.call(args[0]) == "[object Array]")) {
                        for (i = 0, j = args[0].length; i < j; i++)
                            delete record[args[0][i]];
                        return this;
                    }
                    for (i = 0, j = args.length; i < j; i++)
                        delete record[args[i]];
                    return this;
                },
                fetchData: function(options) {
                    /*options:{reqWay:"get/post",reqUrl:"url",
                     reqData:"data",
                     reqDone:function(){},
                     reqFail:function(){},
                     reqAlways:function(){}
                     }*/
                    var way = eval("$." + options.reqWay.toLowerCase()),
                        req;
                    req = options.reqData !== undefined ? way(options.reqUrl, options.reqData) : way(options.reqUrl);
                    //req=way(options.reqUrl,options.reqData);
                    req.
                        done(options.reqDone || function() {}).
                        fail(options.reqFail || function() {}).
                        always(options.reqAlways || function() {});
                },
                addRequest: function() {
                    var args = Array.prototype.slice.call(arguments, 0);
                    var requestStore = this.requestStore;
                    if (args.length == 1 && (Object.prototype.toString.call(args[0]) == "[object Object]")) {
                        for (var p in args[0])
                            requestStore[p] = args[0][p];
                        return this;
                    }
                    if (args.length == 2 && (typeof args[0] == "string")) {
                        requestStore[args[0]] = args[1];
                        return this;
                    }

                },
                removeRequest: function() {
                    var requestStore = this.requestStore;
                    var args, length, tmp;
                    if (arguments.length == 0) {
                        for (var p in requestStore)
                            delete requestStore[p];
                        return this;
                    }
                    args = Array.prototype.slice.call(arguments, 0);
                    length = args.length;
                    if ((Object.prototype.toString.call(args[0]) == "[object Array]")) {
                        tmp = args[0];
                    }
                    if (length >= 1 && (typeof args[0] == "string"))
                        tmp = args;
                    for (var i = 0, j = tmp.length; i < j; i++) {
                        delete requestStore[tmp[i]];
                    }
                    return this;
                },
                useRequest: function(name) {
                    /*@param必须提供name*/
                    var args = Array.prototype.slice.call(arguments, 0);
                    args.shift();
                    this.requestStore[name].apply(this, args);
                    return this;
                }
            });
            dm.Model = Model;
        })(); //Model类
        (function() {
            var View = dm.klass(r, {
                __construct: function() {
                    /*
                     * @param render Object 渲染器 格式:{name:'',}*/
                    this.routerStore = {};
                    this.renderStore = {};
                    this.events = undefined; //使用事件之前绑定一个控制器
                },
                addRender: function() {
                    /*
                     * 1、@param Array [{name:string,render:function(selector,data){}}...]
                     * 2、@param string 渲染器名称
                     *    @param function 函数名*/
                    var args = Array.prototype.slice.call(arguments, 0);
                    var renderStore = this.renderStore;
                    var t;
                    if (Object.prototype.toString.call(args[0]) == "[object Object]") {
                        t=args[0];
                        for(var p in t){
                            if(t.hasOwnProperty(p)){
                                renderStore[p]=t[p];
                            }
                        }
                        return this;
                    }
                    if (args.length == 2) {
                        renderStore[args[0]] = args[1];
                        return this;
                    }
                },
                removeRender: function() {
                    var args, length;
                    var renderStore = this.renderStore;
                    var tmp;
                    if (arguments.length == 0) {
                        for (var p in renderStore)
                            delete renderStore[p];
                        return this;
                    }
                    args = Array.prototype.slice.call(arguments, 0);
                    length = args.length;
                    if (Object.prototype.toString.call(args[0]) == "[object Array]")
                        tmp = args[0];
                    if (length >= 1 && (typeof args[0] == "string"))
                        tmp = args;
                    for (var i = 0, j = tmp.length; i < j; i++)
                        delete renderStore[tmp[i]];
                    return this;
                },
                useRender: function(name) {
                    /*
                     * @param String name 必须提供的渲染器的名称
                     * */
                    var args = Array.prototype.slice.call(arguments, 0),
                        length;
                    args.shift(); //去除第一个参数
                    length = args.length;
                    if (length == 1 && (typeof args[0] == "object")) {
                        this.renderStore[name].call(this, args[0].selector, args[0].data);
                    } //第二个参数为对象，包含selector与data两个属性
                    if (length == 2) {
                        this.renderStore[name].call(this, args[0], args[1]);
                    } //第二个参数为selector，第三个参数为data
                    return this;
                }
            });
            dm.View = View;

        })(); //view类

        (function() {
            dm.connect = function(controller, vom) {
                /*@param[must] object controller 必须提供的参数
                 *@param[must] object vom view or model 必须提供的参数
                 *@param[optional] array 事件列表，支持以命名空间形式
                 * e.g:   a:b:c   or a:*(用来选择命名空间下所有事件)
                 */
                /*
                 当参数只有controller 和 vom 时为默认绑定整个事件表，
                 当指定第三个参数为数组或传入3个以上的字符串列表作为参数时，
                 绑定列表指定的事件
                 */
                var args, t, length;
                var i, j;
                if (arguments.length < 2)
                    return false;
                if (arguments.length > 2) {
                    args = Array.prototype.slice.call(arguments, 0);
                    args.splice(0, 2);
                    // length = args.length;
                    if ((Object.prototype.toString.call(args[0]) == "[object Array]"))
                        t = args[0];
                    else if (typeof args[0] == "string")
                        t = args; //判断事件列表类型为多个字符串参数
                    if (t[0] == "*")
                        return _bindAllEvents(controller, vom) ? this : false;
                    //绑定所有事件
                    else
                        return _bindPartialEvents(controller, vom, t) ? this : false; //绑定部分事件
                } //判断事件列表类型为数组
                if (arguments.length == 2)
                    _bindAllEvents(controller, vom);
            };

            function _bindAllEvents(controller, vom) {
                vom.events = controller.events;
                return true;
            } //绑定controller所有事件
            function _bindPartialEvents(controller, vom, evList) {
                var e, c_e;
                if (evList) {
                    if (!vom.events)
                        e = vom.events = dm.event.create();
                    else
                        e = vom.events;
                    c_e = controller.events._callbacks;
                    for (var i = 0, j = evList.length; i < j; i++) {
                        if (c_e.hasOwnProperty(evList[i]))
                            e._callbacks[evList[i]] = c_e[evList[i]];
                    }
                    return true;
                }
                return false;
            }
        })(); //绑定函数,用于绑定视图与控制器，模型与控制器
        (function() {
            var libs = dm.libs = {};
            dm.registLib = function() {
                if (arguments.length == 0)
                    return false;
                var args = Array.prototype.slice.call(arguments, 0);
                if (args.length == 1 && (Object.prototype.toString.call(args[0]) == "[object Object]")) {
                    for (var p in args[0])
                        libs[p] = args[0][p];
                }
                if (args.length == 2 && (typeof args[0] == "string")) {
                    libs[args[0]] = args[1];
                }
            };
            dm.removeLib = function() {
                var args = Array.prototype.slice.call(arguments, 0);
                var t;
                if (Object.prototype.toString.call(args[0]) == "[object Array]") {
                    t = args[0];
                }
                if (typeof args[0] == "string") {
                    t = args;
                }
                for (var i = 0, j = args.length; i < j; i++) {
                    if (libs[t[i]])
                        delete libs[t[i]];
                }
            };
            dm.useLib = function(name) {
                /*@param string name 库的名字*/
                return libs[name] ? libs[name] : root.undefined;
            }
        })(); //
        module.exports=dm;
    })(window, $); //基于导入全局变量
});
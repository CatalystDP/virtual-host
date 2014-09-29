define(function (require, exports, module) {
    module.exports = {
        req: function (options) {
            /*options:{reqWay:"get/post",reqUrl:"url",
             reqData:"data",
             reqDone:function(){},
             reqFail:function(){},
             reqAlways:function(){}
             }*/
            if ($ == undefined) {
                alert("请求模块未加载!");
                return false;
            }
            var way = eval("$." + options.reqWay.toLowerCase()),
                req;
            req = options.reqData !== undefined ? way(options.reqUrl, options.reqData) : way(options.reqUrl);
            //req=way(options.reqUrl,options.reqData);
            req.
                done(options.reqDone || function () {
                }).
                fail(options.reqFail || function () {
                }).
                always(options.reqAlways || function () {
                });
        }
    };
});
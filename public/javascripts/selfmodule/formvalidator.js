(function (dm, undefined) {
    var $dm = dm,
        p;

    function validator() {
        this.checkConfig = {
            'form': undefined,
            'formchild': undefined,
            'alert-icon': undefined,
            'alert-sentence': undefined,
            'submit': undefined,
            'validateOnblur': true,
            'ajax':false,
            'url':''
        };
    }

    p = validator.prototype;
    p.spaceCheck = function (str) {
        var reg = /\s+/g;
        var status = ((str == "") || (str.match(reg) != null));
        if (status)
            return {status: false, msg: '不能包含空格'};
        return {stauts: true};
    };
    p.lengthCheck = function (str, min, max) {
        /*
         * @param String str 待检测字符串
         * @param Number min 最小长度
         * @param Number max 最大长度*/
        min = min || 6;
        max = max || 10;
        if (str.length < min)
            return {status: false, msg: '过短'};
        if (str.length > max)
            return {status: false, msg: '过长'};
        return {status: true};
    };
    p.sqlCheck = function (str) {
        var reg = /\W+|SELECT|INSERT|UPDATE|CREATE|DROP|DELETE|null/gi;
        var status = str.match(reg) == null;
        if (status)
            return {status: true};
        else
            return {status: false, msg: '非法'};
    };
    p.xssCheck = function (str) {
        var reg = /\s+/ig;
        str = str.replace(reg, '');
        reg.compile(/<*(.*|\s*)>*|<*(.*|\s*)>*/ig);
        var status = str.match(reg) == null;
        if (status)
            return {status: true};
        else
            return {status: false, msg: '非法'};
    };
    p.startCheck = function (checkFunc, str, target) {
        /*
         * @param Array checkFunc 需要用到的检测函数
         * @param String str 待检测字符串*/
        var count = checkFunc.length;//当检测计数等于count时即为检测成功
        var c = 0, err, result;
        for (var i = 0, j = count; i < j; i++) {
            result = this[checkFunc[i] + 'Check'](str);
            if (result.status) {
                c++;
            }
            else {
                err = result.msg;
                break;
            }
        }
        var status = c == count;
        if (!status) {
            var checkConfig = this.checkConfig;
            if (checkConfig['alert-icon'])
                checkConfig['alert-icon'].css('display', 'block');
            if (checkConfig['alert-sentence'])
                checkConfig['alert-sentence'].css('display', 'block');
        }
    };
    p.reset = function (target) {
        target.siblings(this.checkConfig['alert-icon']).css('display', 'none');
        target.siblings(this.checkConfig['alert-sentence']).css('display','none');
    };
    p.config = function (option) {
        /*@option Object option {
         'form':[require],
         'formchild':[required],
         'alert-icon':[optional],
         'alert-sentence':[optional],
         'submit':[required],
         'validateOnBlur':[optional]},
         'ajax':[optional],
         'url':[require]*/
        for (var p in option) {
            this.checkConfig[p] = option[p];
        }
    };
    p.registEvent = function () {
        var form = this.checkConfig['form'];
        var prefix = 'dm-validation-';
        var isIE = navigator.userAgent.indexOf("MSIE 7.0") > 0;
        var _this = this;
        if (this.checkConfig.validateOnblur) {
            form.on(isIE ? 'focusout' : 'blur', this.checkConfig['formchild'], function (e) {
                var target = $(e.currentTarget);
                var validators = target.attr(prefix + "validator").split(',');
                _this.startCheck(validators, e.val(), target);
            });
            form.on(isIE ? 'focusin' : 'focus', this.checkConfig['formchild'], function (e) {
                var target = $(e.currentTarget);
                _this.reset(target);
            });
        }
    };
    $dm.registLib('formvalidator', validator);
    /*
     * 将前缀属性写在表单标签里
     *1、dm-validation-validator需要的验证器用逗号隔开,
     * 2、dm-validation-name表单的名字
     * 3、dm-validation-length字符长度min:xx,max:xx*/
})(dm, window.undefined);

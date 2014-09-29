/**
 * Created by dp on 14-2-26.
 */
exports.strRender = function (str, data) {
    /*
     * @param str String 要进行变量替换的字符串
     * @param data object 要替换成的变量键值对键名为模板里的变量名*/
    var regExp = /\{\%\=[\w]+\%\}/g;
    return str.replace(regExp, function (s) {
        var t = s.split("%")[1].replace("=", "");
        s = data[t] ? data[t] : "";
        return s;
    });
};

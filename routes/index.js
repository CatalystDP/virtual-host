var express = require('express');
var router = express.Router();
var os=require('os');
var fs=require('fs');
/* GET home page. */
var isWindows = os.type().toLowerCase().indexOf('windows') != -1;
function load(req, res, next) {
    var controller = req.params['controller'].replace(/_/g, isWindows ? '\\' : '/');
    var func = req.params['function'];
    var args;
    var obj;
    var path = isWindows ? "" + __dirname + "\\app\\" + controller + ".js" : "" + __dirname + "/app/" + controller + ".js";
    fs.exists(path, function (status) {
        if (status) {
            obj = require(path);
            if (obj[func]) {
                if(args=req.params[0]){
                    args=args.split('/');
                    args.shift();
                    obj[func](req, res,args);
                }

                else
                    obj[func](req,res);
            }

            else {
                next();
            }

        }
        else
            next();
    });

}

router.get('/', function (req, res) {
    res.redirect('/iface/index/index');
});
router.get('/iface/:controller/:function*?', function (req, res, next) {
    load(req, res, next);
});
router.post('/iface/:controller/:function*?', function (req, res, next) {
    load(req, res, next);
});
module.exports = router;

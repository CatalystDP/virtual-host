/**
 * Created by dp on 2014/5/20.
 */
var express=require('express');
var router=express.Router();
var domain = require('domain');
var d = domain.create();
d.on('error', function (err) {
    console.log(err);
});
router.use(function(req,res,next){
   d.run(next);
});

module.exports=router;
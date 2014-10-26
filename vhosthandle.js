var express=require('express');
var router=express.Router();
var vhost=require('vhost');
var path=require('path');
var fs=require('fs');
var vhost_config=require('./vhost.config.json');
/***********在下面添加虚拟主机配置***********/
var filePath;
var app;
var host=vhost_config.host;
for(var p in host){
    if(host.hasOwnProperty(p)){
        filePath=path.join('website',host[p],'app.js');
		if(fs.existsSync(filePath)){
			app=require('./'+filePath);
			fs.existsSync(path.join(__dirname,filePath)) && typeof app =='function' && router.use(vhost(p,app));
		}
    }
}

/******************************************/

module.exports=router;
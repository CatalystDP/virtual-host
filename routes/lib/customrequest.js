var request=require('request');
request=request.defaults({jar:true});
function Request(){
    this.option={
        headers:{}
    };
    this.request=request;
}
var proto=Request.prototype;
proto.setUrl=function(url){
  this.option.url=url;
};
proto.setCookie=function(cookie){
    this.option.headers.Cookie=cookie;
};

module.exports=Request;

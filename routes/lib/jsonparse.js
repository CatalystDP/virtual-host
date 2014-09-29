exports.jsonParse=function(json){
    var r;
    try{
        r=JSON.parse(json);
    }
    catch(e){
        return false;
    }
    return r;
};

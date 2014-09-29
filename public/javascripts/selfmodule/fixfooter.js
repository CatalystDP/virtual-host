fixFooter();
$(window).resize(function(){
    fixFooter();
});
function fixFooter(){
    var containerHeight=$("body")[0].scrollHeight,
        e=document.documentElement||document.body,
        allHeight=e.clientHeight;
    var footer=$(".js-footer-wp");
    if(containerHeight<=allHeight)
        footer.css({position:'absolute',bottom:'0px',zIndex:1});
    else
        footer.css({position:'static'});
}
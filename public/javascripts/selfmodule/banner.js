define(function(require){
    var jQuery=require('jQuery');
    (function ($, f) {
        var divArr, divs, option, i = 0, length;

        function changeDisplayBlock(current) {
            current.css("display", "block");
        }

        function changeDisplayNone(c) {
            c.css("display", "none");
        }

        function changeOpacity(current, callback) {
            current.animate({opacity: 1}, option.speed, option.easing, callback);
        }

        function restoreOpacity(c) {
            c.css("opacity", 0);
        }

        function step(num) {
            num = num || 1;
            i += num;
            if (i > (length - 1))
                i = 0;
            if (i < 0)
                i = length - 1;
        }

        /*function autoSwitchPic(s){
         var c=$(divArr[i]);

         changeDisplay(c);
         restoreOpacity();
         changeOpacity(c,function(){
         lastDiv=c;
         step(s);
         });

         }*/

        function nextPic(callback) {
            var c = $(divArr[i]), n;
            n = (i == length - 1) ? $(divArr[0]) : $(divArr[i + 1]);
            restoreOpacity(c);
            changeDisplayBlock(n);
            changeOpacity(n, function () {
                changeDisplayNone(c);
                step();
                callback();
            });
        }

        function prevPic(callback) {
            var c = $(divArr[i]), p;
            p = (i == 0) ? $(divArr[length - 1]) : $(divArr[i - 1]);
            restoreOpacity(c);
            changeDisplayBlock(p);
            changeOpacity(p, function () {
                changeDisplayNone(c);
                step(-1);
                callback();
            });
        }

        var Banner = function () {
            var banner = this, intV;
            divs = banner.children();
            if(divs.length==1)
                return;
            divs.css({opacity: 0, display: "none"}).last().
                css({opacity: 1, display: "block"});
            length = divs.length;
            divArr = Array.prototype.slice.call(divs, 0).reverse();

            var clickEnable = true;
            intV = setInterval(autoSwitchPic, option.delay);
            var enableClick = function () {
                    clickEnable = true;
                    intV = setInterval(autoSwitchPic, option.delay);
                },
                autoEnableClick = function () {
                    clickEnable = true;
                };
            $("#banner-key-prev").on("click", function (e) {
                clearInterval(intV);
                if (clickEnable) {
                    clickEnable = false;
                    prevPic(enableClick);
                }
            });
            $("#banner-key-next").on("click", function (e) {
                clearInterval(intV);
                if (clickEnable) {
                    clickEnable = false;
                    nextPic(enableClick);
                }

            });
            function autoSwitchPic() {
                clickEnable = false;
                nextPic(autoEnableClick);
            }
        };

        $.fn.bannerFade = function (op) {
            var defaultOp = {
                speed: 1000,
                delay: 3000,
                easing: 'swing',
                keys: f,
                dots: f
            };
            if (op === undefined)
                option = defaultOp;
            else
                option = $.extend(defaultOp, op);
            Banner.call(this);
        };
    })(jQuery, false);
});



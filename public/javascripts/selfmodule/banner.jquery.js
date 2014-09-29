define(function(require){
    var jQuery=require('jQuery');
    (function ($) {
        var banner = function (option) {
            var banner = this,
                divs = [],
                countDiv,
                i,
                z_index = [];
            divs = [].slice.call(banner.children());
            countDiv = divs.length;
            divs.reverse();
            for (i = 0; i < countDiv; i++) {
                $(divs[countDiv - 1 - i]).css("z-index", -i);
                z_index.push(-i);
            }
            z_index.reverse();
            // 初始化
            i = 0;
            var fade = function () {
                var current = $(divs[countDiv - 1 - i]);
                current.animate({
                    opacity: 0
                }, option.speed, option.easing, function () {
                    changeZindex();
                    current.css("opacity", "1");
                    i = (++i == countDiv) ? 0 : i;
                });

            };

            function changeZindex() {
                var first = z_index.shift();
                z_index.push(first);
                for (var j = 0; j < countDiv; j++)
                    $(divs[j]).css("z-index", z_index[j]);
            }

            setInterval(fade, option.delay);
        };

        $.fn.bannerFade = function (option) {
            var defaultOp = {
                speed: 1000,
                delay: 3000,
                easing: 'swing'
            };
            if (option === undefined)
                option = defaultOp;
            else
                option = $.extend(defaultOp, option);
            banner.call(this, option);
        };
    })(jQuery);
});



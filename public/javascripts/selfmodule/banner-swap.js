/**
 * Created by dp on 14-4-5.
 */
define(function(require) {
    var jQuery=require('jQuery');
    (function ($, f, root) {
        var proto = BannerSwap.prototype;
        var body = $('body');

        function BannerSwap(context, option) {
            this.currentDomObject = context;
            this.option = option;
            this.children = this.currentDomObject.children();
            this.singleWidth = context.width();
            this.marginTable = [];
            this.max = this.children.length;
            this.current = [0];
            this.interVal = root.undefined;
            if (option.prev && option.next) {
                this.prevBtn = option.prev;
                this.nextBtn = option.next;
            }
        } //创建bannerswap类
        proto.reCalculateWidth = function () {
            // this.currentDomObject.css("margin-left", "0");
            this.children.css("width", this.currentDomObject.parent().css('width'));
            this.singleWidth = $(this.children[0]).width();
            this.marginTable.splice(0, this.marginTable.length);
            this.calculateWidth();
            this.autoSwap();
        };
        proto.calculateWidth = function () {
            var length = this.children.length;
            var width = parseInt(this.singleWidth);
            var margin = 0;
            var marginTable = this.marginTable;
            this.currentDomObject.css("width", (width * length) + "px");
            this.children.css("float", "left");
            for (var i = 0, j = length; i < j; i++) {
                marginTable.push(margin + "px");
                margin -= width;
            }
            this.canClick = true;
        };
        proto.slide = function (current, callback) {
            var that = this;
            that.canClick = false;
            this.currentDomObject.stop().animate({
                marginLeft: that.marginTable[current]
            }, this.option.duration, function () {
                that.canClick = true;
                if (callback)
                    callback();
            });

        };
        proto.autoSwap = function () {
            var that = this;
            var current = this.current;

            this.interVal = setInterval(function () {
                current[0] += 1;
                if (current[0] >= that.max)
                    current[0] = 0;
                that.slide(current[0]);
            }, this.option.delay);
        };
        proto.navBtn = function () {
            var current = this.current;
            var that = this;
            this.prevBtn.on("click", function (e) {
                clearInterval(that.interVal);
                current[0] -= 1;
                if (current[0] < 0)
                    current[0] = that.max - 1;
                that.slide(current[0], function () {
                    that.autoSwap();
                });
            });
            this.nextBtn.on("click", function (e) {
                clearInterval(that.interVal);
                current[0] += 1;
                if (current[0] >= that.max)
                    current[0] = 0;
                that.slide(current[0], function () {
                    that.autoSwap();
                });
            });
        };
        proto.startSwapPlugin = function () {
            this.calculateWidth();
            if (this.prevBtn && this.nextBtn)
                this.navBtn();
            this.autoSwap();
        };
        $.fn.bannerSwap = function (option) {
            var defaultOption = {
                delay: 3000, //每3秒换一次图片
                duration: 1000 //动画时间为1秒
            };
            var op;

            if (!option)
                op = defaultOption;
            else
                op = $.extend(defaultOption, option);
            if (op.duration >= 3000)
                op = defaultOption;
            if (this.children().length <= 1)
                return;
            this.children().css("width", this.parent().width() + "px");
            var s = new BannerSwap(this, op);
            s.startSwapPlugin();
            $(window).resize(function () {
                var interval = s.interVal;
                if (interval)
                    window.clearInterval(interval);
                s.reCalculateWidth();
            });
        };
    })(jQuery, false, window);
});
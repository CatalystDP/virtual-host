define(function(require,exports,module){
    var proto;
    function Pagination() {
    }
    proto = Pagination.prototype;

    proto.init = function (config) {
        this.base_href = config.base_href;
        this.total_rows = config.total_rows;
        this.per_page = config.per_page;
        this.num_links = config.num_links;//当前选择的页码之前和之后的出现的页码数
        this.active_classname = config.active_classname;
    };
    proto.createLink = function (currentPage) {
        currentPage = currentPage || 1;
        var total_page = Math.ceil(this.total_rows / this.per_page);
        var start, end;
        var num_links = this.num_links;
        var len = 2 * num_links + 1;
        var base_href = this.base_href;
        var prev, next, first, last, commonpage = '';
        var active = this.active_classname;
        if (this.total_rows <= this.per_page)
            return '';
        if (total_page <= 1)
            return '';
        if(currentPage>total_page)
            currentPage=total_page;
        if (total_page <= len) {
            start = 1;
            end = total_page;
        }
        else {
            start = currentPage - num_links > 0 ? currentPage - num_links : 1;
            end = currentPage + num_links < total_page ? currentPage + num_links : total_page;
            if (start == 1)
                end = 2 * num_links + 1;
            if (end == total_page)
                start = total_page - 2 * num_links;
        }
        first = "<li class='spc-page'><a href=" + base_href + "/1>第一页</a></li>";
        last = "<li class='spc-page'><a href=" + base_href + "/" + total_page + ">最后一页</a></li>";
        prev = "<li class='spc-page'><a href=" + base_href + "/" + (currentPage - 1 <= 0 ? 1 : currentPage - 1) + ">上一页</a></li>";
        next = "<li class='spc-page'><a href=" + base_href + "/" + (currentPage + 1 >= total_page ? total_page : currentPage + 1) + ">" +
            "下一页</a></li>";
        for (var i = start; i <= end; i++) {
            if (i == currentPage)
                commonpage += "<li><a class=" + active + " href=" + base_href + "/" + i + ">" + i + "</a></li>"
            else
                commonpage += "<li><a href=" + base_href + "/" + i + ">" + i + "</a></li>";
        }
        return first + prev + commonpage + next + last;
    };

    exports.create = function () {
        return new Pagination();
    };
});

$(function () {
  
    //获取当天警情数据
    alarm.loadTodayAlarms();
});

var alarm=(function () {
    var queryResult;

    var loadTodayAlarms = function(){
        parent.geoneAjax.handleAjax({
            url: 'businessModule/alarm/mock.todayAlarms.json', data: {}, callback: function (res) {
                showResult(res);
            }
        });
    }

    var showResult = function (res) {
        queryResult = res.data;
        $("#resultTotal").html(res.data.length);
        
        $("#resultContent").css("height", $(window).height() - $("#statusLegend").height() - 60 + 'px');

        // laypage({
        //     cont: 'footerPage', //容器。值支持id名、原生dom对象，jquery对象。【如该容器为】：<div id="page1"></div>
        //     pages: Math.ceil(res.data.length / 10), //通过后台拿到的总页数
        //     curr: 1, //当前页
        //     first: false,
        //     last: false,
        //     jump: function (obj, first) { //触发分页后的回调
        //         if (!first) {
        //             showResultListItem(obj.curr);
        //         }
        //     }
        // });
        showResultListItem(queryResult);
    };

    var showResultListItem = function (queryResult) {
        // newQueryResult = [];
        // for (var i = 10 * (page - 1), len = queryResult.length; i < len; i++) {
        //     if (len <= page * 10)
        //         newQueryResult.push(queryResult[i]);
        //     else if (i < page * 10) {
        //         newQueryResult.push(queryResult[i]);
        //     }
        // }
        parent.geoneAjax.handleTemplate({
            tName: "leftQueryResultView.txt?v=1.0.0", callback: function (queryTemplate) {
                parent.laytpl(queryTemplate).render({eventName: "alarm", data: queryResult}, function (html) {
                    var queryList = document.createElement("div");
                    queryList.id = "list-group";
                    queryList.className = "list-group";
                    queryList.innerHTML = html;
                    document.getElementById("resultContent").innerHTML = "";
                    document.getElementById("resultContent").appendChild(queryList);
                });
            }
        });
        //地图绘制
        parent.window.mapClear();
        // parent.window.drawGeometryToMap(queryResult, false, true);
        parent.window.drawMarkToMap(queryResult);
    };

    var position = function(id) {
        $(queryResult).each(function (index, item) {
            if (parseInt(item.id) === id) {
                parent.window.position(item);
                return false;
            }
        });
    }

    return {
        loadTodayAlarms: loadTodayAlarms,
        position: position
    }
})();









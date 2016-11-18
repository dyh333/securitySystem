$(function () {
    $("#addAlarm").click(function(){
        alarm.addAlarm();
    });

    //获取当天警情数据
    alarm.loadTodayAlarms();

    //接收实时警情
    alarm.receiveRealMsg();

    
});



var alarm=(function () {
    var gpsHub;
    var alarmResults=[];

    var loadTodayAlarms = function(){
        parent.geoneAjax.handleAjax({
            url: 'businessModule/alarm/mock.todayAlarms.json', data: {}, callback: function (res) {
                alarmResults = res.data;
                showResult(res.data);
            }
        });
    }

    var addAlarm = function(){
        var newAlarms = [{
                            "id": "9999",
                            "name": "aaa",
                            "shape": "POINT (116.509852 40.257031)",
                            "attribute": {
                                "法人代表": "9999",
                                "登记机构": "钦州市工商行政管理局",
                                "机构代码": "063585229",
                                "注册资本": "17940 万人民币",
                                "公司类型": "其他有限责任公司",
                                "经营地址": "中马钦州产业园区中马大街1号",
                                "经营范围": "物业管理（凭有效资质经营）"
                            },
                            "showlist": {
                                "法人代表": "aaa",
                                "机构代码": "063585229",
                                "公司类型": "其他有限责任公司",
                                "经营地址": "中马钦州产业园区中马大街1号"
                            }
                        },{
                            "id": "9999",
                            "name": "aaa",
                            "shape": "POINT (116.509852 40.257031)",
                            "attribute": {
                                "法人代表": "9999",
                                "登记机构": "钦州市工商行政管理局",
                                "机构代码": "063585229",
                                "注册资本": "17940 万人民币",
                                "公司类型": "其他有限责任公司",
                                "经营地址": "中马钦州产业园区中马大街1号",
                                "经营范围": "物业管理（凭有效资质经营）"
                            },
                            "showlist": {
                                "法人代表": "aaa",
                                "机构代码": "063585229",
                                "公司类型": "其他有限责任公司",
                                "经营地址": "中马钦州产业园区中马大街1号"
                            }
                        }];

        showResultListItem(newAlarms, true);
        alarmResults = _.concat(newAlarms, alarmResults);

    }

    var receiveRealMsg = function(){
        $.connection.hub.url = 'http://localhost:43652/signalr111';

        gpsHub = $.connection.busGpsHub;

        gpsHub.client.receiveGps = function (gpsList) {
            _.forEach(gpsList, function(value) {
                console.log(value);
            });

        };

        $.connection.hub.start().done(function () {
            console.info('hub has connected');
        });
    }

    var showResult = function (queryResult) {
        
        $("#resultTotal").html(queryResult.length);
        
        $("#resultContent").css("height", $(window).height() - $("#statusLegend").height() - 60 + 'px');

        
        showResultListItem(queryResult);
    };

    var showResultListItem = function (alarmResult, isInsert = false) {
        parent.geoneAjax.handleTemplate({
            tName: "leftQueryResultView.txt?v=1.0.0", callback: function (queryTemplate) {
                parent.laytpl(queryTemplate).render({eventName: "alarm", data: alarmResult}, function (html) {
                    // var queryList = document.createElement("div");
                    // queryList.id = "list-group";
                    // queryList.className = "list-group";
                    // queryList.innerHTML = html;

                    if(isInsert){
                        
                        $( "#resultContent" ).prepend(html);
                    } else {
                        document.getElementById("resultContent").innerHTML = "";
                        $( "#resultContent" ).append(html);
                        // document.getElementById("resultContent").appendChild(html);
                    }
                });
            }
        });
        //地图绘制
        // parent.window.mapClear();
        // parent.window.drawGeometryToMap(queryResult, false, true);
        parent.window.drawMarkToMap(alarmResult);
    };

    var position = function(id) {
       
        $(alarmResults).each(function (index, item) {
            if (parseInt(item.id) === id) {
                parent.window.position(item);
                return false;
            }
        });
    }

    return {
        loadTodayAlarms: loadTodayAlarms,
        addAlarm: addAlarm,
        receiveRealMsg: receiveRealMsg,
        position: position
    }
})();









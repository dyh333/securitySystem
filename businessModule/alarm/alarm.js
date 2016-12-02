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
        // parent.geoneAjax.handleAjax({
        //     url: 'businessModule/alarm/mock.todayAlarms.json', data: {}, callback: function (res) {
        //         alarmResults = res.data;
        //         showResult(res.data);
        //     }
        // });
        var url = 'http://192.168.34.181/pchub/service/event/history';

        $.getJSON(url, function (res) {
            // console.log(res);
            var decoratedData = decorateData.alarmData(res.Data);
            
            alarmResults = decoratedData;
            showResult(decoratedData);
        }).error(function(e) { 
            alert("error"); 
        });
    }

    var addAlarm = function(newAlarm){
        var decoratedData = decorateData.alarmData(new Array(newAlarm));

        alarmResults = _.concat(decoratedData, alarmResults);

        showResultListItem(decoratedData, true);
    }

    var receiveRealMsg = function(){
        $.connection.hub.url = 'http://192.168.34.181/PCHub/signalr';

        var alarmHub = $.connection.PCHub;

        alarmHub.client.ReceiveData = function (alarmStr) {
           var alarm = JSON.parse(alarmStr);
            addAlarm(alarm);
        };

        $.connection.hub.start().done(function () {
            console.info('hub has connected');
        }).fail(function(){ 
            console.log('Could not connect'); 
        });;
    }

    var showResult = function (queryResult) {
        $("#resultContent").css("height", $(window).height() - $("#statusLegend").height() - 60 + 'px');

        showResultListItem(queryResult);
    };

    var showResultListItem = function (alarmResult, isInsert = false) {
        $("#resultTotal").html(alarmResults.length);

        parent.geoneAjax.handleTemplate({
            tName: "leftQueryResultView.txt?v=1.0.0", callback: function (queryTemplate) {
                parent.laytpl(queryTemplate).render({eventName: "alarm", data: alarmResult}, function (html) {

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
        parent.window.drawMarkToMap(alarmResult, isInsert);
    };

    var position = function(id) {
        $(alarmResults).each(function (index, item) {
            if (parseInt(item.id) === id || item.id === id) {
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









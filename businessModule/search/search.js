$(function () {
    enterprise.loadEnterprises();

    $("#searchBtn").on("click", function () {
        // parent.geoneAjax.handleAjax({
        //     url: 'businessModule/alarm/mock.todayAlarms.json', data: {}, callback: function (res) {
        //         alarmResults = res.data;
        //         showResult(res.data);
        //     }
        // });

        $.getJSON('../alarm/mock.realAlarms.json', function (res) {
            var decoratedData = decorateData.alarmData(res.Data);
            
            alarmResults = decoratedData;
            enterprise.showResult(decoratedData);
        });
    });

    $(document).on("click", ".containerList .back", function () {
        enterprise.stopEdit();
    });


    
});

var enterprise=(function(){
    var enterpriseList=[];
    var editItem;

    var loadEnterprises = function(){
        var url = 'http://58.210.9.131/pchub/service/enterprise/list';

        $.getJSON(url, function (res) {
            
            var decoratedData = decorateData.enterpriseData(res.Data);
            showResult(decoratedData);

            enterpriseList = decoratedData;
            
        }).error(function(e) { 
            alert("error"); 
        });
    };

    var showResult = function (queryResult) {
        
        $("#resultContent").css("height", $(window).height() - $(".searchPanel").height() - 60 + 'px');

        
        showResultListItem(queryResult, false);
    };

    var showResultListItem = function (queryResult, isInsert) {
        $("#resultTotal").html(queryResult.length);

        parent.geoneAjax.handleTemplate({
            tName: "leftQueryResultView.txt?v=1.0.0", callback: function (queryTemplate) {
                parent.laytpl(queryTemplate).render({eventName: "enterprise", editable: true, data: queryResult}, function (html) {

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
        parent.window.drawMarkToMap(queryResult, "enterprise", isInsert);
    };

    var position = function(id) {
        $(enterpriseList).each(function (index, item) {
            if (parseInt(item.id) === id || item.id === id) {
                parent.window.position(item);
                return false;
            }
        });
    }

    var updateEnterprise = function(){
        var url = 'http://58.210.9.131/pchub/service/enterprise/update';

        var updatedInfo = new Object();
        updatedInfo.Id = editItem.id

        $(".list-group-item input").each(function(){
            var key = $(this).attr("name");
            var newValue = $(this).val();

            if(key !== 'shape'){
                updatedInfo[key] = newValue;
            } else {
                updatedInfo.Lat = newValue.split(",")[0];
                updatedInfo.Lng = newValue.split(",")[1];
            }
        })

        // console.log(updatedInfo);
        
        var postData = {"token": "333", "userid": "uid", "data": updatedInfo};
        $.post(url, JSON.stringify(postData), function(result){
            console.log(result);
        }).error(function(e) {
            alert("error"); 
        });
    }

    var startEdit = function(id){
        
        $(enterpriseList).each(function (index, item) {
            if (parseInt(item.id) === id || item.id === id) {
                editItem = item;
                return false;
            }
        });

        initEditItems(editItem);

        onEndAnimation($(".pt-page-1"), $(".pt-page-2"),1);
    }

    var initEditItems = function(editItem){
        var editArray = [];

        for (var key in editItem.attribute){
            // console.log(editItem.attribute[key]);
            editArray.push('<div class="list-group-item">' + editItem.attribute[key].text + 
                '<input style="float: right; width: 160px;" type="text" name="' + key + 
                '" value="' + editItem.attribute[key].value + '"></input></div>');
        }
        editArray.push('<div id="div_shp" class="list-group-item">坐标<span onclick="enterprise.pickMapPoint();" class="badge" style="float: right; color: black;">拾取</span><input name="shape" style="float: right; width: 117px; margin-right: 3px;" type="text" readonly="readonly" value="'+editItem.shape+'"></input>');
               

        $(".list-group").html(editArray.join(''));
    }

    var pickMapPoint = function(){

        parent.window.pickMapPoint({callback: function (result) {
            // console.log(result);
            var lng = result.lng;
            var lat = result.lat;

            $("#div_shp input").val(lat + "," + lng);
        }});
        
    }

    var stopEdit = function(){
        onEndAnimation($(".pt-page-2"), $(".pt-page-1"), 2);
    }

    function onEndAnimation($outpage, $inpage,state) {
        switch (state) {
            case 1:
                $outpage.removeClass("pt-page-moveFromLeft").addClass("pt-page-moveToLeft");
                $inpage.removeClass("pt-page-moveToRight").addClass("pt-page-moveFromRight").addClass("pt-page-current");
                break;
            case 2:
                $outpage.removeClass("pt-page-moveFromRight").addClass("pt-page-moveToRight");
                $inpage.removeClass("pt-page-moveToLeft").addClass("pt-page-moveFromLeft").addClass("pt-page-current");
                break;
        }
        setTimeout(function () {
            $outpage.removeClass("pt-page-current");
        }, 500);
    }

    return {
        showResult: showResult,
        loadEnterprises: loadEnterprises,
        position: position,
        startEdit: startEdit,
        stopEdit: stopEdit,
        pickMapPoint: pickMapPoint,
        updateEnterprise: updateEnterprise
    }
})();


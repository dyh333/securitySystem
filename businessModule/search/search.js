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
        $.post(url, postData, function(result){
            console.log(result);
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
        editArray.push('<div class="list-group-item">坐标<span onclick="enterprise.pickMapPoint();" class="badge" style="float: right; color: black;">拾取</span><input name="shape" style="float: right; width: 100px; margin-right: 20px;" type="text" readonly="readonly" value="'+editItem.shape+'"></input>');
               

        $(".list-group").html(editArray.join(''));
    }

    var pickMapPoint = function(){

        parent.window.pickMapPoint();
        
        //TODO: 如果将bdmap中的坐标返回来？ 小郑
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

var old_search=(function () {
    var serviceUrl = null, queryResult = [], newQueryResult = [];

    var renderSearchItem = function (moduleConfig) {
        var searchHtml = [];
        if (moduleConfig.length === 1) {
            $(moduleConfig).each(function (index, item) {
                searchHtml.push('<div class="listItemOne">');
                switch (item.type.toLowerCase()) {
                    case 'text':
                        searchHtml.push('<input type="text" data-keyId="' + item.name + '"  class="control" placeholder="请输入查询条件"  value="' + item.defaultValue + '"/>');
                        break;
                    case 'combox':
                        searchHtml.push('<select   data-keyId="' + item.name + '"  class="control">');
                        if (item.items.length > 0)
                            $(item.items).each(function (thirdIndex, thirdItem) {
                                searchHtml.push('<option value="' + thirdItem.value + '">' + thirdItem.label + '</option>');
                            });
                        searchHtml.push('</select>');
                        break;
                    case 'date':
                        searchHtml.push('<input type="date" data-keyId="' + item.name + '" class="control" value="' + item.defaultValue + '"/>');
                        break;
                }
                searchHtml.push('<button id="searchBtn" type="button" >搜索</button>');
                searchHtml.push('</div>');
            });
        }
        else {
            $(moduleConfig).each(function (index, item) {
                searchHtml.push('<div class="listItem">');
                searchHtml.push('<div class="title"><span >' + item.label + '</span></div>');
                switch (item.type.toLowerCase()) {
                    case 'text':
                        searchHtml.push('<input type="text" data-keyId="' + item.name + '" class="control" placeholder="请输入查询内容" value="' + item.defaultValue + '"/>');
                        break;
                    case 'combox':
                        searchHtml.push('<select  data-keyId="' + item.name + '"  class="control">');
                        if (item.items.length > 0)
                            $(item.items).each(function (thirdIndex, thirdItem) {
                                searchHtml.push('<option value="' + thirdItem.value + '">' + thirdItem.label + '</option>');
                            });
                        searchHtml.push('</select>');
                        break;
                    case 'date':
                        searchHtml.push('<input type="date" data-keyId="' + item.name + '" class="control" value="' + item.defaultValue + '"/>');
                        break;
                    case 'range':
                        var valueSplit = ['', ''];
                        if (!item.defaultValue === false) {
                            valueSplit = item.defaultValue.split(',');
                        }
                        searchHtml.push('<input type="text" data-keyId="' + item.name + '_s" onkeydown="search.onlyNum();" style="ime-mode:Disabled" class="control range" value="' + valueSplit[0] + '"/>');
                        searchHtml.push('<span> 至 </span>');
                        searchHtml.push('<input type="text" data-keyId="' + item.name + '_e" onkeydown="search.onlyNum();" style="ime-mode:Disabled"  class="control range" value="' + valueSplit[1] + '"/>');
                        break;
                }
                searchHtml.push('</div>');
            });
            searchHtml.push('<div class="listItem listItemSearchBtn"><button id="searchBtn" type="button" >搜索</button></div>');
        }
        $("#searchPanel").html(searchHtml.join(''));
        searchHtml = [];
        bindEvent();
    };

    var bindEvent = function () {
        $("#searchBtn").off("click").on("click", function () {
            doHandle();
        });
    };

    var doHandle = function () {
        var newServiceUrl;
        if (!serviceUrl)parent.layer.msg('请配置相关服务', {icon: 0});
        newServiceUrl = serviceUrl;
        $('#searchPanel .control').each(function (index, item) {
            newServiceUrl = newServiceUrl.replace('#' + $(item).data('keyid') + '#', $(item).val());
        });
        parent.geoneAjax.handleAjax({
            url: newServiceUrl, data: {}, callback: function (res) {
                showResult(res);
            }
        });
    };

    var showResult = function (res) {
        queryResult = res.data;
        $("#resultTotal").html(res.data.length);
        if (Math.ceil(res.data.length / 10) > 1) {
            $("#footerPage").show();
            $("#resultContent").css("height", $(window).height() - $(".searchPanel").height() - 100 + 'px');
        }
        else {
            $("#footerPage").hide();
            $("#resultContent").css("height", $(window).height() - $(".searchPanel").height() - 60 + 'px');
        }
        laypage({
            cont: 'footerPage', //容器。值支持id名、原生dom对象，jquery对象。【如该容器为】：<div id="page1"></div>
            pages: Math.ceil(res.data.length / 10), //通过后台拿到的总页数
            curr: 1, //当前页
            first: false,
            last: false,
            jump: function (obj, first) { //触发分页后的回调
                if (!first) {
                    showResultListItem(obj.curr);
                }
            }
        });
        showResultListItem(1);
    };

    var showResultListItem = function (page) {
        newQueryResult = [];
        for (var i = 10 * (page - 1), len = queryResult.length; i < len; i++) {
            if (len <= page * 10)
                newQueryResult.push(queryResult[i]);
            else if (i < page * 10) {
                newQueryResult.push(queryResult[i]);
            }
        }
        parent.geoneAjax.handleTemplate({
            tName: "leftQueryResultView.txt?v=1.0.0", callback: function (queryTemplate) {
                parent.laytpl(queryTemplate).render({eventName: "search", data: newQueryResult}, function (html) {
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
        parent.window.drawGeometryToMap(newQueryResult, false, true);
        parent.window.drawMarkToMap(newQueryResult, true, false);
    };
    return {
        renderSearch: function () {
            var moduleName = getQueryString("moduleName");
            var module = parent.mapLayerConfig.getQueryModuleByName(moduleName);
            if (module === null) {
                parent.layer.msg("请配置相关服务！", {icon: 0, time: 2000});
                return false;
            }
            serviceUrl = module.serviceUrl;
            renderSearchItem(module.controls);
        },
        showResult: function (res) {
            showResult(res);
        },
        position: function (id) {
            $(newQueryResult).each(function (index, item) {
                if (parseInt(item.id) === id) {
                    parent.window.position(item);
                    return false;
                }
            });
        },
        onlyNum: function () {
            if (event.keyCode == 190){event.returnValue = true;}else {
                if (!(event.keyCode == 46) && !(event.keyCode == 8) && !(event.keyCode == 37) && !(event.keyCode == 39))
                    if (!((event.keyCode >= 48 && event.keyCode <= 57) || (event.keyCode >= 96 && event.keyCode <= 105)))
                        event.returnValue = false;
            }
        }
    }
})();


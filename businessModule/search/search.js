/**
 * Created by zhengsl on 2016/8/26.
 */
$(function () {
    // search.renderSearch();

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
            search.showResult(decoratedData);
        });
    });
});

var search=(function(){
    var showResult = function (queryResult) {
        
        $("#resultContent").css("height", $(window).height() - $(".searchPanel").height() - 60 + 'px');

        
        showResultListItem(queryResult);
    };

    var showResultListItem = function (alarmResult, isInsert = false) {
        $("#resultTotal").html(alarmResults.length);

        parent.geoneAjax.handleTemplate({
            tName: "leftQueryResultView.txt?v=1.0.0", callback: function (queryTemplate) {
                parent.laytpl(queryTemplate).render({eventName: "search", data: alarmResult}, function (html) {

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

    return {
        showResult: showResult
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


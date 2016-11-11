/**
 * Created by zhengsl on 2016/8/30.
 */
var statisticsATools=(function () {
    var moduleName = null,
        serviceUrl = null,
        winHeight = null,
        winWidth = null,
        showStyle = null;

    var renderTools= function (controls) {
        var searchWidgetHtml = [];
        $(controls).each(function (index, item) {
            searchWidgetHtml.push('<div class="row">');
            searchWidgetHtml.push('<span>' + item.label + '</span>');
            switch (item.type.toLowerCase()) {
                case 'text':
                    searchWidgetHtml.push('<input type="text" data-keyId="' + item.name + '" class="control" value="' + item.defaultValue + '"/>');
                    break;
                case 'combox':
                    searchWidgetHtml.push('<select id="selectType"  data-keyId="' + item.name + '"  class="control ">');
                    if (item.items.length > 0)
                        $(item.items).each(function (thirdIndex, thirdItem) {
                            searchWidgetHtml.push('<option value="' + thirdItem.value + '">' + thirdItem.label + '</option>');
                        });
                    searchWidgetHtml.push('</select>');
                    break;
                case 'date':
                    searchWidgetHtml.push('<input type="date" data-keyId="' + item.name + '" class="control" value="' + item.defaultValue + '"/>');
                    break;
                case 'geometry':
                    searchWidgetHtml.push('<img src="../resource/img/bg.png" class="tools-Icon polygon polygonSelect"  width="32"/>');
                    break;
            }
            searchWidgetHtml.push("</div>");
        });
        $(".toolContainer").html(searchWidgetHtml.join(''));
        if ($("img.polygonSelect").length > 0) {
            $("img.polygonSelect").off("click").on("click", function () {
                parent.window.mapClear();
                parent.window.drawGeometryByEditTools("polygon");
            });
        }
    };

    //替换参数，执行查询
    var doHandleSearch = function () {
        var newServiceUrl = null;
        if (!serviceUrl) {
            parent.layer.msg('请配置相关服务!', {icon: 0});
            return false;
        }
        newServiceUrl = serviceUrl.replace("&device=ipad", "");
        $('.toolContainer .control').each(function (index, item) {
            newServiceUrl = newServiceUrl.replace('#' + $(item).data('keyid') + '#', $(item).val());
        });
        var dataObject = {};
        if ($("img.polygonSelect").length > 0) {
            dataObject = {wkt: parent.mapLayerConfig.getDrawShape()}
        }
        parent.geoneAjax.handlePostAjax({
            url: newServiceUrl, data: dataObject, callback: function (res) {
                parent.mapLayerConfig.setDataObject(res);
                parent.myLayer.showPopup({
                    title: moduleName, area: [winWidth + 'px', winHeight + 'px'],
                    webUrl: "businessModule/chartTable/chartResult" + showStyle + ".html"
                });
            }
        });
    };

    return {
        renderStatisticsATools: function () {
            var module = parent.mapLayerConfig.getQueryModuleByName(getQueryString("moduleName"));
            if (module === null) {
                parent.layer.msg("请配置相关服务！", {icon: 0, time: 2000});
                return false;
            }
            serviceUrl = module.serviceUrl;
            moduleName = module.label;
            winHeight = module.height;
            winWidth = module.width;
            showStyle = module.showStyle;
            renderTools(module.controls);

            $(document).on('click', '#search', function () {
                doHandleSearch();
            });
        }
    }
})();
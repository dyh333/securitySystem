/**
 * Created by zhengsl on 2016/5/30.
 */
$(function () {
    sztpATools.init();
});

var sztpATools=(function () {
    var serviceUrl;
    var doHandleSearch = function () {
        var newServiceUrl;
        if (!serviceUrl) {
            parent.layer.msg('请配置相关服务!', {icon: 0});
            return false;
        }
        newServiceUrl = serviceUrl;
        var dataObject = {};
        if ($(".polygonSelect").length > 0) {
            dataObject = {wkt: parent.mapLayerConfig.getDrawShape()}
        }
        parent.geoneAjax.handlePostAjax({
            url: newServiceUrl, data: dataObject, callback: function (result) {
                parent.mapLayerConfig.setDataObject(result);
                parent.myLayer.showPopup({
                    title: "市政拓扑分析", area: ['600px', '400px'],
                    webUrl: "businessModule/chartTable/chartResultTable.html"
                });
            }
        });
    };

    return {
        init: function () {
            var module = parent.mapLayerConfig.getQueryModuleByName(getQueryString("moduleName"));
            serviceUrl = module.serviceUrl;

            $(document).on('click', '#search', function () {
                if (parent.mapLayerConfig.getDrawShape() === '') {
                    parent.layer.msg("请绘制分析范围！", {icon: 0, time: 2000});
                    return false;
                }
                doHandleSearch();
            });
            $(document).on("click", "img.polygonSelect", function () {
                var distance = parseInt($("#distance").val());
                if (distance >= 0) {
                    parent.window.mapClear();
                    parent.window.drawBufferGeometryByEditTools($(this).data('type'), distance);
                }
                else
                    parent.layer.msg("距离输入有误！", {icon: 0, time: 2000});
            });
        },
        isInt: function () {
            var keyCode = event.keyCode;
            if ((keyCode >= 48 && keyCode <= 57)) {
                event.returnValue = true;
            } else {
                event.returnValue = false;
            }
        }
    }
})();
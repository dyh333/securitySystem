
$(function () {
    "use strict";
    var userName = getQueryString("userName");
    if (!userName === true)
        userName = 'ghbw';
    geoneAjax.handleAjax({
        //url: 'http://58.210.9.131/jsDataCenter/m.ashx?x=login&appid=yqregiplanMap&xUserName=yqgh&xPassword=yqgh123',
        url: 'http://' + mapLayerConfig.getIP() + '/jsDataCenter/m.ashx?x=login&appid=qzcyy&xUserName=' + userName + '&xPassword=123',
        //url: 'http://192.168.84.23/jsDataCenter/m.ashx?x=login&appid=sqonemap&xUserName=zhengsl&xPassword=123',
        data: {},
        callback: function (configJson) {
            mapLayerConfig.setModules(configJson.data.modules);
            mapLayerConfig.setService(configJson.data.services);
            $("#main").attr("src", "mapW/map.html");
        }
    });
});
/**第三方接口**/
function mapBoxPosition(dkh) {
    var quickSearchUrl = mapLayerConfig.getServiceUrlByName("queryFromDKH");
    geoneAjax.handleAjax({
        url: quickSearchUrl,
        data: {key: dkh},
        callback: function (result) {
            window.mapClear();
            window.drawGeometryToMap(result, true, true);
        }
    });
}
function mapPositionByShape(shape) {
    window.mapClear();
    window.drawGeometryByShape(shape, true);
}
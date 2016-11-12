$(function () {
    
    // initBdMap();
    initBdMapCompleted();
});

var map;

var initBdMap = function() {
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.src = "http://api.map.baidu.com/api?v=2.0&ak=shp0CX7jzC3xySBLVWqGT51xt4Oc8pyW&callback=initBdMapCompleted";
        document.body.appendChild(script);
}

var initBdMapCompleted = function() {
    map = new BMap.Map("map", {minZoom: 4, maxZoom: 16});    // 创建Map实例

    map.setMapStyle({style:'grayscale'});

    //添加地图类型控件
    map.addControl(new BMap.MapTypeControl());
    map.addControl(new BMap.NavigationControl());    
    map.addControl(new BMap.ScaleControl());       
    map.enableScrollWheelZoom(true);

    map.centerAndZoom(new BMap.Point(120.6670992, 31.3117564), 15);  // 初始化地图,设置中心点坐标和地图级别
    map.setCurrentCity("苏州");          // 设置地图显示的城市 此项是必须设置的

    //map.centerAndZoom("苏州",15);  //dingyh 在此不起作用


    //panoTest();
};

parent.window.mapClear = window.mapClear = function () {
    map.clearOverlays();
};

parent.window.drawMarkToMap = window.drawMarkToMap = function (res) {
    for(var i=0;i<res.length;i++){
        var point = wktToBdPoint(res[i].shape);

        var marker = new BMap.Marker(point);  // 创建标注
        map.addOverlay(marker);               // 将标注添加到地图中

        addClickHandler(res[i], marker);
		
       

        if(i === 0){
            map.centerAndZoom(point, 15);
        }
    }

    
    function addClickHandler(item, marker){
        marker.addEventListener("click", function(e){
            parent.geoneAjax.handleMapTemplate({
                tName: "bdPopUpContentView.txt", callback: function (IResultTemplate) {
                    parent.laytpl(IResultTemplate).render(item, function (html) {
                        var searchInfoWindow = new BMapLib.SearchInfoWindow(map, html, {
                            title  : item.name,      //标题
                            width  : 290,             //宽度
                            height : 105,              //高度
                            panel  : "panel",         //检索结果面板
                            enableAutoPan : true,     //自动平移
                            searchTypes   :[
                                BMAPLIB_TAB_SEARCH,   //周边检索
                                BMAPLIB_TAB_TO_HERE,  //到这里去
                                BMAPLIB_TAB_FROM_HERE //从这里出发
                            ]
                        });

                        searchInfoWindow.open(marker);
                    });
                }
            });
        }); 
    }
};



parent.window.position = window.position = function (item) {
    parent.geoneAjax.handleMapTemplate({
        tName: "bdPopUpContentView.txt", callback: function (IResultTemplate) {
            parent.laytpl(IResultTemplate).render(item, function (html) {
                var point = wktToBdPoint(item.shape);

                var searchInfoWindow = new BMapLib.SearchInfoWindow(map, html, {
                    title  : item.name,      //标题
                    width  : 290,             //宽度
                    height : 105,              //高度
                    panel  : "panel",         //检索结果面板
                    enableAutoPan : true,     //自动平移
                    searchTypes   :[
                        BMAPLIB_TAB_SEARCH,   //周边检索
                        BMAPLIB_TAB_TO_HERE,  //到这里去
                        BMAPLIB_TAB_FROM_HERE //从这里出发
                    ]
                });
                searchInfoWindow.open(point);

                // map.centerAndZoom(point, 15);  
            });
        }
    });


    
};

function wktToBdPoint(wktStr){
    var wkt = new Wkt.Wkt();

    wkt.read(wktStr);
    var shapeJson = wkt.toJson();
    
    return new BMap.Point(shapeJson.coordinates[0], shapeJson.coordinates[1]);
}
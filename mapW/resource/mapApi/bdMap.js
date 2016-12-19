$(function () {
    
    // initBdMap();
    initBdMapCompleted();
});

var map;
var mapPickedPoint;

var initBdMap = function() {
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "http://api.map.baidu.com/api?v=2.0&ak=shp0CX7jzC3xySBLVWqGT51xt4Oc8pyW&callback=initBdMapCompleted";
    document.body.appendChild(script);
}

var initBdMapCompleted = function() {
    map = new BMap.Map("map", {minZoom: 4, maxZoom: 16, enableMapClick:false});    // 创建Map实例

    map.setMapStyle({style:'grayscale'});

    //添加地图类型控件
    map.addControl(new BMap.MapTypeControl({mapTypes: [BMAP_NORMAL_MAP, BMAP_SATELLITE_MAP]}));
    map.addControl(new BMap.NavigationControl());    
    map.addControl(new BMap.ScaleControl());       
    map.enableScrollWheelZoom(true);

    map.centerAndZoom(new BMap.Point(120.6670992, 31.3117564), 15);  // 初始化地图,设置中心点坐标和地图级别
    map.setCurrentCity("苏州");          // 设置地图显示的城市 此项是必须设置的

    //map.centerAndZoom("苏州",15);  //dingyh 在此不起作用


    initPanoControl();
};

var initPanoControl = function(){
    // 覆盖区域图层测试
    //map.addTileLayer(new BMap.PanoramaCoverageLayer());

    var stCtrl = new BMap.PanoramaControl(); //构造全景控件
    stCtrl.setOffset(new BMap.Size(10, 35));
    map.addControl(stCtrl);//添加全景控件
}

parent.window.mapClear = window.mapClear = function () {
    map.clearOverlays();
};

parent.window.drawMarkToMap = window.drawMarkToMap = function (res, type, animate) {
    var markers = [];
    for(var i=0; i<res.length; i++){
        // var point = wktToBdPoint(res[i].shape);
        var point = latLngToBdPoint(res[i].shape[0], res[i].shape[1]);

        var myIcon;
        if(type === 'alarm'){
            if(animate){
                myIcon = new BMap.Icon("./resource/img/alarm/alarm_animate.gif", new BMap.Size(50, 50));
            } else {
                myIcon = new BMap.Icon("./resource/img/alarm/poi_alarm.png", new BMap.Size(30, 30), { anchor: new BMap.Size(15, 30) });
            }
        } else if(type === 'enterprise'){
            myIcon = new BMap.Icon("./resource/img/enterprise/poi_enterprise.png", new BMap.Size(30, 30), { anchor: new BMap.Size(15, 30) });
        }
            

        var marker = new BMap.Marker(point, {icon: myIcon});  // 创建标注
        
        map.addOverlay(marker);               // 将标注添加到地图中
        // marker.setAnimation(BMAP_ANIMATION_BOUNCE);
 
        addClickHandler(res[i], marker);
		
        if(i === 0){
            map.centerAndZoom(point, 15);

           
        }

        markers.push(marker);
    }

    if(animate){
        _.forEach(markers, function(marker) {
            setTimeout(function() {
                // marker.setAnimation(null);
                var staticIcon = new BMap.Icon("./resource/img/alarm/poi_alarm.png", new BMap.Size(30, 30), { anchor: new BMap.Size(15, 30) });
                marker.setIcon(staticIcon);
            }, 1000 * 10);
        });
    }

    
    function addClickHandler(item, marker){
        marker.addEventListener("click", function(e){
            parent.geoneAjax.handleMapTemplate({
                tName: "bdPopUpContentView.txt", callback: function (IResultTemplate) {
                    parent.laytpl(IResultTemplate).render(item, function (html) {
                        
                        showSearchInfoWindow(item.name, html, marker);
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
                // var point = wktToBdPoint(item.shape);
                var point = latLngToBdPoint(item.shape[0], item.shape[1]);

                showSearchInfoWindow(item.name, html, point);

                // map.centerAndZoom(point, 15);  
            });
        }
    });
};

parent.window.pickMapPoint = window.pickMapPoint = function (options) {
    map.setDefaultCursor("crosshair");
    map.addEventListener('click', pickMapPoint);

    function pickMapPoint(e){
        mapPickedPoint = e.point;

        map.removeEventListener('click', pickMapPoint);
        map.setDefaultCursor("default");

        options.callback(mapPickedPoint);
    }
   
}

function latLngToBdPoint(lat, lng){
    return new BMap.Point(lng, lat);
}

function wktToBdPoint(wktStr){
    var wkt = new Wkt.Wkt();

    wkt.read(wktStr);
    var shapeJson = wkt.toJson();
    
    return new BMap.Point(shapeJson.coordinates[0], shapeJson.coordinates[1]);
}

function showSearchInfoWindow(title, content, showPostion){
     var searchInfoWindow = new BMapLib.SearchInfoWindow(map, content, {
                    title  : title,      //标题
                    width  : 290,             //宽度
                    height : 205,              //高度
                    panel  : "panel",         //检索结果面板
                    enableAutoPan : true,     //自动平移
                    searchTypes   :[
                        BMAPLIB_TAB_SEARCH   //周边检索
                        // ,BMAPLIB_TAB_TO_HERE  //到这里去
                        // ,BMAPLIB_TAB_FROM_HERE //从这里出发
                    ]
                });
     searchInfoWindow.open(showPostion);

    $( "#tabs" ).tabs();        
}
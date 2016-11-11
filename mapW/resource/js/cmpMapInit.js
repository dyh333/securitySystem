/**
 * Created by zhengsl on 2016/8/23.
 */
var cmpMapInit=(function () {
    var map1, map2;
    var initCmp = function (leftLayerTree, rightLayerTree) {
        var baseMap = mapLayerConfig.getBaseMapByName("baseLayer");
        mapUtil.renderMap({
            id: 'map',
            callback: function (_map) {
                map1 = _map;
                layerManager.showBaseArcGisLayer(map1, baseMap);
                swipeLayerView.renderSwipeLayerView({id: 'leftView', map: map1, layerTrees: leftLayerTree});
                dojo.connect(map1, 'onLoad', function (theMap) {
                    dojo.connect(map1, "onMouseUp", mouseDrag);
                    dojo.connect(map1, "onZoomEnd", mouseScale);
                });
            }
        });
        mapUtil.renderMap({
            id: 'map2',
            callback: function (_map) {
                map2 = _map;
                layerManager.showBaseArcGisLayer(map2, baseMap);
                swipeLayerView.renderSwipeLayerView({id: 'rightView', map: map2, layerTrees: rightLayerTree});
                dojo.connect(map2, 'onLoad', function (theMap) {
                    dojo.connect(map2, "onMouseUp", mouseDrag2);
                    dojo.connect(map2, "onZoomEnd", mouseScale2);
                });
            }
        });

        function mouseDrag(evt) {
            map2.centerAndZoom(map1.extent.getCenter(), map1.getZoom());
        }

        function mouseScale(extent, zoomFactor, anchor, level) {
            map2.centerAndZoom(map1.extent.getCenter(), level);
        }

        function mouseDrag2(evt) {
            map1.centerAndZoom(map2.extent.getCenter(), map2.getZoom());
        }

        function mouseScale2(extent, zoomFactor, anchor, level) {
            map1.centerAndZoom(map2.extent.getCenter(), level);
        }
    };

    var initEvent = function () {
        var a = $("#map");
        var boxX = a.offset().left;
        var boxY = a.offset().top;
        var a2 = $("#map2");
        var boxX2 = a2.offset().left;
        var boxY2 = a2.offset().top;
        $('#map').hover(function (e) {
            $(document).mousemove(function (e) {
                var x = e.pageX;
                var y = e.pageY;
                var zX = x - boxX;
                var zY = y - boxY;
                var dw = $('#MMouse').width() / 2;
                var dh = $('#MMouse').height() / 2;
                $('#MMouse').css('display', 'block').css('left', zX + window.innerWidth / 2 - dw).css('top', zY - dh);
            });
            $(document).mousedown(function (e) {
                var m = $('#MMouse').css('background', 'rgba(255, 0, 0, 0.9)');
            });
            $(document).mouseup(function (e) {
                var m = $('#MMouse').css('background', 'rgba(255, 0, 0, 0.2)');
            });

        }, function () {
            $('#MMouse').css('display', 'none');
        });

        $('#map2').hover(function (e) {
            $(document).mousemove(function (e) {
                var x = e.pageX;
                var y = e.pageY;
                var zX = x - boxX2;
                var zY = y - boxY2;
                var dw = $('#MMouse').width() / 2;
                var dh = $('#MMouse').height() / 2;
                $('#MMouse').css('display', 'block').css('left', x - window.innerWidth / 2 - dw).css('top', y - dh);
            });
            $(document).mousedown(function (e) {
                var m = $('#MMouse').css('background', 'rgba(255, 0, 0, 0.9)');
            });
            $(document).mouseup(function (e) {
                var m = $('#MMouse').css('background', 'rgba(255, 0, 0, 0.2)');
            });
        }, function () {
            $('#MMouse').css('display', 'none');
        });
        /**按钮事件**/
        $(document).on("click", ".baseMapBarContainer li.dropDown", function () {
            $(this).toggleClass("active");
            $("#" + $(this).data("role") + "Container").slideToggle(200);
        });
    };

    return {
        init: function () {
            initEvent();
            var swipeLayerServiceUrl = mapLayerConfig.getServiceUrlByName("swipeLayerServiceKey");
            parent.geoneAjax.handleAjax({
                url: swipeLayerServiceUrl,
                data: {},
                callback: function (result) {
                    var leftLayerTree = mapLayerConfig.getConfigLayerTree(result.data.left.layers);
                    var rightLayerTree = mapLayerConfig.getConfigLayerTree(result.data.right.layers);
                    initCmp(leftLayerTree, rightLayerTree);
                }
            });
        }
    }
})();
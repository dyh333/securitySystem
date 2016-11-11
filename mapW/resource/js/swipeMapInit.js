/**
 * Created by zhengsl on 2016/8/23.
 */
var swipeMapInit=(function () {
    var map1,map2;
    var initSwipeMap = function (leftLayerTree,rightLayerTree) {
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

    var initEvent= function () {
        var winW = $(window).width();
        var winH = $(window).height();
        var DivM = $("#MMouse");
        var isMouseDown = false;
        $("#map,#map2").css("width", winW);
        DivM.css("left", (winW - DivM.width()) / 2 - 3).css("top", (winH - DivM.height()) / 2 - 3);

        DivM.mousedown(function (e) {
            isMouseDown = true;
            DivM.css('background', 'rgba(0, 0, 0, 0.6)');
            $(document).mousemove(function (e) {
                if (isMouseDown) {
                    var x = e.pageX;
                    var zX = x - DivM.offset().left;
                    var dw = DivM.width() / 2;
                    var dh = DivM.height() / 2;
                    DivM.css('left', x - DivM.width() / 2 - 3);
                    $('.zheZhao').css("width", x + 1);
                }
            });
        })
        $(document).mouseup(function () {
            isMouseDown = false;
            DivM.css('background', 'rgba(0, 0, 0, 0.2)');
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
                    initSwipeMap(leftLayerTree, rightLayerTree);
                }
            });
        }
    }
})();
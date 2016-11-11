/**
 * Created by zhengsl on 2016/8/17.
 */
var mapLayerConfig=parent.mapLayerConfig;
/***mapInit***/
var mapInit=(function () {
    "use strict";
    var moduleInit = function () {
        var modules = mapLayerConfig.getModules();
        $(modules).each(function (index, item) {
            if (item.name.toLowerCase() === 'mapview') {
                parent.geoneAjax.handleAjax({
                    url: item.serviceUrl, data: {}, callback: function (result) {
                        mapLayerConfig.setBaseMap(result.data.baseMap);
                        mapLayerConfig.setExtent(result.data.defaultMapExtent);
                        mapLayerConfig.setUserInitMap(result.data.userInitMaps);
                        mapLayerConfig.setTokenService(result.data.token);
                        mapLayerConfig.setSpatialReference(result.data.spatialReference);
                        mapUtil.renderMap({
                            id: 'map',
                            callback: function (_map) {
                                mapModule.renderModules(_map, modules);
                                eventInit(_map);
                            }
                        });
                    }
                });
                return false;
            }
        });
    };

    var eventInit = function (map) {
        /**legend**/
        basicTools.init(map);
        parent.window.setFullMap = function () {
            basicTools.fullMap(map);
        };
        parent.window.position = window.position = function (item) {
            require(['esri/geometry/Point'], function (Point) {
                wktToGeometry.startParse({
                    wkt: item.shape,
                    spatialReference: mapLayerConfig.getSpatialReference(),
                    callback: function (geometry) {
                        var point = mapLayerConfig.getGeometryCenter(geometry);
                        var mapPoint = new Point([point[0], point[1]], map.spatialReference);
                        infoPopup.showPopup(map, mapPoint, item);
                        map.centerAt(mapPoint);
                    }
                });
            });
        };
        parent.window.drawGeometryToMap = window.drawGeometryToMap = function (res, isPopup, isExtent, r) {
            mapDrawGraphics.drawGeometryListToMap(map, res, isPopup, isExtent, r);
        };
        parent.window.drawMarkToMap = window.drawMarkToMap = function (res, isPopup, isExtent) {
            mapDrawGraphics.drawMarkListToMap(map, res, isPopup, isExtent);
        };
        parent.window.drawGeometryByShape = window.drawGeometryByShape = function (shape, isPan) {
            mapDrawGraphics.drawGeometryByShape(map, shape, isPan);
        };
        parent.window.showHighLight = window.showHighLight = function (preId, nextId) {
            var mapGraphics = map.graphics.graphics;
            if (preId != null) {
                $(mapGraphics).each(function (index, g) {
                    if (parseInt(g.attributes.id) === preId) {
                        mapSymbol.getSymbolByName({
                            geometry: g.geometry, name: "default", callback: function (symbol) {
                                g.setSymbol(symbol);
                            }
                        });
                        return false;
                    }
                });
            }

            $(mapGraphics).each(function (index, g) {
                if (parseInt(g.attributes.id) === nextId) {
                    mapSymbol.getSymbolByName({
                        geometry: g.geometry, name: "highlight", callback: function (symbol) {
                            g.setSymbol(symbol);
                        }
                    });
                    map.setExtent(g.geometry.getExtent().expand(4));
                    return false;
                }
            });
        };
        parent.window.drawGeometryByEditTools = window.drawGeometryByEditTools = function (gType, callback) {
            drawEditTools.startDraw(map, gType, callback);
        };
        parent.window.drawBufferGeometryByEditTools = window.drawBufferGeometryByEditTools = function (gType, buffer, callback) {
            drawEditTools.startDrawBuffer(map, gType, buffer, callback);
        };
        parent.window.drawBufferByWKT = function (buffer, wkt, isExtent, callback) {
            drawEditTools.startDrawBufferByWKT(map, buffer, wkt, isExtent, callback);
        };
        parent.window.drawTextSymbol= function (text,fontColor) {
            drawEditTools.startDrawText(map, text,fontColor);
        };
        parent.window.printMap = function (title) {
            printMap.startPrint(map, title);
        };
        window.showLegend = function (legendName) {
            if ($("#legendContainer").length > 0) {
                $("#legendContainer").show();
                $("#legendContainer>.top").children("img").attr("src", "../resource/legend/" + legendName);
            }
            else
                parent.geoneAjax.handleMapTemplate({
                    tName: "legend.txt", callback: function (legendTemplate) {
                        parent.laytpl(legendTemplate).render({name: legendName}, function (html) {
                            var legendContainer = document.createElement("div");
                            legendContainer.id = "legendContainer";
                            legendContainer.innerHTML = html;
                            document.body.appendChild(legendContainer);
                            //绑定事件
                            $(document).on("click", "#legendContainer>.footer>img", function () {
                                $("#legendContainer").hide();
                            });
                        });
                    }
                });
        };
    };


    var initBdMap = function() {
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.src = "http://api.map.baidu.com/api?v=2.0&ak=shp0CX7jzC3xySBLVWqGT51xt4Oc8pyW&callback=mapInit.initBdMapCompleted";
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

    return {
        init: function () {
            moduleInit();
        },
        initBdMap: initBdMap,
        initBdMapCompleted: initBdMapCompleted
    }
})();
/***module***/
var mapModule= (function () {
    "use strict";
    var renderModule= function (map,options) {
        switch (options.name.toLowerCase()) {
            case  "basemapbars":
                //TODO 创建快速按钮模块
                baseMapBar.rendMapBars(map);
                break;
            case "toolsbar":
                //TODO 工具
                toolsBar.renderToolsBar(map, options);
                break;
            case "maplayer":
                //TODO 地图图层管理
                layerView.renderLayerView(map, options);
                break;
            case "quicksearch":
                //TODO 快速查询
                quickSearch.renderQuickSearch(map, options);
                quickSearchView.renderQuickSearchView();
                break;
            case "copyright":
                copyRight.renderCopyRight(options);
                break;
            default:
                break;
        }
    };
    return {
        renderModules: function (map,modules) {
            $(modules).each(function (index, item) {
                renderModule(map, item);
            });
        }
    }
})();
/***mapUtil***/
var mapUtil=(function () {
    "use strict";
    var map;
    var renderMap=function(options) {
        require([
            "esri/map",
            "esri/geometry/Extent",
            "esri/SpatialReference",
            "dojo/domReady!"
        ], function (Map,Extent,SpatialReference) {
            var spatialReference = new SpatialReference(mapLayerConfig.getSpatialReference());
            var extentStr = mapLayerConfig.getExtent();
            var initExtent = null;
            if (typeof(extentStr) === "object") {
                initExtent = extentStr;
            }
            else {
                var extentArray = extentStr.split(",");
                initExtent = new Extent(parseInt(extentArray[0]), parseInt(extentArray[1]), parseInt(extentArray[2]), parseInt(extentArray[3]), spatialReference);
            }

            map = new Map(options.id, {
                logo: false,
                extent: initExtent,
                slider: false,
                showAttribution: false,
                smartNavigation: false
            });
            mapLayerConfig.setExtent(initExtent);
            options.callback(map);
        });
    };
    return {
        renderMap: function (options) {
            renderMap(options);
        },
        getMap: function () {
            return map;
        }
    }
})();
/***baseMapBar baseMapInit***/
var baseMapBar=(function () {
    "use strict";
    var renderMap = function (map) {
        var baseMapLayers = mapLayerConfig.getBaseMap();
        parent.geoneAjax.handleMapTemplate({
            tName: "baseMapBarView.txt", callback: function (baseMapBarTemplate) {
                parent.laytpl(baseMapBarTemplate).render(baseMapLayers, function (html) {
                    var baseMapContainer = document.createElement("div");
                    baseMapContainer.id = "baseMapBarContainer";
                    baseMapContainer.className = "baseMapBarContainer";
                    baseMapContainer.innerHTML = html;
                    document.body.appendChild(baseMapContainer);
                    bindEvent(map, baseMapLayers);
                });
            }
        });

        showInitMap(map, baseMapLayers);
    };

    var showInitMap= function (map,baseMapLayers) {
        $(baseMapLayers).each(function (index, item) {
            if (parseInt(item.defaultVisible) === 1) {
                layerManager.showBaseArcGisLayer(map, item);
                return false;
            }
        });
    };

    var bindEvent= function (map,baseMapLayers) {
        $(document).on("click", "#baseMapBarContainer li.baseBtn", function () {
            if ($(this).hasClass("active"))return false;
            $(this).siblings("li.baseBtn.active").removeClass("active").children("span").removeClass("active");
            $(this).addClass("active").children("span").addClass("active");
            //执行切换
            var baseLayerId = $(this).attr("id");
            $(baseMapLayers).each(function (index, item) {
                if (item.name.toLowerCase() === baseLayerId.toLocaleLowerCase()) {
                    layerManager.showBaseArcGisLayer(map, item);
                    return false;
                }
            });
        });

        rightMenu(map);
    };

    var rightMenu= function (map) {
        context.init({preventDoubleContext: false, map: map, basicTools: basicTools});
        context.attach('#baseMapBarContainer .baseMap', [
            {
                header: '透明度'
            },
            {
                header: '<input id="slider_mapBar" type="range" name="points" min="0" max="1"  step="0.1" value="0"/>'
            }
        ]);
    };

    return {
        rendMapBars: function (map) {
            renderMap(map);
        }
    }
})();
/***toolsBar***/
var toolsBar=(function () {
    "use strict";
    var renderToolsBar = function (map, options) {
        parent.geoneAjax.handleAjax({
            url: options.serviceUrl, callback: function (res) {
                showToolsBarView(map,res.data.toolBar);
            }
        });
    };

    var showToolsBarView=function(map,toolsBarData) {
        parent.geoneAjax.handleMapTemplate({
            tName: "toolsBarView.txt", callback: function (toolsBarTemplate) {
                parent.laytpl(toolsBarTemplate).render(toolsBarData, function (html) {
                    var toolsBarContainer = document.createElement("div");
                    toolsBarContainer.id = "toolsBarContainer";
                    toolsBarContainer.innerHTML = html;
                    document.body.appendChild(toolsBarContainer);
                    bindEvent(map);
                });
            }
        });
    };

    var bindEvent= function (map) {
        $(document).on("click", "#toolBar", function () {
            $(this).toggleClass("active");
            $(this).siblings("ul").toggle();
        });

        $(document).on("click", "#toolsBarContainer li>span", function () {
            switch ($(this).attr("id").toLowerCase()) {
                case "mapscreen":
                    basicTools.fullMap(map);
                    break;
                case "fullscreen":
                    $(this).toggleClass("active");
                    if ($(this).hasClass("active"))
                        basicTools.fullScreen("main", "open");
                    else
                        basicTools.fullScreen("main", "close");
                    break;
                case "zoomin":
                    basicTools.zoomIn(map);
                    break;
                case "zoomout":
                    basicTools.zoomOut(map);
                    break;
                case "iquerytool":
                    $(this).toggleClass("active");
                    if ($(this).hasClass("active"))
                        basicTools.iQueryTool(map, "open");
                    else
                        basicTools.iQueryTool(map, "close");
                    break;
                case "clear":
                    basicTools.clear(map);
                    break;
                case "measurelength":
                    basicTools.measureLength(map);
                    break;
                case "measurearea":
                    basicTools.measureArea(map);
                    break;
                case "swipemap":
                    basicTools.swipeMap();
                    break;
                case "cmpmap":
                    basicTools.cmpMap();
                    break;
                case 'querybuilding':
                    $(this).toggleClass("active");
                    if ($(this).hasClass("active"))
                        basicTools.queryBuilding(map, "open");
                    else
                        basicTools.queryBuilding(map, "close");
                    break;
                case 'print':
                    basicTools.print(map);
                    break;
                default:
                    break;
            }
        });

        $("#toolsBarContainer li.dropDownList").hover(function () {
            $(this).toggleClass("nav-hover");
        });
    };

    return {
        renderToolsBar: function (map, options) {
            renderToolsBar(map, options);
        }
    }
})();
/***layerView***/
var layerView=(function () {
    "use strict";
    var renderLayerView = function (map, options) {
        var layerBtnHtml = '<li id="layerView" data-role="layerView" class="dropDown"><span class="Icon Icon-layerView"></span>图层</li>';
        var baseMapBarContainer = null;
        var timer = setInterval(function () {
            baseMapBarContainer = $('#baseMapBarContainer');
            if (baseMapBarContainer.length > 0) {
                baseMapBarContainer.children("ul").append(layerBtnHtml);
                clearInterval(timer);
                bindEvent(map, options);
            }
        }, 100);
    };

    var layersTree = null;
    var bindEvent = function (map, options) {
        $("#baseMapBarContainer li.dropDown").click(function () {
            $(this).toggleClass("active").children("span").addClass("Icon-rotating");
            if (layersTree != null) {
                $("#" + $(this).data("role") + "Container").slideToggle(200);
                $(this).children("span").removeClass("Icon-rotating");
            }
            else
                showLayerContainer(map, options);
        });

        $(document).on("click", "#layerCloseAll", function () {
            $('#layerTree').treeview('uncheckAll', {silent: true});
            $(mapLayerConfig.getLayerIds()).each(function (index, layerId) {
                layerManager.closeLayerArcGisLayerById(map, layerId);
            });
            mapLayerConfig.clearLayerId();
        });

        $(window).resize(function () {
            $("#layerTree").css("max-height", $(window).height() - 130 + "px");
        });
    };

    var showLayerContainer = function (map, options) {
        parent.geoneAjax.handleMapTemplate({
            tName: "layerView.txt", callback: function (layerViewTemplate) {
                var baseMapContainer = document.createElement("div");
                baseMapContainer.id = "layerViewContainer";
                baseMapContainer.className = "layerViewContainer baseBarDetailContainer";
                baseMapContainer.innerHTML = layerViewTemplate;
                document.body.appendChild(baseMapContainer);
                showLayerTree(map, options)
            }
        });
    };

    var showLayerTree = function (map, options) {
        parent.geoneAjax.handleAjax({
            url: options.serviceUrl, data: {}, callback: function (result) {
                layersTree = mapLayerConfig.getConfigLayerTree(result.data.mapLayers);
                $('#layerTree').treeview({
                    data: layersTree,
                    levels: 2,
                    animate: true,
                    backColor: 'white',
                    expandIcon: 'icon-caret-right',
                    collapseIcon: 'icon-caret-down',
                    showCheckbox: true,
                    checkedIcon: 'icon-check',
                    uncheckedIcon: 'icon-check-empty',
                    onNodeChecked: function (event, data) {
                        layerManager.showLayerArcGisLayer(map, data, 'open');
                        mapLayerConfig.addLayerId(data.ID);
                    },
                    onNodeUnchecked: function (event, data) {
                        layerManager.showLayerArcGisLayer(map, data, 'close');
                        mapLayerConfig.removeLayerId(data.ID);
                    }
                });
                $("#layerTree").css("max-height", $(window).height() - 130 + "px");
                $("#layerView").children("span").removeClass("Icon-rotating");
                bindRightMenu(map);
            }
        });
    };

    var bindRightMenu = function (map) {
        context.init({preventDoubleContext: false, map: map, basicTools: basicTools});
        context.attach('#layerTree .list-group-item', [
            {
                text: '图层置顶',
                action: function (selector) {
                    var id = $(selector).data('id');
                    if (typeof(id) === 'undefined')
                        id = $(selector).children('p').data('id');
                    basicTools.pullTop(map, id);
                }
            },
            {divider: true},
            {
                text: '上移一层',
                action: function (selector) {
                    var id = $(selector).data('id');
                    if (typeof(id) === 'undefined')
                        id = $(selector).children('p').data('id');
                    basicTools.pullPre(map, id);
                }
            },
            {
                text: '下移一层',
                action: function (selector) {
                    var id = $(selector).data('id');
                    if (typeof(id) === 'undefined')
                        id = $(selector).children('p').data('id');
                    basicTools.pullNext(map, id);
                }
            },
            {divider: true},
            {
                text: '图层置底',
                action: function (selector) {
                    var id = $(selector).data('id');
                    if (typeof(id) === 'undefined')
                        id = $(selector).children('p').data('id');
                    basicTools.pullLast(map, id);
                }
            },
            {divider: true},
            {
                header: '透明度'
            },
            {
                header: '<input id="slider_layerView" type="range" name="points" min="0" max="10"  step="1" value="0"/>'
            }
        ]);
    };
    return {
        renderLayerView: function (map, options) {
            renderLayerView(map, options);
        }
    }
})();
/****swipeLayerView****/
var swipeLayerView=(function () {
    var showLayerTree = function (id, map, layerTrees) {
        $('#' + id).treeview({
            data: layerTrees,
            levels: 2,
            animate: true,
            backColor: 'white',
            expandIcon: 'icon-caret-right',
            collapseIcon: 'icon-caret-down',
            showCheckbox: true,
            checkedIcon: 'icon-check',
            uncheckedIcon: 'icon-check-empty',
            onNodeChecked: function (event, data) {
                layerManager.showLayerArcGisLayer(map, data, 'open');
                mapLayerConfig.addLayerId(data.ID);
            },
            onNodeUnchecked: function (event, data) {
                layerManager.showLayerArcGisLayer(map, data, 'close');
                mapLayerConfig.removeLayerId(data.ID);
            }
        });
    };

    return {
        renderSwipeLayerView: function (options) {
            showLayerTree(options.id, options.map, options.layerTrees)
        }
    }
})();
/***quickSearch***/
var quickSearch=(function () {
    var quickSearchUrl=null;
    var renderQuickSearch= function (map, options) {
        parent.geoneAjax.handleAjax({
            url: options.serviceUrl, data: {}, callback: function (res) {
                quickSearchUrl=res.data[0].url;
                parent.geoneAjax.handleMapTemplate({
                    tName: "quickSearchView.txt?v=1.0.0", callback: function (quickSearchTemplate) {
                        parent.laytpl(quickSearchTemplate).render(res.data, function (html) {
                            var quickSearchContainer = document.createElement("div");
                            quickSearchContainer.id = "quickSearchContainer";
                            quickSearchContainer.className = "searchPanel quickSearch";
                            quickSearchContainer.innerHTML = html;
                            document.body.appendChild(quickSearchContainer);
                            bindEvent();
                        });
                    }
                });
            }
        });
    };

    var bindEvent= function () {
        $("#quickSearchContainer").on("change", "#quickSearchSelect", function () {
            $('#quickSearchKey').val($(this).val());
            quickSearchUrl = $(this).find("option:selected").data('url');
        });
        $("#quickSearchContainer").on('click', '#quickSearchBtn', function () {
            startSearch();
        });
        //绑定enter事件
        $("#quickSearchContainer").on('keydown', '#quickSearchKey', function (e) {
            if (e.keyCode == 13) {
                startSearch();
            }
        });
    };

    var startSearch= function () {
        $("#quickSearchContainer").children("span.Icon-rotating").show();
        if (!quickSearchUrl)return false;
        parent.geoneAjax.handleAjaxWithNoBack({
            url: quickSearchUrl, data: {key: $("#quickSearchKey").val()}, callback: function (res) {
                $("#quickSearchContainer").children("span.Icon-rotating").hide();
                window.mapClear();
                if (parseInt(res.status) === 1) {
                    quickSearchView.showSearchResult(res.data, 1);
                }
            }
        });
    };

    return {
        renderQuickSearch: function (map, options) {
            renderQuickSearch(map, options);
        }
    }
})();
/**copyRight**/
var copyRight=(function () {
    return {
        renderCopyRight: function (options) {
            var copyRight = document.createElement("span");
            copyRight.innerText = "© " + options.config;
            copyRight.className = "copyRight";
            document.body.appendChild(copyRight);
        }
    }
})();
/***layerManager***/
var layerManager= (function () {
    "use strict";
    var baseMapLayerManager = function (map, options) {
        //判断图层是否存在，然后执行相关操作
        var layerIds = map.layerIds;
        if (layerIds.length > 0) {
            var baseMapLayers = mapLayerConfig.getBaseMap();
            baseMapLayers.forEach(function (baseMap) {
                if (baseMap.name != options.name) {
                    var baseLayer = map.getLayer(baseMap.name);
                    if (typeof(baseLayer) != 'undefined') {
                        baseLayer.setVisibility(false);
                    }
                }
            });
        }

        var currentMap = map.getLayer(options.name);
        if (typeof(currentMap) != 'undefined') {
            currentMap.setVisibility(true);
        }
        else {
            var layerCount = map.layerIds.length;
            switch (options.layerType) {
                case 'tile':
                    require(['esri/layers/ArcGISTiledMapServiceLayer', 'dojo/domReady!'], function (ArcGISTiledMapServiceLayer) {
                        var tileMapLayer;
                        var url = options.serviceUrl;
                        if (!options.tokenName === false) {
                            mapLayerConfig.getTokenById(options.tokenName, function (tokenStr) {
                                url = url + '?token=' + tokenStr;
                                tileMapLayer = new ArcGISTiledMapServiceLayer(url, {
                                    id: options.name,
                                    opacity: parseFloat(options.opacity)
                                });
                                if (layerCount === 0)
                                    map.addLayer(tileMapLayer);
                                else
                                    map.addLayer(tileMapLayer, 1);
                            });
                        }
                        else {
                            tileMapLayer = new ArcGISTiledMapServiceLayer(url, {
                                id: options.name,
                                opacity: parseFloat(options.opacity)
                            });
                            if (layerCount === 0)
                                map.addLayer(tileMapLayer);
                            else
                                map.addLayer(tileMapLayer, 1);
                        }
                    });
                    break;
                case 'dynamic':
                    require(['esri/layers/ArcGISDynamicMapServiceLayer', 'dojo/domReady!'], function (ArcGISDynamicMapServiceLayer) {
                        var dynamicMapLayer;
                        var url = options.serviceUrl;
                        var visibleLayerIds = [];
                        var layerDefs = [];
                        $(options.visibleLayers.split(',')).each(function (index, layerId) {
                            if (options.filter != '')
                                layerDefs.push(options.filter);
                            visibleLayerIds.push(parseInt(layerId));
                        });
                        if (!options.tokenName === false) {
                            mapLayerConfig.getTokenById(options.tokenName, function (tokenStr) {
                                url = url + '?token=' + tokenStr;
                                dynamicMapLayer = new ArcGISDynamicMapServiceLayer(url, {
                                    id: options.name,
                                    opacity: parseFloat(options.opacity)
                                });
                                dynamicMapLayer.setVisibleLayers(visibleLayerIds);
                                if (layerDefs.length > 0)
                                    dynamicMapLayer.setLayerDefinitions(layerDefs);
                                if (layerCount === 0)
                                    map.addLayer(dynamicMapLayer);
                                else
                                    map.addLayer(dynamicMapLayer, 1);
                            });
                        }
                        else {
                            dynamicMapLayer = new ArcGISDynamicMapServiceLayer(url, {
                                id: options.name,
                                opacity: parseFloat(options.opacity)
                            });
                            dynamicMapLayer.setVisibleLayers(visibleLayerIds);
                            if (layerDefs.length > 0)
                                dynamicMapLayer.setLayerDefinitions(layerDefs);
                            if (layerCount === 0)
                                map.addLayer(dynamicMapLayer);
                            else
                                map.addLayer(dynamicMapLayer, 1);
                        }
                    });
                    break;
                case 'iis':
                    initIISLayer.Init();
                    parent.geoneAjax.handleIISAjax({
                        url: 'resource/config/conf.json', data: {}, callback: function (json) {
                            var tiledMapServiceLayer = new my.PortlandTiledMapServiceLayer(
                                options.serviceUrl,
                                {
                                    layerId: options.name,
                                    opacity: options.opacity
                                },
                                json
                            );
                            if (layerCount === 0)
                                map.addLayer(tiledMapServiceLayer);
                            else
                                map.addLayer(tiledMapServiceLayer, 1);
                        }
                    });
                    break;
                default:
                    break;
            }
        }
    };

    var layerManager = function (map, options) {
        //判断图层是否存在，然后执行相关操作
        switch (options.layerType) {
            case 'tile':
                require(['esri/layers/ArcGISTiledMapServiceLayer', 'dojo/domReady!'], function (ArcGISTiledMapServiceLayer) {
                    var tileMapLayer = null;
                    var url = options.serviceUrl;
                    if (options.tokenName != '') {
                        mapLayerConfig.getTokenById(options.tokenName, function (tokenStr) {
                            url = url + '?token=' + tokenStr;
                            tileMapLayer = new ArcGISTiledMapServiceLayer(url, {
                                id: options.ID,
                                className: options.geometryType,
                                opacity: parseFloat(options.opacity)
                            });
                            map.addLayer(tileMapLayer);
                        });
                    }
                    else {
                        tileMapLayer = new ArcGISTiledMapServiceLayer(url, {
                            id: options.ID,
                            className: options.geometryType,
                            opacity: parseFloat(options.opacity)
                        });
                        map.addLayer(tileMapLayer);
                    }
                });
                break;
            case 'dynamic':
                require(['esri/layers/ArcGISDynamicMapServiceLayer', 'dojo/domReady!'], function (ArcGISDynamicMapServiceLayer) {
                    var dynamicMapLayer = null;
                    var url = options.serviceUrl;
                    var visibleLayerIds = [];
                    var layerDefs = [];
                    $(options.visibleLayers.split(',')).each(function (index, layerId) {
                        if (options.filter != '')
                            layerDefs.push(options.filter);
                        visibleLayerIds.push(parseInt(layerId));
                    });
                    if (options.tokenName != '') {
                        mapLayerConfig.getTokenById(options.tokenName, function (tokenStr) {
                            url = url + '?token=' + tokenStr;
                            dynamicMapLayer = new ArcGISDynamicMapServiceLayer(url, {
                                id: options.ID,
                                className: options.geometryType,
                                opacity: parseFloat(options.opacity)
                            });
                            dynamicMapLayer.setVisibleLayers(visibleLayerIds);
                            //TODO 设置筛选条件
                            if (layerDefs.length > 0)
                                dynamicMapLayer.setLayerDefinitions(layerDefs);
                            map.addLayer(dynamicMapLayer);
                            //insertLayer(map,options.type,dynamicMapLayer);
                        });
                    }
                    else {
                        dynamicMapLayer = new ArcGISDynamicMapServiceLayer(url, {
                            id: options.ID,
                            className: options.geometryType,
                            opacity: parseFloat(options.opacity)
                        });
                        dynamicMapLayer.setVisibleLayers(visibleLayerIds);
                        //TODO 设置筛选条件
                        if (layerDefs.length > 0)
                            dynamicMapLayer.setLayerDefinitions(layerDefs);
                        map.addLayer(dynamicMapLayer);
                    }
                });
                break;
            default:
                break;
        }
    };

    return {
        showBaseArcGisLayer: function (map, options) {
            baseMapLayerManager(map, options);
        },
        showLayerArcGisLayer: function (map, options, lState) {
            var layer = map.getLayer(options.ID);
            if (lState.toLowerCase() === 'open') {
                if (typeof(layer) != 'undefined')
                    layer.setVisibility(true);
                else
                    layerManager(map, options);
            }
            else {
                if (typeof(layer) != 'undefined')
                    layer.setVisibility(false);

            }
        },
        closeLayerArcGisLayerById: function (map, layerId) {
            var layer = map.getLayer(layerId);
            if (typeof(layer) != 'undefined') {
                layer.setVisibility(false);
            }
        }
    }
})();
/***mapBasicTools***/
var basicTools=(function () {
    "use strict";
    var map = null;
    /**获取图层最大最小编号**/
    var layerTool = function (map, id) {
        var layer = map.getLayer(id);
        if (typeof(layer) === 'undefined')
            return false;
        var layerIds = map.layerIds;
        var nowIndex = 0;
        $(layerIds).each(function (index, item) {
            if (id === item) {
                nowIndex = index;
                return false;
            }
        });
        return {maxIndex: layerIds.length, minIndex: 1, layer: layer, nowIndex: nowIndex};
    };
    /*mapClear*/
    var mapClear = function (map) {
        parent.mapLayerConfig.setDrawShape(null);
        $("#measure").remove();
        var layerId = map.graphicsLayerIds;
        layerId.forEach(function (graphicId) {
            var graphicLayer = map.getLayer(graphicId);
            if (typeof(graphicLayer) != 'undefined') {
                graphicLayer.clear();
            }
        });
        map.infoWindow.hide();
        map.graphics.clear();
    };

    return {
        init: function (_map) {
            map = _map;
            window.mapClear = function () {
                mapClear(map);
            };
            parent.window.mapClear = function () {
                mapClear(map);
            };
        },
        fullMap: function (map) {
            var mapExtent = mapLayerConfig.getExtent();
            map.setExtent(mapExtent);
        },
        fullScreen: function (frameId, state) {
            //地图全屏
            if (state === 'open')
                parent.window.fullScreenOpen(frameId);
            else
                parent.window.fullScreenClose();
        },
        zoomIn: function (map) {
            var maxZoom = map.getMaxZoom();
            var currentZoom = map.getZoom();
            currentZoom = currentZoom < maxZoom ? currentZoom + 1 : maxZoom;
            map.setZoom(currentZoom);
        },
        zoomOut: function (map) {
            var minZoom = map.getMinZoom();
            var currentZoom = map.getZoom();
            currentZoom = currentZoom > minZoom ? currentZoom - 1 : minZoom;
            map.setZoom(currentZoom);
        },
        measureLength: function (map) {
            measure.measureLength(map);
        },
        measureArea: function (map) {
            measure.measureArea(map);
        },
        position: function (map) {
            parent.MyLayer.showModalWindow('坐标定位', '280', '170', 'modules/positionMap.html', 'rb');
        },
        iQueryTool: function (map, lType) {
            if (lType === 'open')
                iQueryMap.startQuery(map);
            else
                iQueryMap.offQuery();
        },
        queryBuilding: function (map, lType) {
            if (lType.toLowerCase() === 'open')
                buildingTable.startQuery(map);
            else
                buildingTable.offQuery();
        },
        geometrySearch: function (map, sType) {
            this.clear(map);
            require(['geone/mapQuery/geometrySearch', 'dojo/domReady!'], function (geometrySearch) {
                geometrySearch.startQuery(map, sType);
            });
        },
        swipeMap: function () {
            parent.showSecondMap({name: "图层拉框对比", href: "mapW/swipeMap.html"});
        },
        cmpMap: function () {
            parent.showSecondMap({name: "双窗口图层对比", href: "mapW/cmpMap.html"});
        },
        print: function (map) {
            parent.myLayer.showModalWindow("生成专题图", 300, 260, 'businessModule/print/print.html');
        },
        clear: function (map) {
            mapClear(map);
        },
        pullTop: function (map, id) {
            var layerConfig = layerTool(map, id);
            if (layerConfig.maxIndex === layerConfig.nowIndex)
                return false;
            else {
                map.reorderLayer(layerConfig.layer, layerConfig.maxIndex);
            }
        },
        pullPre: function (map, id) {
            var layerConfig = layerTool(map, id);
            if (layerConfig.nowIndex === layerConfig.maxIndex)
                return false;
            else {
                map.reorderLayer(layerConfig.layer, layerConfig.nowIndex + 1);
            }
        },
        pullNext: function (map, id) {
            var layerConfig = layerTool(map, id);
            if (layerConfig.nowIndex === 1)
                return false;
            else {
                map.reorderLayer(layerConfig.layer, layerConfig.nowIndex - 1);
            }
        },
        pullLast: function (map, id) {
            var layerConfig = layerTool(map, id);
            map.reorderLayer(layerConfig.layer, layerConfig.minIndex);
        },
        changeOpacity: function (map, id) {
            var layer = map.getLayer(id);
            if (typeof(layer) === 'undefined')
                return 0;
            else
                return layer.opacity;
        }
    }
})();
/***iQuery***/
var iQueryMap=(function () {
    "use strict";
    var iServiceUrl = null,ajaxServiceUrl = null,mapClickEvent = null;
    var iQueryMap = function (map) {
        if (!iServiceUrl)
            iServiceUrl = mapLayerConfig.getServiceUrlByName('iQueryServiceKey');
        if (!iServiceUrl) {
            $('#iQueryTool').removeClass('active');
            //parent.layer.msg("请先配置iQueryMap模块", {icon: 2, time: 2000});
            return false;
        }
        //地图绑定I查询
        mapClickEvent = map.on("click", function (e) {
            var mapPoint = e.mapPoint, layerIds = mapLayerConfig.getLayerIds();
            if (layerIds.length === 0)return false;
            ajaxServiceUrl = iServiceUrl + '&x=' + mapPoint.x + '&y=' + mapPoint.y + '&layerIds=' + layerIds.join(',');
            //TODO 执行查询
            parent.geoneAjax.handleIAjax({
                url: ajaxServiceUrl, data: {}, callback: function (json) {
                    window.mapClear();
                    if (json.data.length === 0) {
                        return false;
                    }
                    if (json.data.length > 1)
                        quickSearchView.showSearchResult(json.data,1);
                    else {
                        quickSearchView.hideSearchResult();
                        window.drawGeometryToMap([json.data[0]], false, false);
                        infoPopup.showPopup(map, mapPoint, json.data[0]);
                    }
                }
            });
        });
    };
    return{
        startQuery: function (map) {
            iQueryMap(map);
        },
        offQuery: function () {
            mapClickEvent.remove();
        }
    }
})();
/***measure length or area***/
var measure=(function () {
    "use strict";
    var measureToolbar=null,showPt=null,symbol=null;
    var startMeasureArea=function(map) {
        startMeasure(map,'polygon');
    };

    var startMeasureLength=function(map) {
        startMeasure(map,'polyline');
    };

    var startMeasure=function(map,mType) {
        window.mapClear();
        require([
            'esri/toolbars/draw',
            'esri/layers/GraphicsLayer',
            'esri/symbols/SimpleLineSymbol',
            'esri/symbols/SimpleFillSymbol',
            'esri/graphic',
            'esri/Color',
            'esri/geometry/Point',
            'esri/geometry/mathUtils'
        ], function (Draw, GraphicsLayer, SimpleLineSymbol, SimpleFillSymbol, Graphic, Color, Point,MathUtils) {
            //初始化绘图工具
            if (measureToolbar != null)measureToolbar.deactivate();
            measureToolbar = new Draw(map, {
                tooltipOffset: 20,
                drawTime: 90
            });
            measureToolbar.deactivate();
            map.setMapCursor("default");
            switch (mType) {
                case "polyline":
                    measureToolbar.activate(Draw.POLYLINE);
                    symbol = new SimpleLineSymbol(
                        SimpleLineSymbol.STYLE_SOLID,
                        new Color([253, 128, 68]), 3);
                    break;
                case "polygon":
                    measureToolbar.activate(Draw.POLYGON);
                    var symbolLineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([253, 128, 68]), 2);
                    symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, symbolLineSymbol, new Color([0, 255, 123, 0.4]));
                    break;
                default:
                    break;
            }
            //绑定事件
            measureToolbar.on("draw-end", function (evt) {
                //取消事件
                measureToolbar.deactivate();
                var geometry = evt.geometry;
                var graphic = new Graphic(geometry, symbol);
                map.graphics.add(graphic);

                var pointLength;
                //计算距离
                if (geometry.type === "polyline") {
                    pointLength = geometry.paths[0].length;
                    showPt = new Point(geometry.paths[0][pointLength - 1], map.spatialReference);
                    var length = measureLength(geometry.paths[0]);
                    measureInfo(showPt, length, "米", map);
                }

                if (geometry.type === "polygon") {
                    pointLength = geometry.rings[0].length;
                    showPt = new Point(geometry.rings[0][pointLength - 1], map.spatialReference);
                    //showPt = geometry.getCentroid();
                    var area = measureArea(geometry.rings[0]);
                    measureInfo(showPt, area, "平方米", map);
                }
            });

            var measureLength = function (paths) {
                var length = 0;
                for (var i = 0; i < paths.length - 1; ++i) {
                    length = length + MathUtils.getLength(convertPoint(paths[i]), convertPoint(paths[i + 1]));
                }
                return length.toFixed(2);
            };
            var convertPoint = function (pathNode) {
                return new Point(pathNode[0], pathNode[1], map.spatialReference);
            };
        });
    };

    var measureArea = function(rings) {
        var length = rings.length;
        var s = 0;
        var area;
        for (var i=0; i<length; ++i) {
            var j = (i + 1) % length;
            s+= (rings[i][0] * rings[j][1] - rings[i][1] * rings[j][0]);
        }

        area =Math.abs(s/2);
        return parseFloat(area.toFixed(2));
    };

    var measureInfo = function(showPnt,data,unit,map) {
        if ($('#measure').length ===0)
            $('body').append('<div id="measure" class="floatDom"><span id="result" class="measureResult"></span><a id="infoClose" class="measureInfoClose" href="javascript:void(0)">×</a></div>');
        var measureDiv = $("#measure");
        var isShow = false;
        var screenPnt = map.toScreen(showPnt);
        measureDiv.css("left", (screenPnt.x + 0) + "px");
        measureDiv.css("top", (screenPnt.y + 0) + "px");
        measureDiv.css("position", "absolute");
        measureDiv.css("height", "25px");
        measureDiv.css("line-height", "25px");
        measureDiv.css("display", "block");
        isShow = true;
        measureDiv.css("z-index", "999");
        if (unit === "千米") {
            measureDiv.css("width", "90px");
        } else {
            measureDiv.css("width", "130px");
        }

        $("#result").html(data + unit);
        $("#infoClose").one("click", function (e) {
            measureDiv.css("display", "none");
            isShow = false;
            measureToolbar.deactivate();
            //删除绑定的Graphic
            window.mapClear();
        });

        map.on("pan-start", function () {
            measureDiv.css("display", "none");
        });

        map.on("pan-end", function (panend) {
            if (isShow == true) {
                screenPnt = map.toScreen(showPnt);
                measureDiv.css("left", screenPnt.x + "px");
                measureDiv.css("top", screenPnt.y + "px");
                measureDiv.css("display", "block");
            }
        });

        map.on("zoom-start", function () {
            measureDiv.css("display", "none");
        });

        map.on("zoom-end", function () {
            if (isShow == true) {
                screenPnt = map.toScreen(showPnt);
                measureDiv.css("left", screenPnt.x + 0 + "px");
                measureDiv.css("top", screenPnt.y + 0 + "px");
                measureDiv.css("display", "block");
            }
        });
    };

    return {
        measureLength: function (map) {
            startMeasureLength(map);
        },
        measureArea: function (map) {
            startMeasureArea(map);
        }
    }
})();
/**quickSearchResultView**/
var quickSearchView=(function () {
    var queryResult = null, newQueryResult = null;
    var renderQuickSearchView = function () {
        parent.geoneAjax.handleMapTemplate({
            tName: "quickSearchResultView.txt?v=1.0.0", callback: function (quickSearchResultTemplate) {
                var quickSearchResultContainer = document.createElement("div");
                quickSearchResultContainer.id = "quickSearchResult";
                quickSearchResultContainer.className = "quickSearchResult";
                quickSearchResultContainer.innerHTML = quickSearchResultTemplate;
                document.body.appendChild(quickSearchResultContainer);
                bindEvent();
            }
        });
    };

    var bindEvent = function () {
        $("#quickSearchResult").on("click", "#closeQuickSearchPanel", function () {
            window.mapClear();
            $("#quickSearchResult").slideUp(200);
        });
    };

    var showResult = function (type) {
        $("#resultTotal").html(queryResult.length);
        //设置高度
        if (Math.ceil(queryResult.length / 10) > 1) {
            $("#footerPage").show();
            $("#resultContent").css("max-height", $(window).height() - 180 + 'px');
        }
        else {
            $("#footerPage").hide();
            $("#resultContent").css("max-height", $(window).height() - 140 + 'px');
        }
        laypage({
            cont: 'footerPage', //容器。值支持id名、原生dom对象，jquery对象。【如该容器为】：<div id="page1"></div>
            pages: Math.ceil(queryResult.length / 10), //通过后台拿到的总页数
            curr: 1, //当前页
            first: false,
            last: false,
            jump: function (obj, first) { //触发分页后的回调
                if (!first) {
                    showResultListItem(obj.curr);
                }
            }
        });
        showResultListItem(1, type);
    };

    var showResultListItem = function (page, type) {
        newQueryResult = [];
        for (var i = 10 * (page - 1), len = queryResult.length; i < len; i++) {
            if (len <= page * 10)
                newQueryResult.push(queryResult[i]);
            else if (i < page * 10) {
                newQueryResult.push(queryResult[i]);
            }
        }
        parent.geoneAjax.handleMapTemplate({
            tName: "quickSearchListItemView.txt?v=1.0.0", callback: function (queryTemplate) {
                parent.laytpl(queryTemplate).render(newQueryResult, function (html) {
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
        window.mapClear();
        if (type === 1) {
            window.drawGeometryToMap(newQueryResult, false, false);
            window.drawMarkToMap(newQueryResult, true, false);
        }
        else {
            window.drawGeometryToMap(newQueryResult, false, true);
            window.drawMarkToMap(newQueryResult, true, false);
        }
    };

    return {
        renderQuickSearchView: function () {
            renderQuickSearchView();
        },
        showSearchResult: function (res, type) {
            $("#quickSearchResult").slideDown(200);
            queryResult = res;
            showResult(type);
        },
        hideSearchResult: function () {
            $("#quickSearchResult").slideUp(200);
        },
        position: function (id) {
            $(newQueryResult).each(function (index, item) {
                if (parseInt(item.id) === id) {
                    window.position(item);
                    return false;
                }
            });
        }
    }
})();
/***infoPopup***/
var infoPopup=(function () {
    "use strict";
    return {
        showPopup: function (map, centerPt, jsonResult) {
            parent.geoneAjax.handleMapTemplate({
                tName: "iQueryResultView.txt", callback: function (IResultTemplate) {
                    parent.laytpl(IResultTemplate).render(jsonResult, function (html) {
                        map.infoWindow.setContent(html);
                    });
                }
            });
            map.infoWindow.setTitle(jsonResult.name);
            var screenPoint = map.toScreen(centerPt);
            map.infoWindow.show(screenPoint, map.getInfoWindowAnchor(screenPoint));
        }
    }
})();
/**print**/
var printMap=(function () {
    return {
        startPrint: function (map,title) {
            var index = parent.layer.msg('正在生成图片，请稍后...', {icon: 16, time: 500000});
            require([
                "esri/tasks/PrintTask",
                "esri/tasks/PrintTemplate",
                "esri/tasks/PrintParameters",
                "esri/config",
            ], function (PrintTask, PrintTemplate, PrintParameters, esriConfig) {
                esriConfig.defaults.io.proxyUrl = "/proxy/";
                var gpUrl = parent.mapLayerConfig.getServiceUrlByName("printService");
                //GP实现打印功能；
                var printTask = new PrintTask(gpUrl);
                var template = new PrintTemplate();
                template.exportOptions = {
                    width: $(window).width(),
                    height: $(window).height(),
                    dpi: 96
                };
                template.format = "PDF";
                template.layout = "A3 Landscape";
                template.layoutOptions = {
                    "titleText": title
                };
                var params = new PrintParameters();
                params.map = map;
                params.template = template;
                printTask.execute(params, function (res) {
                    parent.layer.close(index);
                    //parent.myLayer.showPhoto("导出图片",res.url);
                    window.open(res.url);
                }, function (error) {
                    parent.layer.close(index);
                    alert(error);
                });
            });
        }
    }
})();
/**buildingTable**/
var buildingTable=(function () {
    "use strict";
    var iServiceUrl = null,
        ajaxServiceUrl = null,
        module=null,
        mapClickEvent;
    var queryBuildingFromMap = function (map) {
        if (iServiceUrl === null) {
            iServiceUrl = mapLayerConfig.getServiceUrlByName('queryBuildingServiceKey');
        }
        if (!iServiceUrl) {
            $('#queryBuilding').toggleClass('active');
            parent.layer.msg("请先配置queryBuilding模块", {icon: 2, time: 2000});
            return false;
        }
        //地图绑定I查询
        mapClickEvent = map.on("click", function (e) {
            window.mapClear();
            ajaxServiceUrl = iServiceUrl + '&X=' + e.mapPoint.x + '&Y=' + e.mapPoint.y;
            //TODO 执行查询
            parent.geoneAjax.handleAjax({
                url: ajaxServiceUrl, data: {}, callback: function (res) {
                    //绘制图形
                    if (res.data.buildings.length === 0) {
                        parent.layer.msg("未查询到信息！", {icon: 1, time: 2000});
                        return false;
                    }
                    mapLayerConfig.setDataObject(res);
                    window.drawGeometryByShape(res.data.shape, false);
                    parent.myLayer.showPopup({
                        title: "楼盘表",
                        area: ['800px', '600px'],
                        webUrl: "businessModule/buildingTable/buildingTable.html"
                    });
                }
            });
        });
    };

    return{
        startQuery: function (map) {
            queryBuildingFromMap(map);
        },
        offQuery: function () {
            mapClickEvent.remove();
        }
    }
})();
/**drawEditTools**/
var drawEditTools=(function () {
    var measureToolbar = null;
    return {
        startDraw: function (map, gType, callback) {
            require(["esri/toolbars/draw", "esri/graphic"],
                function (Draw, Graphic) {
                    if (measureToolbar != null)measureToolbar.deactivate();
                    measureToolbar = new Draw(map, {
                        tooltipOffset: 20,
                        drawTime: 90
                    });
                    measureToolbar.deactivate();
                    switch (gType) {
                        case 'rect':
                            measureToolbar.activate(Draw.RECTANGLE);
                            break;
                        case 'point':
                            measureToolbar.activate(Draw.POINT);
                            break;
                        case 'polyline':
                            measureToolbar.activate(Draw.POLYLINE);
                            break;
                        case 'polygon':
                            measureToolbar.activate(Draw.POLYGON);
                            break;
                        case 'circle':
                            measureToolbar.activate(Draw.CIRCLE);
                            break;
                    }
                    measureToolbar.on("draw-end", function (evt) {
                        //取消事件
                        measureToolbar.deactivate();
                        var geometry = evt.geometry;
                        mapSymbol.getSymbolByName({
                            name: "default",
                            geometry: geometry,
                            callback: function (symbol) {
                                var graphic = new Graphic(geometry, symbol);
                                map.graphics.add(graphic);
                            }
                        });
                        if (!callback === false)
                            callback(geometry);
                        else
                            mapLayerConfig.setDrawShape(geometry);
                    });
                });
        },
        startDrawText: function (map,text,fontColor) {
            require(["esri/toolbars/draw",
                    "esri/graphic",
                    "esri/symbols/TextSymbol",
                    "esri/Color",
                    "esri/symbols/Font"],
                function (Draw, Graphic, TextSymbol, Color,Font) {
                    if (measureToolbar != null)measureToolbar.deactivate();
                    measureToolbar = new Draw(map, {
                        tooltipOffset: 20,
                        drawTime: 90
                    });
                    measureToolbar.deactivate();
                    measureToolbar.activate(Draw.POINT);
                    measureToolbar.on("draw-end", function (evt) {
                        //取消事件
                        measureToolbar.deactivate();
                        var geometry = evt.geometry;
                        var symbol = new TextSymbol(text).setColor(new Color(fontColor)).setFont(new Font("14pt"));
                        var graphic = new Graphic(geometry, symbol);
                        map.graphics.add(graphic);
                    });
                });
        },
        startDrawBuffer: function (map, gType, distance, callback) {
            require(["esri/toolbars/draw",
                    "esri/geometry/geometryEngine",
                    "esri/tasks/GeometryService",
                    "esri/graphic"],
                function (Draw, GeometryEngine, GeometryService, Graphic) {
                    if (measureToolbar != null)measureToolbar.deactivate();
                    measureToolbar = new Draw(map, {
                        tooltipOffset: 20,
                        drawTime: 90
                    });
                    measureToolbar.deactivate();
                    switch (gType) {
                        case 'rect':
                            measureToolbar.activate(Draw.RECTANGLE);
                            break;
                        case 'polygon':
                            measureToolbar.activate(Draw.POLYGON);
                            break;
                        case 'circle':
                            measureToolbar.activate(Draw.CIRCLE);
                        case 'polyline':
                            measureToolbar.activate(Draw.POLYLINE);
                            break;
                        case 'point':
                            measureToolbar.activate(Draw.POINT);
                    }
                    measureToolbar.on("draw-end", function (evt) {
                        //取消事件
                        measureToolbar.deactivate();
                        var geometry = GeometryEngine.buffer(evt.geometry, distance, GeometryService.UNIT_METER);
                        mapSymbol.getSymbolByName({
                            name: "default",
                            geometry: geometry,
                            callback: function (symbol) {
                                var graphic = new Graphic(geometry, symbol);
                                map.graphics.add(graphic);
                            }
                        });
                        if (!callback === false)
                            callback(geometry);
                        else
                            mapLayerConfig.setDrawShape(geometry);
                    });
                });
        },
        startDrawBufferByWKT: function (map, distance, wkt, isExtent, callback) {
            require(["esri/geometry/geometryEngine",
                    "esri/tasks/GeometryService",
                    "esri/graphic"],
                function (GeometryEngine, GeometryService, Graphic) {
                    geometriesFromWkt.backGeometryByShape({
                        shape: wkt, callback: function (geo) {
                            var geometry = GeometryEngine.buffer(geo, distance, GeometryService.UNIT_METER);
                            mapSymbol.getSymbolByName({
                                name: "default",
                                geometry: geometry,
                                callback: function (symbol) {
                                    var graphic = new Graphic(geometry, symbol);
                                    map.graphics.add(graphic);
                                    if (isExtent === true) {
                                        var maxExtent = parent.mapLayerConfig.getMultiMaxGeometryExtent([geometry]);
                                        var extent = new esri.geometry.Extent(maxExtent.xMin, maxExtent.yMin, maxExtent.xMax, maxExtent.yMax, map.spatialReference).expand(2);
                                        map.setExtent(extent);
                                    }
                                }
                            });
                            if (!callback === false)
                                callback(geometry);
                            else
                                mapLayerConfig.setDrawShape(geometry);
                        }
                    });
                });
        }
    }
})();
/***mapSymbol***/
var mapSymbol=(function () {
    "use strict";
    /**
     * 根据Name获取symbol
     */
    var symbolByName = function (options) {
        var geometry = options.geometry;
        switch (options.name) {
            case "highlight":
                switch (geometry.type.toLowerCase()) {
                    case 'point':
                        require(['esri/symbols/SimpleLineSymbol',
                                'esri/symbols/SimpleMarkerSymbol',
                                "esri/Color",
                                'dojo/domReady!'],
                            function (SimpleLineSymbol, SimpleMarkerSymbol, Color) {
                                var pointSymbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 15, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                                    new Color([94, 105, 172]), 1),
                                    new Color([94, 105, 172, 0.5]));
                                options.callback(pointSymbol);
                            });
                        break;
                    case 'polyline':
                        require(['esri/symbols/SimpleLineSymbol',
                                'dojo/domReady!'],
                            function (SimpleLineSymbol) {
                                var polyLineSymbol = new SimpleLineSymbol({
                                    color: [94, 105, 172],
                                    width: 4
                                });
                                options.callback(polyLineSymbol);
                            });
                        break;
                    case'polygon':
                        require(['esri/symbols/SimpleLineSymbol',
                            'esri/symbols/SimpleFillSymbol',
                            "esri/Color",
                            'dojo/domReady!'], function (SimpleLineSymbol, SimpleFillSymbol, Color) {
                            var symbolLineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([94, 105, 172]), 1);
                            var polygonSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, symbolLineSymbol, new Color([94, 105, 172, 0.5]));
                            options.callback(polygonSymbol);
                        });
                        break;
                    default:
                        return null;
                }
                break;
            case "radom":
                switch (geometry.type.toLowerCase()) {
                    case 'point':
                        require(['esri/symbols/SimpleLineSymbol',
                                'esri/symbols/SimpleMarkerSymbol',
                                "esri/Color",
                                'dojo/domReady!'],
                            function (SimpleLineSymbol, SimpleMarkerSymbol, Color) {
                                var pointSymbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 15, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                                    new Color(getRadom()[0]), 1),
                                    new Color(getRadom()[1]));
                                options.callback(pointSymbol);
                            });
                        break;
                    case 'polyline':
                        require(['esri/symbols/SimpleLineSymbol',
                                'dojo/domReady!'],
                            function (SimpleLineSymbol) {
                                var polyLineSymbol = new SimpleLineSymbol({
                                    color: getRadom(),
                                    width: 4
                                });
                                options.callback(polyLineSymbol);
                            });
                        break;
                    case'polygon':
                        require(['esri/symbols/SimpleLineSymbol',
                            'esri/symbols/SimpleFillSymbol',
                            "esri/Color",
                            'dojo/domReady!'], function (SimpleLineSymbol, SimpleFillSymbol, Color) {
                            var symbolLineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_NULL, new Color(getRadom()[0]), 1);
                            var polygonSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, symbolLineSymbol, new Color(getRadom()[1]));
                            options.callback(polygonSymbol);
                        });
                        break;
                    default:
                        return null;
                }
                break;
            default:
                switch (geometry.type.toLowerCase()) {
                    case 'point':
                        require(['esri/symbols/SimpleLineSymbol',
                                'esri/symbols/SimpleMarkerSymbol',
                                "esri/Color",
                                'dojo/domReady!'],
                            function (SimpleLineSymbol, SimpleMarkerSymbol, Color) {
                                var pointSymbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 15, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                                    new Color([255, 0, 0]), 1),
                                    new Color([255, 0, 0, 1]));
                                options.callback(pointSymbol);
                            });
                        break;
                    case 'polyline':
                        require(['esri/symbols/SimpleLineSymbol',
                                'dojo/domReady!'],
                            function (SimpleLineSymbol) {
                                var polyLineSymbol = new SimpleLineSymbol({
                                    color: [226, 119, 40],
                                    width: 2
                                });
                                options.callback(polyLineSymbol);
                            });
                        break;
                    case'polygon':
                        require(['esri/symbols/SimpleLineSymbol',
                            'esri/symbols/SimpleFillSymbol',
                            "esri/Color",
                            'dojo/domReady!'], function (SimpleLineSymbol, SimpleFillSymbol, Color) {
                            var symbolLineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([212, 69, 18]), 1);
                            var polygonSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, symbolLineSymbol, new Color([240, 220, 133, 0.5]));
                            options.callback(polygonSymbol);
                        });
                        break;
                    default:
                        return null;
                }
                break;
        }
    };
    //小气泡
    var pictureMark = function (options) {
        require(['esri/symbols/PictureMarkerSymbol', 'dojo/domReady!'],
            function (PictureMarkerSymbol) {
                var symbol = new PictureMarkerSymbol({
                    url: 'resource/img/poi/icon_dibiao_' + options.index + '.png',
                    width: 22.5,
                    height: 22.5,
                    xoffset: 0,
                    yoffset: 10,
                    type: "esriPMS",
                    angle: 0
                });
                options.callback(symbol);
            });
    };

    //获取随机RGB
    var getRadom = function () {
        var numR = Math.ceil(Math.random() * 255);
        var numG = Math.ceil(Math.random() * 255);
        var numB = Math.ceil(Math.random() * 255);
        return [[numR, numG, numB], [numR, numG, numB, 0.5]];
    };

    return {
        getSymbolByName: function (options) {
            symbolByName(options);
        },
        getPictureMark: function (options) {
            pictureMark(options);
        }
    }
})();
/***mapDrawGraphics***/
var mapDrawGraphics=(function () {
    "use strict";
    var showPolygon = function (map, resultJson, isPopup, isExtent,r) {
        require(["esri/graphic", 'esri/geometry/Point', 'dojo/domReady!'],
            function (Graphic, Point) {
                geometriesFromWkt.backGeometries({
                    data: resultJson, callback: function (geometries) {
                        for (var i = 0, len = geometries.length; i < len; i++) {
                            if (geometries[i].type != "point") {
                                var symbolName = 'default';
                                if (!r === false)
                                    symbolName = 'radom';
                                mapSymbol.getSymbolByName({
                                    name: symbolName,
                                    geometry: geometries[i],
                                    callback: function (symbol) {
                                        var graphic = new Graphic(geometries[i], symbol, {
                                            id: resultJson[i].id,
                                            isClick: false
                                        });
                                        map.graphics.add(graphic);
                                        if (i === (len - 1)) {
                                            if (isExtent === true) {
                                                var maxExtent = mapLayerConfig.getMultiMaxGeometryExtent(geometries);
                                                var extent = new esri.geometry.Extent(maxExtent.xMin, maxExtent.yMin, maxExtent.xMax, maxExtent.yMax, map.spatialReference).expand(2);
                                                map.setExtent(extent);
                                            }

                                            if (isPopup === true) {
                                                var point = mapLayerConfig.getGeometryCenter(geometries[0]);
                                                var mapPoint = new Point([point[0], point[1]], map.spatialReference);
                                                infoPopup.showPopup(map, mapPoint, resultJson[0]);
                                                map.centerAt(mapPoint);
                                            }
                                        }
                                    }
                                });
                            }
                        }
                    }
                });
            });
    };

    var showPolygonByShape = function (map,shape,isPan) {
        require(["esri/graphic", 'esri/geometry/Point', 'dojo/domReady!'],
            function (Graphic, Point) {
                geometriesFromWkt.backGeometryByShape({
                    shape: shape, callback: function (geometry) {
                        mapSymbol.getSymbolByName({
                            name: "default",
                            geometry: geometry,
                            callback: function (symbol) {
                                var graphic = new Graphic(geometry, symbol);
                                map.graphics.add(graphic);
                                if (isPan === true) {
                                    var point = mapLayerConfig.getGeometryCenter(geometry);
                                    var mapPoint = new Point([point[0], point[1]], map.spatialReference);
                                    map.centerAt(mapPoint);
                                }
                            }
                        });
                    }
                });
            });
    };

    var showMark = function (map, resultJson, isPopup, isExtent) {
        require([
                "esri/graphic",
                'esri/geometry/Point',
                'dojo/domReady!'],
            function (Graphic, Point) {
                geometriesFromWkt.backGeometries({
                    data: resultJson, callback: function (geometries) {
                        for (var i = 0, len = geometries.length; i < len; i++)
                            mapSymbol.getPictureMark({
                                index: i + 1,
                                geometry: geometries[i],
                                callback: function (symbol) {
                                    var point = mapLayerConfig.getGeometryCenter(geometries[i]);
                                    var mapPoint = new Point([point[0], point[1]], map.spatialReference);
                                    resultJson[i]['mapPoint'] = mapPoint;
                                    var graphic = new Graphic(mapPoint, symbol, resultJson[i]);
                                    map.graphics.add(graphic);
                                    if (i === (len - 1)) {
                                        if (isExtent === true) {
                                            var maxExtent = mapLayerConfig.getMultiMaxGeometryExtent(geometries);
                                            var extent = new esri.geometry.Extent(maxExtent.xMin, maxExtent.yMin, maxExtent.xMax, maxExtent.yMax, map.spatialReference).expand(2);
                                            map.setExtent(extent);
                                        }

                                        if (isPopup === true) {
                                            point = mapLayerConfig.getGeometryCenter(geometries[0]);
                                            mapPoint = new Point([point[0], point[1]], map.spatialReference);
                                            infoPopup.showPopup(map, mapPoint, resultJson[0]);
                                            map.centerAt(mapPoint);
                                        }
                                    }
                                }
                            });
                    }
                });
            });
        //绑定Mark事件
        map.graphics.on('click', function (evt) {
            var attributes = evt.graphic.attributes;
            if (typeof(attributes) === 'undefined' || attributes.isClick === false)
                return false;
            //绘制信息弹出框
            infoPopup.showPopup(map, attributes.mapPoint, attributes);
        });
    };

    var showPoint = function (map, resultJson) {
        require([
                "esri/graphic",
                'esri/geometry/Point',
                'dojo/domReady!'],
            function (Graphic, Point) {
                geometriesFromWkt.backGeometries({
                    data: resultJson, callback: function (geometries) {
                        for (var i = 0, len = geometries.length; i < len; i++)
                            mapSymbol.getSymbolByName({
                                name:"default",
                                geometry: geometries[i],
                                callback: function (symbol) {
                                    var point = mapLayerConfig.getGeometryCenter(geometries[i]);
                                    var mapPoint = new Point([point[0], point[1]], map.spatialReference);
                                    var graphic = new Graphic(mapPoint, symbol);
                                    map.graphics.add(graphic);
                                }
                            });
                    }
                });
            });
        //绑定Mark事件
        map.graphics.on('click', function (evt) {
            var attributes = evt.graphic.attributes;
            if (typeof(attributes) === 'undefined')
                return false;
            //绘制信息弹出框
            infoPopup.showPopup(map, attributes.mapPoint, attributes);
        });
    };

    return {
        drawGeometryListToMap: function (map, res, isPopup, isExtent,r) {
            showPolygon(map, res, isPopup, isExtent,r);
        },
        drawMarkListToMap: function (map, res, isPopup, isExtent) {
            showMark(map, res, isPopup, isExtent);
        },
        drawPointToMap: function (map, res) {
            showPoint(map, res);
        },
        drawGeometryByShape: function (map, shape,isPan) {
            showPolygonByShape(map, shape, isPan)
        }
    }
})();
/***根据List返回Geometry***/
var geometriesFromWkt=(function () {
    return {
        backGeometries: function (options) {
            var geometries = [];
            for (var i = 0, len = options.data.length; i < len; i++) {
                if (!options.data[i].shape === false)
                    wktToGeometry.startParse({
                        wkt: options.data[i].shape,
                        spatialReference: mapLayerConfig.getSpatialReference(),
                        callback: function (geometry) {
                            geometries.push(geometry);
                        }
                    });
                if (i === (len - 1))
                    options.callback(geometries);
            }
        },
        backGeometryByShape: function (options) {
            wktToGeometry.startParse({
                wkt: options.shape,
                spatialReference: mapLayerConfig.getSpatialReference(),
                callback: function (geometry) {
                    options.callback(geometry);
                }
            });
        }
    }
})();
/**IIS Lyaer**/
var initIISLayer = (function () {
    return {
        Init: function () {
            dojo.declare("my.PortlandTiledMapServiceLayer", esri.layers.TiledMapServiceLayer, {
                constructor: function (url, options, json) {
                    this.spatialReference = new esri.SpatialReference(json.spatialReference.wkt);
                    var xmin = json.fullExtent.xmin;
                    var ymin = json.fullExtent.ymin;
                    var xmax = json.fullExtent.xmax;
                    var ymax = json.fullExtent.ymax;
                    this.initialExtent = (this.fullExtent = new esri.geometry.Extent(xmin, ymin, xmax, ymax, this.spatialReference));
                    this.tileInfo = new esri.layers.TileInfo(json.tileInfo);

                    this.url = url;
                    this.opacity = parseFloat(options.opacity);
                    this.id = options.layerId;
                    this.loaded = true;
                    this.onLoad(this);
                },
                getTileUrl: function (level, row, col) {
                    return this.url + "/_alllayers/" +
                        "L" + dojo.string.pad(level, 2, '0') + "/" +
                        "R" + dojo.string.pad(row.toString(16), 8, '0') + "/" +
                        "C" + dojo.string.pad(col.toString(16), 8, '0') + "." +
                        "jpg";
                }
            });
        }
    };
})();
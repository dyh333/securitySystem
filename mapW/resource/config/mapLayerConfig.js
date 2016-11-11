/**
 * Created by sl on 2016/2/2.
 */
var mapLayerConfig=(function () {
    var layerIds = [], tokens = [];//存储当前已经打开的图层列表,tokens存储当前已经获取到的token值
    var userInfo = {}, modules = [], services = [], tokensService = [], baseMap = [], userInitMap = [], defaultMapExtent, spatialReference;
    //定义过度函数
    var queryModuleList = [], chartModulesList = [], drawShape, dataObject
    ,hostIP="192.168.42.75";
    //    , hostIP = location.host;
    //处理图层树结构
    var handleLayerTree = function (nodes) {
        var array = [];
        if (nodes) {
            $(nodes).each(function (index, childNode) {
                childNode.selectable = false;
                childNode.filter = childNode.filter;
                if (childNode.name) {
                    if (childNode.imgSrc) {
                        childNode.ID = childNode.id;
                        //替换固定IP
                        childNode.serviceUrl = childNode.serviceUrl.replace("@IP", hostIP);
                        if (childNode.legend)
                            childNode.text = "<img class='layer-Icon layerI' src='resource/img/bg.png' />" + " <p  data-id='" + childNode.id + "'>" + childNode.name + "</p><div class='layerTools'><img class='layer-Icon legend' src='resource/img/bg.png' title='图例' onclick='window.showLegend('" + childNode.legend + "')'></div>";
                        else
                            childNode.text = "<img class='layer-Icon layerI' src='resource/img/bg.png' />" + " <p  data-id='" + childNode.id + "'>" + childNode.name + "</p><div class='layerTools'></div>";
                    } else {
                        childNode.ID = childNode.id;
                        if (childNode.children) {
                            childNode.nodes = childNode.children;
                            childNode.text = "<img class='layer-Icon groupNode' src='resource/img/bg.png' />" + " <p  data-id='" + childNode.id + "'>" + childNode.name + "</p> ";
                        } else {
                            childNode.nodes = childNode.children;
                            childNode.serviceUrl = childNode.serviceUrl.replace("@IP", hostIP);
                            //TODO 是否配置I查詢
                            if (childNode.legend)
                                childNode.text = "<img class='layer-Icon childNode' src='resource/img/bg.png'/>" + " <p  data-id='" + childNode.id + "'>" + childNode.name + "</p><div class='layerTools'><img class='layer-Icon legend' src='resource/img/bg.png'  title='图例' onclick=window.showLegend('" + childNode.legend + "')></div>";
                            else
                                childNode.text = "<img class='layer-Icon childNode' src='resource/img/bg.png'/>" + " <p  data-id='" + childNode.id + "'>" + childNode.name + "</p><div class='layerTools'></div>";
                        }
                    }
                }
                if (childNode.children) {
                    handleLayerTree(childNode.children)
                    array.push(childNode);
                } else {
                    childNode.showCheckbox = true;
                    array.push(childNode);
                }
            })
        }
        return array;
    };
    //Point取坐标点
    var pointExtent = function (geometry) {
        var extent0 = null;
        if (geometry.type === "point")
            extent0 = {
                xmax: parseFloat(geometry.x),
                ymax: parseFloat(geometry.y),
                xmin: parseFloat(geometry.x),
                ymin: parseFloat(geometry.y)
            };
        else
            extent0 = geometry.getExtent();
        return extent0;
    };
    return {
        setUserInfo: function (_userInfo) {
            userInfo = _userInfo;
        },
        getIP: function () {
            return hostIP;
        },
        setModules: function (_modules) {
            modules = _modules;
        },
        getModules: function () {
            return modules;
        },
        getModulesByName: function (name) {
            var module = null;
            $(modules).each(function (index, item) {
                if (item.name.toLocaleLowerCase() === name.toLocaleLowerCase()) {
                    module = item;
                    return false;
                }
            });
            return module;
        },
        setService: function (_services) {
            services = _services;
        },
        getServiceUrlByName: function (name) {
            var serviceUrl;
            $(services).each(function (index, item) {
                if (item.name.toLowerCase() === name.toLowerCase()) {
                    serviceUrl = item.serviceUrl;
                    return false;
                }
            });
            return serviceUrl;
        },
        setBaseMap: function (_baseMap) {
            baseMap = JSON.parse(JSON.stringify(_baseMap).replace(new RegExp("@IP", "gm"), hostIP));
        },
        getBaseMap: function () {
            return baseMap;
        },
        getBaseMapByName: function (name) {
            var result = null;
            $(baseMap).each(function (index, item) {
                if (item.name.toLowerCase() === name.toLowerCase()) {
                    result = item;
                    return false;
                }
            });
            return result;
        },
        setUserInitMap: function (_userInitMap) {
            userInitMap = _userInitMap;
        },
        getUserInitMap: function () {
            return userInitMap;
        },
        setSpatialReference: function (_spatialReference) {
            spatialReference = _spatialReference;
        },
        getSpatialReference: function () {
            return spatialReference;
        },
        setExtent: function (_defaultExtent) {
            defaultMapExtent = _defaultExtent;
        },
        getExtent: function () {
            return defaultMapExtent;
        },
        setTokenService: function (_tokensService) {
            tokensService = _tokensService;
        },
        getTokenById: function (id, callback) {
            var isToken = false;
            $(tokens).each(function (index, item) {
                if (id.toLowerCase() === item.id.toLowerCase()) {
                    callback(item.value);
                    isToken = true;
                    return false;
                }
            });
            //执行查询TOKEN服务
            if (isToken === false) {
                $(tokensService).each(function (index, item) {
                    if (id.toLowerCase() === item.id.toLowerCase()) {
                        if (item.tokenUrl.indexOf('http://') > -1) {
                            parent.geoneAjax.handleTokenAjax({
                                url: item.tokenUrl, callback: function (data) {
                                    tokens.push({id: id, value: data});
                                    callback(data);
                                    return false;
                                }
                            });
                        }
                        else {
                            tokens.push({id: id, value: item.tokenUrl});
                            callback(item.tokenUrl);
                            return false;
                        }
                    }
                });
            }
        },
        addLayerId: function (layerId) {
            layerIds.push(layerId);
        },
        removeLayerId: function (layerId) {
            layerIds.splice($.inArray(layerId, layerIds), 1);
        },
        getLayerIds: function () {
            return layerIds;
        },
        clearLayerId: function () {
            layerIds = [];
        },
        getGeometryCenter: function (_geometry) {
            if (_geometry.type != "point") {
                var extent = _geometry.getExtent();
                var xMin = extent.xmin;
                var yMin = extent.ymin;
                var xMax = extent.xmax;
                var yMax = extent.ymax;
                var x = (xMin + xMax) / 2;
                var y = (yMin + yMax) / 2;
                return [x, y];
            }
            else {
                return [_geometry.x, _geometry.y];
            }
        },
        getConfigLayerTree: function (nodes) {
            return handleLayerTree(nodes);
        },
        setQueryModulesList: function (_queryModulesList) {
            queryModuleList = queryModuleList.concat(_queryModulesList);
        },
        getQueryModuleByName: function (name) {
            var module = null;
            $(queryModuleList).each(function (index, item) {
                if (item.name === name) {
                    module = item;
                    return false;
                }
            });
            return module;
        },
        getMultiMaxGeometryExtent: function (_geometries) {
            var extent0 = pointExtent(_geometries[0]);
            var xMax = extent0.xmax, yMax = extent0.ymax, xMin = extent0.xmin, yMin = extent0.ymin;
            _geometries.forEach(function (geometry) {
                var extent = pointExtent(geometry);
                if (xMax < extent.xmax) {
                    xMax = extent.xmax;
                }

                if (yMax < extent.ymax) {
                    yMax = extent.ymax;
                }

                if (xMin > extent.xmin) {
                    xMin = extent.xmin
                }

                if (yMin > extent.ymin) {
                    yMin = extent.ymin;
                }
            });
            return {xMax: xMax, yMax: yMax, xMin: xMin, yMin: yMin};
        },
        setDrawShape: function (_geometry) {
            drawShape = _geometry;
        },
        getDrawShape: function () {
            if (!drawShape)return "";
            else {
                var polyType = drawShape.type.toUpperCase();
                return polyType + "((" +
                    drawShape.rings[0].join(' ').replace(/\s+/g, '&').replace(/,/g, " ").replace(/&/g, ",") + "))";
            }
        },
        setDataObject: function (_dataObject) {
            dataObject = _dataObject;
        },
        getDataObject: function () {
            return dataObject;
        }
    };
})();
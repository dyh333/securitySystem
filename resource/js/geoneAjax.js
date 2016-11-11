/**
 * Created by zhengsl on 2016/8/17.
 */
var geoneAjax=(function () {
    var hostIP = "192.168.42.75";
    //var hostIP = location.host;
    return {
        handleTemplate: function (options) {
            $.ajax({
                type: "GET",
                url: "resource/template/" + options.tName,
                dataType: "html",
                success: function (template) {
                    options.callback(template);
                }
            });
        },
        handleMapTemplate: function (options) {
            $.ajax({
                type: "GET",
                url: "mapW/resource/template/" + options.tName,
                dataType: "html",
                success: function (template) {
                    options.callback(template);
                }
            });
        },
        handleAjax: function (options) {
            if (options.url.indexOf('@IP') > -1)
                options.url = options.url.replace('@IP', hostIP);
            $.getJSON(encodeURI(options.url), options.data, function (res) {
                if (parseInt(res.status) === 1)
                    options.callback(res);
                else
                    layer.msg("未查询到相关结果！", {icon: 0, time: 2000});
            });
        },
        handleAjaxWithNoBack: function (options) {
            if (options.url.indexOf('@IP') > -1)
                options.url = options.url.replace('@IP', hostIP);
            $.getJSON(encodeURI(options.url), options.data, function (res) {
                if (parseInt(res.status) === 1)
                    options.callback(res);
                else {
                    layer.msg("未查询到相关结果！", {icon: 0, time: 2000});
                    options.callback(res);
                }
            });
        },
        handlePostAjax: function (options) {
            if (options.url.indexOf('@IP') > -1)
                options.url = options.url.replace('@IP', hostIP);
            var index = layer.msg('正在查询，请稍后...', {icon: 16, time: 500000});
            $.post(encodeURI(options.url), options.data, function (res) {
                layer.close(index);
                if (parseInt(res.status) === 1)
                    options.callback(res);
                else {
                    parent.layer.msg(res.message, {icon: 1, time: 2000});
                }
            });
        },
        handleIAjax: function (options) {
            if (options.url.indexOf('@IP') > -1)
                options.url = options.url.replace('@IP', hostIP);
            $.getJSON(encodeURI(options.url), options.data, function (res) {
                if (parseInt(res.status) === 0)
                    options.callback(res);
            });
        },
        handleTokenAjax: function (options) {
            if (options.url.indexOf('@IP') > -1)
                options.url = options.url.replace('@IP', hostIP);
            $.ajax({
                type: 'GET',
                url: encodeURI(options.url),
                success: function (token) {
                    options.callback(token);
                }
            });
        },
        handleIISAjax: function (options) {
            if (options.url.indexOf('@IP') > -1)
                options.url = options.url.replace('@IP', hostIP);
            $.getJSON(encodeURI(options.url), options.data, function (res) {
                options.callback(res);
            });
        }
    }
})();

var myLayer=(function () {
    "use strict";
    var layerFrameIndex = null, layerPopupIndex = null, layerModalIndex = null;

    var showLeftLayer = function (options) {
        if (layerFrameIndex === null) {
            layerFrameIndex = layer.open({
                type: 2,
                move: false,
                title: options.title,
                offset: ['0', '50px'],
                shadeClose: false,
                shade: 0,
                shift: -1,
                zIndex: 100,
                area: ['320px', $(window).height() + 'px'],
                content: options.webUrl,
                end: function () {
                    layerFrameIndex = null;
                    window.mapClear();
                    $("body").removeClass("left-side-panel-expand left-side-expand-And-left-side-panel-expand");
                }
            });
            $("#layui-layer" + layerFrameIndex).addClass("leftWin");
        }
        else {
            layer.title(options.title, layerFrameIndex);
            layer.iframeSrc(layerFrameIndex, options.webUrl);
        }
    };

    var showPopup = function (options) {
        if (layerPopupIndex === null) {
            layerPopupIndex = layer.open({
                type: 2,
                title: options.title,
                shadeClose: false,
                shade: 0,
                maxmin: false,
                offset: !options.offset === false ? options.offset : 'auto',
                moveType: 0, //拖拽风格，0是默认，1是传统拖动
                area: options.area,
                content: options.webUrl,
                end: function () {
                    layerPopupIndex = null;
                }
            });
            $("#layui-layer" + layerPopupIndex).addClass("randomWin");
        }
        else {
            layer.title(options.title, layerPopupIndex);
            layer.iframeSrc(layerPopupIndex, options.webUrl);
        }
    };

    return {
        showLeftLayer: function (options) {
            showLeftLayer(options);
            if ($("body").hasClass("left-side-expand"))
                $("body").addClass("left-side-panel-expand").addClass("left-side-expand-And-left-side-panel-expand");
            else
                $("body").removeClass("left-side-expand-And-left-side-panel-expand").addClass("left-side-panel-expand");
        },
        showPopup: function (options) {
            showPopup(options);
        },
        showPhoto: function (title, imgUrl) {
            layer.photos({
                photos: {
                    "title": "", //相册标题
                    "id": 123, //相册id
                    "start": 0, //初始显示的图片序号，默认0
                    "data": [   //相册包含的图片，数组格式
                        {
                            "alt": title,
                            "pid": 666, //图片id
                            "src": imgUrl, //原图地址
                            "thumb": "" //缩略图地址
                        }
                    ]
                } //格式见API文档手册页
            });
        },
        showModalWindow: function (title, width, height, webUrl, offset, style) {
            if (layerModalIndex != null) {
                layer.close(layerModalIndex);
                layerModalIndex = null;
                window.mapClear();
            }
            layerModalIndex = layer.open({
                type: 2,
                title: title,
                shadeClose: false,
                shade: 0,
                maxmin: false,
                offset: !offset === false ? offset : ['120px', '140px'],
                moveType: 0, //拖拽风格，0是默认，1是传统拖动
                area: [width + 'px', height + 'px'],
                content: webUrl,
                end: function () {
                    layerModalIndex = null;
                    mapLayerConfig.setDrawShape(null);
                }
            });
            $("#layui-layer" + layerModalIndex).addClass("randomWin");
            setTimeout(function () {
                if (!style === false) {
                    layer.style(layerModalIndex, {
                        top: $(window).height() - $("#layui-layer" + layerModalIndex).height() - 14 + 'px'
                    });
                }
            }, 150)
        },
        showSecondWindow: function (title, width, webUrl) {
            var layerRIndex = layer.open({
                type: 2,
                move: false,
                title: title,
                offset: ['0', '50px'],
                shadeClose: false,
                shade: 0,
                zIndex: 100,
                area: [width + 'px', $(window).height() + 'px'],
                content: webUrl
            });
            $("#layui-layer" + layerRIndex).addClass("leftWin");
        }
    }
})();

/**全屏显示**/
window.fullScreenOpen= function (frameId) {
    var docElm = document.getElementById(frameId);
    if (docElm.requestFullscreen) {
        //W3C
        docElm.requestFullscreen();
    }
    else if (docElm.mozRequestFullScreen) {
        //FireFox
        docElm.mozRequestFullScreen();
    }
    else if (docElm.webkitRequestFullScreen) {
        //Chrome等
        docElm.webkitRequestFullScreen();
    }
    else if (elem.msRequestFullscreen) {
        //IE11
        elem.msRequestFullscreen();
    }
    else {
        alert("当前浏览器不支持,建议下载最新浏览器");
    }
};
window.fullScreenClose= function () {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    }
    else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    }
    else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    }
    else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
    }
};
/**图层对比**/
window.showSecondMap= function (options) {
    parent.geoneAjax.handleTemplate({
        tName: "secondFrameContainer.txt?v=1.0.0", callback: function (template) {
            laytpl(template).render(options, function (html) {
                var secondFrameContainer = document.createElement("div");
                secondFrameContainer.id = "secondFrame";
                secondFrameContainer.className = "second-frame";
                secondFrameContainer.innerHTML = html;
                document.body.appendChild(secondFrameContainer);
                $("#secondFrame").on("click", "#closeSecondFrame", function () {
                    $("#secondFrame").remove();
                });
            });
        }
    });
};
/**数据查询且定位**/
window.queryAndPosition= function (serviceKey,queryWhere) {
    var serviceUrl = mapLayerConfig.getServiceUrlByName(serviceKey);
    geoneAjax.handleAjax({
        url: serviceUrl + "&" + queryWhere, data: {}, callback: function (res) {
            window.drawGeometryByShape(res.data[0].shape, true)
        }
    });
};

/***根据绘制WKT的返回值直接计算***/
window.drawWktWithBack= function (moduleName,winWidth,winHeight,webUrl) {
    window.mapClear();
    window.drawGeometryByEditTools("polygon", function (geometry) {
        mapLayerConfig.setDrawShape(geometry);
        myLayer.showPopup({
            title: moduleName, area: [winWidth + 'px', winHeight + 'px'],
            webUrl: webUrl
        });
    });
};

/**三维地图设置Extent**/
parent.window.setExtent= function (mapExtent) {
    window.setExtent(mapExtent);
};
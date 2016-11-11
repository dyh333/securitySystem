/**
 * Created by zhengsl on 2016/5/31.
 */
    /**
     * zhengsl
     * zhengsl@dpark.com
     *通用访问服务
     * **/
var commonAjax=(function () {
        //var hostIP=location.host;
        var hostIP='192.168.42.70';
        var rootUrl = "http://"+hostIP+"/onemapsrv/GetStatsResult?appid=qzcyy&device=ipad&modulename=";
        return {
            doGetHandle: function (options) {
                $.getJSON(options.url.replace('@IP', hostIP), options.data, function (result) {
                    options.callback(result);
                });
            },
            doPostHandle: function (options) {
                $.getJSON(options.url.replace('@IP', hostIP), options.data, function (result) {
                    options.callback(result);
                });
            },
            doGetMenuHandle: function (options) {
                $.getJSON('http://' + hostIP + '/geoneup/api/projecttree/getprojecttree', options.data, function (result) {
                    options.callback(result);
                });
            },
            connectWebViewJavascriptBridge: function (callback) {
                if (window.WebViewJavascriptBridge) {
                    callback(WebViewJavascriptBridge)
                } else {
                    document.addEventListener('WebViewJavascriptBridgeReady', function () {
                        callback(WebViewJavascriptBridge);
                    }, false);
                }
            },
            GetIP: function () {
                return hostIP;
            }
        }
    })();
var loading=(function () {
    return {
        open: function () {
            $('.spinner').css('display', 'block');
        },
        close: function () {
            $('.spinner').css('display', 'none');
        }
    }
})();
var dataContainer=(function () {
    var serviceData = null, menuKey = null;
    return {
        setAjaxDataObject: function (_data) {
            serviceData = _data;
        },
        setMenuKey: function (_key) {
            menuKey = _key
        },
        getDocService: function () {
            return serviceData.data.docService.replace('#key#', menuKey);
        },
        getBuildingService: function () {
            return serviceData.data.buildingService.replace('#key#', menuKey);
        },
        getCertificateService: function () {
            return serviceData.data.certificateService.replace('#key#', menuKey);
        }
    }
})();


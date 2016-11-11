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
        var hostIP = '202.103.250.165:8800';
        var rootUrl = "http://" + hostIP + "/onemapsrv/GetStatsResult?appid=qzcyy&device=ipad&modulename=";
        return {
            doGetHandle: function (options) {
                $.getJSON(rootUrl + options.moduleName, options.data, function (result) {
                    options.callback(result);
                });
            },
            doPostHandle: function (options) {
                $.getJSON(rootUrl + options.url, options.data, function (result) {
                    options.callback(result);
                });
            },
            doGetMenuHandle: function (options) {
                $.getJSON('http://' + hostIP + '/onemapsrv/GetFMobileStatslist?appid=qzcyy&device=ipad', {}, function (result) {
                    options.callback(result);
                });
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


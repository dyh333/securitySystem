/**
 * Created by zhengsl on 2016/9/22.
 */
$(function () {
    engineeringA.init();
});
var engineeringA=(function () {
    var showResult= function () {
        var wkt = parent.mapLayerConfig.getDrawShape(),
            url = parent.mapLayerConfig.getServiceUrlByName("engineeringAnalysis"),
            g = $('input[type="radio"]:checked ').val();
        parent.geoneAjax.handlePostAjax({
            url: url + parseInt(g), data: {wkt: wkt}, callback: function (res) {
                var result = res.data[0];
                for (var item in result) {
                    $("#" + item).val(result[item]);
                }
            }
        });
    };

    var bindEvent= function () {
        $(document).on("click", "#search", function () {
            showResult();
        });
    };

    return {
        init: function () {
            showResult();
            bindEvent();
        }
    }
})();
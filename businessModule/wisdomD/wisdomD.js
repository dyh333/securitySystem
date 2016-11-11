/**
 * Created by zhengsl on 2016/9/23.
 */
$(function () {
    wisdomD.init();
});

var wisdomD=(function () {
    var doHandleSearch = function () {
        if (!parent.mapLayerConfig.getDrawShape() === true) {
            parent.layer.msg("请绘制分析范围！", {icon: 0, time: 2000});
            return false;
        }
        parent.myLayer.showPopup({
            title: "智慧征拆", area: ['800px', '700px'],
            webUrl: "businessModule/wisdomD/wisdomPanel.html"
        });
    };

    var autoComplete= function () {
        var comboxServiceUrl = parent.mapLayerConfig.getServiceUrlByName("queryRoadByName"), suggestData = [], whereSuggestData;
        parent.geoneAjax.handleAjax({
            url: comboxServiceUrl,
            data: {q: ''},
            callback: function (result) {
                suggestData = result.data;
            }
        });

        $('#roadName').autoComplete({
            minChars: 2,
            source: function (term, suggest) {
                whereSuggestData = [];
                $(suggestData).each(function (index, sugItem) {
                    if (sugItem.name.indexOf(term) > -1)
                        whereSuggestData.push(sugItem);
                });
                suggest(whereSuggestData);
            },
            renderItem: function (item, search) {
                return '<div class="autocomplete-suggestion"   data-value=' + item.name + '>' + item.name + '</div>';
            },
            onSelect: function (e, term, item) {
                //判断当前是否存在标签
                $("#roadName").val(item.data('value'));
                $(suggestData).each(function (index, sug) {
                    parent.window.mapClear();
                    if (sug.name === item.data('value')) {
                        parent.window.drawBufferByWKT(parseFloat($("#distance").val()), sug.shape, true);
                        return false;
                    }
                });
            }
        });
    };
    return {
        init: function () {
            $(document).on('click', '#search', function () {
                if (!parent.mapLayerConfig.getDrawShape() === true) {
                    parent.layer.msg("请绘制分析范围！", {icon: 0, time: 2000});
                    return false;
                }
                doHandleSearch();
            });
            $(document).on("click", "img.polygonSelect", function () {
                var distance = parseInt($("#distance").val());
                if (distance >= 0) {
                    parent.window.mapClear();
                    parent.window.drawBufferGeometryByEditTools($(this).data("drawtype"), distance);
                }
                else
                    parent.layer.msg("距离输入有误！", {icon: 0, time: 2000});
            });
            //获取
            autoComplete();
        },
        isInt: function () {
            var keyCode = event.keyCode;
            if ((keyCode >= 48 && keyCode <= 57)) {
                event.returnValue = true;
            } else {
                event.returnValue = false;
            }
        }
    }
})();
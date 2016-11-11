/**
 * Created by zhengsl on 2016/9/29.
 */
var print=(function () {
    return {
        renderPrintTools: function () {
            $(document).on("click", "img.polygonSelect", function () {
                if ($("#fontSet").val() === '') {
                    parent.layer.msg("请输入标志的文字！", {icon: 0, time: 2000});
                    return false;
                }
                parent.window.drawTextSymbol($("#fontSet").val(), $("#fontColor").val());
            });

            $(document).on('click', '#search', function () {
                if ($("#title").val() === '') {
                    parent.layer.msg("请输入标题！", {icon: 0, time: 2000});
                    return false;
                }
                parent.window.printMap($("#title").val());
            });
        }
    }
})();
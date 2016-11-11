/**
 * Created by zhengsl on 2016/7/26.
 */
$(function(){
    myJS.init();
});
var myJS=(function () {

    var projectCode=getQueryString("projectCode");
    function loadData() {
        if (projectCode === null) {
            alert("请输入projectCode");
            return false;
        }
        $.getJSON("http://192.168.42.75/geoneup/api/projecttree/GetProjectProcessBar?r=" + Math.random(), {projectCode: projectCode}, function (res) {
            if (res.status != 1)return false;
            LoadTemplate({
                name: "stepTemplate.txt?v=1.0", callback: function (template) {
                    laytpl(template).render(res.data.registryState, function (html) {
                        document.getElementById('progressContainer').innerHTML = html;
                    });
                }
            });
        });
    }

    function LoadTemplate(options) {
        $.ajax({
            type: "GET",
            url: "template/" + options.name,
            dataType: "html",
            success: function (res) {
                options.callback(res);
            }
        });
    }
    return {
        init: function () {
            loadData();
        }
    }
})();
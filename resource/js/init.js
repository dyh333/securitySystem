
$(function () {
    "use strict";
    mapInit.init();
});

var mapInit=(function () {
    "use strict";
    return {
        init: function () {
            var configStr = sessionStorage.getItem("qz_loginValue");
            if (!configStr) {
                window.location.href = "index.html";
                return false;
            }
            var configJson = $.parseJSON(configStr);
            configStr = null;//变量释放
            $("#userInfo").html(configJson.data.userInfo.userName);
            mapLayerConfig.setModules(configJson.data.modules);
            mapLayerConfig.setService(configJson.data.services);
            createMenu.renderMenu(configJson.data.modules);
            $("#main").attr("src", "mapW/map.html");
        }
    }
})();

var createMenu= (function () {
    var loadService = function (menus) {
        $(menus).each(function (index, item) {
            if (item.serviceUrl != "") {
                geoneAjax.handleAjax({
                    url: item.serviceUrl, data: {}, callback: function (result) {
                        mapLayerConfig.setQueryModulesList(result.data);
                    }
                });
            }
        });
    };
    return {
        renderMenu: function (modules) {
            $(modules).each(function (index, item) {
                if (item.name === "menus") {
                    if (item.serviceUrl === '')return false;
                    geoneAjax.handleAjax({
                        url: item.serviceUrl, data: {}, callback: function (result) {
                            geoneAjax.handleTemplate({
                                tName: "menusView.txt?v=1.0.0", callback: function (menusTemplate) {
                                    laytpl(menusTemplate).render(result.data, function (html) {
                                        var menusContainer = document.createElement("div");
                                        menusContainer.className = "left-side sticky-left-side";
                                        menusContainer.innerHTML = html;
                                        document.body.appendChild(menusContainer);
                                        //事件绑定
                                        bindEvent();
                                    });
                                }
                            });
                            loadService(result.data);
                        }
                    });
                }
            });
        }
    }
})();

var bindEvent= function () {
    $('.custom-nav > li.menu-list').hover(function () {
        if ($("body").hasClass("left-side-expand"))return false;
        $(this).addClass('nav-hover').children("ul").show();
    }, function () {
        if ($("body").hasClass("left-side-expand"))return false;
        $(this).removeClass('nav-hover').children("ul").hide();
    });

    $(document).on("click", "#sideNav>li.menu-list>a", function () {
        $(this).children(".head-Icon").toggleClass("rotate-90");
        $(this).next("ul").slideToggle(200);
    });

    $(document).on("click", "#sideNav>li.menu-toggle>a>img", function () {
        if ($("body").hasClass("left-side-panel-expand"))
            $("body").toggleClass("left-side-expand left-side-expand-And-left-side-panel-expand");
        else
            $("body").toggleClass("left-side-expand");
        $("#sideNav .sub-menu-list").hide();
        $("#sideNav .rotate90").removeClass("rotate90");
    });

    $(document).on("click", "#sideNav  a.haveClick", function () {
        myLayer.showLeftLayer({
            title: $(this).data("name"),
            webUrl: $(this).data("href")
            //webUrl: "businessModule/search/search.html?moduleName=qycx"
        });
    });

    $(".rightTools li.my-dropdown").click(function () {
        $(this).toggleClass("active").children("a").children("img.Icon-caret-down").toggleClass("rotate180");
        $(this).children("ul.dropdown-mymenu").slideToggle(200);
    });
};



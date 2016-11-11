/**
 * Created by sl on 2016/2/25.
 */
var login = (function () {
    "use strict";
    /*图片轮播*/
    var imageView = function () {
        $(".main_visual").hover(function () {
                $("#btn_prev,#btn_next").fadeIn()
            },
            function () {
                $("#btn_prev,#btn_next").fadeOut()
            });

        var $dragBln = false;
        $(".main_image").touchSlider({
            flexible: true,
            speed: 200,
            btn_prev: $("#btn_prev"),
            btn_next: $("#btn_next"),
            paging: $(".flicking_con a"),
            counter: function (e) {
                $(".flicking_con a").removeClass("on").eq(e.current - 1).addClass("on");
            }
        });

        $(".main_image").bind("mousedown",
            function () {
                $dragBln = false;
            });

        $(".main_image").bind("dragstart",
            function () {
                $dragBln = true;
            });

        $(".main_image a").click(function () {
            if ($dragBln) {
                return false;
            }
        });

        var timer = setInterval(function () {
                $("#btn_next").click();
            },
            5000);

        $(".main_visual").hover(function () {
                clearInterval(timer);
            },
            function () {
                timer = setInterval(function () {
                        $("#btn_next").click();
                    },
                    5000);
            });

        $(".main_image").bind("touchstart",
            function () {
                clearInterval(timer);
            }).bind("touchend",
            function () {
                timer = setInterval(function () {
                        $("#btn_next").click();
                    },
                    5000);
            });
    };
    /*初始化用户信息*/
    var loginInit = function () {
        $("#btnLogin").click(function () {
            if ($("#username").val() == "请输入您的用户名" || $("#username").val() == "") {
                $("#erroInfo").text("请输入您的用户名");
                $("#erroInfo").addClass("erroInfo-cur");
                $("#username").focus();
                return false;
            }
            if ($("#password_2").val() == "请输入您的密码" || $("#password_2").val() == "") {
                $("#erroInfo").text("请输入您的密码");
                $("#erroInfo").addClass("erroInfo-cur");
                $("#password_2").focus();
                return false;
            }
            checkLogin();
        });

        $(".txt-user").bind({
            focus: function () {
                if (this.value == this.defaultValue) {
                    this.value = "";
                }
            },
            blur: function () {
                if (this.value == "") {
                    this.value = this.defaultValue;
                }
            }
        });

        $("#password_1").focus(function () {
            $("#password_2").show().focus().val("");
            $(this).hide();
        });

        $("#password_2").blur(function () {
            if (this.value == "") {
                $("#password_1").show();
                $(this).hide();
            }
        });

        $(".checkboxOne label").click(function () {
            $(this).children("i").toggleClass("itwo");
            //$('#checkboxInput')
        });

        $("#password_2").bind('keydown', function (e) {
            var key = e.which;
            if (key === 13) {
                e.preventDefault();
                checkLogin();
            }
        });
    };
    /*检验登入*/
    var checkLogin = function () {
        layer.msg('登入成功，正在跳转...', {icon: 1});

        $.getJSON('./resource/config/loginResult.json', function(result){
            setTimeout(function () {
                if ($('.checkboxOne label').children('i').hasClass('itwo')) {
                    localStorage.setItem('qz_userAccount',base64encode(result.data.userInfo.userAccount));
                    localStorage.setItem('userChecked', true);
                }
                else
                    localStorage.setItem('userChecked', null);
                    sessionStorage.setItem('qz_loginValue', JSON.stringify(result));
                    loadOneMap();
            }, 500);
        });
        

        // var userName = $("#username").val(),
        //     password = $("#password_2").val(),
        //     //url = "http://"+location.host+"/jsDataCenter/m.ashx?x=login";
        //     url = "http://192.168.42.75/jsDataCenter/m.ashx?x=login";
        // layer.msg('正在登入，请稍后...', {icon: 16, time: 50000});
        // $.getJSON(url,
        //     {
        //         "appid": "qzcyy",
        //         "xUserName": userName,
        //         "xPassword": password,
        //         "radom": Math.random()
        //     },
        //     function (result) {
        //         if (result.status === 1 && $.isEmptyObject(result.data) == false) {
        //             layer.msg('登入成功，正在跳转...', {icon: 1});
        //             setTimeout(function () {
        //                 if ($('.checkboxOne label').children('i').hasClass('itwo')) {
        //                     localStorage.setItem('qz_userAccount',base64encode(result.data.userInfo.userAccount));
        //                     localStorage.setItem('userChecked', true);
        //                 }
        //                 else
        //                     localStorage.setItem('userChecked', null);
        //                 sessionStorage.setItem('qz_loginValue', JSON.stringify(result));
        //                 loadOneMap();
        //             }, 500);
        //         } else {
        //             layer.closeAll();
        //             alert("用户名或密码错误");
        //             return false;
        //         }
        //     });
    };
    /**加载oneMap**/
    var loadOneMap = function () {
        window.location.href = "oneMap.html";
    };
    /*初始化添加信息*/
    var initUserInfo = function () {
        var userChecked = localStorage.getItem('userChecked');
        if (userChecked === 'true') {
            $('#username').val(base64decode(localStorage.getItem('qz_userAccount')));
            $('.checkboxOne label').children("i").addClass("itwo");
        }
    };

    return {
        init: function () {
            var loginOut = $.getUrlParam("type");
            if (loginOut === "loginOut") {
                sessionStorage.removeItem("qz_loginValue");
            }
            if (!sessionStorage.getItem("qz_loginValue") === false) {
                loadOneMap();
                return false;
            }
            imageView();
            loginInit();
            initUserInfo();
        }
    }
})();

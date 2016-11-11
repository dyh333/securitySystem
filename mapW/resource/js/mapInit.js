/**
 * Created by zhengsl on 2016/8/17.
 */
$(function () {
    $(document).on("click", "#baseMapBarContainer li.baseBtn", function () {
        if ($(this).hasClass("active"))return false;
        $(this).siblings("li.baseBtn.active").removeClass("active").children("span").removeClass("active");
        $(this).addClass("active").children("span").addClass("active");
    });

    $("#baseMapBarContainer li.dropDown").hover(function () {
            $(this).addClass("active");
            $("#" + $(this).data("role") + "Container").slideDown(200);
        },
        function () {
            $(this).removeClass("active");
            $("#" + $(this).data("role") + "Container").slideUp(200);
        });
});
/**
 * Created by zhengsl on 2016/8/27.
 */
var buildingTable=(function () {
    var renderBuild = function () {
        var building = parent.mapLayerConfig.getDataObject();
        parent.mapLayerConfig.getDataObject(null);
        var buildingHtml = [];
        $(building.data.buildings).each(function (index, item) {
            buildingHtml.push('<div class="floorDiv">');
            if (item.floorNumber === 4) {
                item.floorNumber = "3A";
            }
            buildingHtml.push('<div class="floorContain">');
            buildingHtml.push('<button class="floor">' + item.floorNumber + '层</button>');
            buildingHtml.push('</div>');
            buildingHtml.push('<div class="houseContain">');
            $(item.children).each(function (index, house) {
                if (!house.houseStatus && house.houseStatus === 0)
                    buildingHtml.push('<button class="house" title="人员：' + house.owner + '">' + house.roomNumber + '室</button>');
                else
                    buildingHtml.push('<button class="house houseStatus" title="人员：' + house.owner + '">' + house.roomNumber + '室</button>');
            });
            buildingHtml.push('</div>');
            buildingHtml.push('</div>');
        });
        $("#container").append(buildingHtml.join(''));
    };
    return {
        renderBuildingTable: function () {
            renderBuild();
        }
    }
})();
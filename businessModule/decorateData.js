var decorateData=(function () {

    function alarmData(datas){
        var fields = [
                        {'id': 'AlarmTime', 'text': '报警时间'}, 
                        {'id': 'AutoHandled', 'text': 'AutoHandled'},
                        {'id': 'ManualSend', 'text': 'ManualSend'}, 
                        {'id': 'AlarmKey', 'text': 'AlarmKey'}, 
                        {'id': 'AlmFlag', 'text': 'AlmFlag'}, 
                        {'id': 'ClientID', 'text': 'ClientID'}, 
                        {'id': 'ERFlag', 'text': 'ERFlag'}, 
                        {'id': 'AlarmCode', 'text': '报警类型'}, 
                        {'id': 'AlarmText', 'text': '报警详情'},
                        {'id': 'OrgAlmCode', 'text': '防区编号'}, 
                        {'id': 'ZuFlag', 'text': 'ZuFlag'}, 
                        {'id': 'ZUInfo', 'text': 'ZUInfo'}, 
                        {'id': 'UserAddr', 'text': '地址'}, 
                        {'id': 'Date', 'text': '报警日期'}
                     ];

        var showlistFields = ['AlarmTime', 'AlarmCode', 'AlarmText', 'OrgAlmCode'];             

        var decoratedArray = [];             

        _.forEach(datas, function(data) {
            var decoratedObj = new Object();
            decoratedObj.id = data.ID;
            decoratedObj.name = data.AlarmText; //???
            decoratedObj.shape = [data.Lat, data.Lng];
            decoratedObj.attribute = new Object();
            decoratedObj.showlist = new Object();

            _.forEach(data, function(value, key) {
                var field = _.find(fields, function(o) { return o.id === key; });      
                if(field !== undefined){
                    var text = field.text;

                    // decoratedObj.attribute[text] = value;
                    decoratedObj.attribute[key] = {text: text ,value: value};

                    if(_.indexOf(showlistFields, key) >= 0){
                        decoratedObj.showlist[text] = value;
                    }
                }
            });

            decoratedArray.push(decoratedObj);
        });             
        
        // var decoratedDatas = {'data': decoratedArray}     
        return decoratedArray;
    }

    function enterpriseData(datas){
        var fields = [
                        // {'id': 'Id', 'text': 'Id'}, 
                        {'id': 'Name', 'text': '名称'},
                        {'id': 'Addr', 'text': '地址'}, 
                        {'id': 'Leader', 'text': '法人'}, 
                        {'id': 'LeaderPhone', 'text': '法人电话'}, 
                        {'id': 'SeperateOffice', 'text': 'SeperateOffice'}, 
                        {'id': 'OfficePhone', 'text': 'OfficePhone'}, 
                        {'id': 'PoliceStation', 'text': 'PoliceStation'}, 
                        {'id': 'StationPhone', 'text': 'StationPhone'}, 
                        {'id': 'Des', 'text': 'Des'}
                     ];

        var showlistFields = ['Name', 'Addr', 'Leader', 'LeaderPhone'];             

        var decoratedArray = [];             

        _.forEach(datas, function(data) {
            var decoratedObj = new Object();
            decoratedObj.id = data.Id;
            decoratedObj.name = data.Name; 
            decoratedObj.shape = [data.Lat, data.Lng]; 
            decoratedObj.attribute = new Object();
            decoratedObj.showlist = new Object();

            _.forEach(data, function(value, key) {
                var field = _.find(fields, function(o) { return o.id === key; });      
                if(field !== undefined){
                    var text = field.text;

                    decoratedObj.attribute[key] = {text: text ,value: value};

                    if(_.indexOf(showlistFields, key) >= 0){
                        decoratedObj.showlist[text] = value;
                    }
                }
            });

            decoratedArray.push(decoratedObj);
        });             
        
        // var decoratedDatas = {'data': decoratedArray}     
        return decoratedArray;
    }

    return {
        alarmData: alarmData,
        enterpriseData: enterpriseData
    }
})();


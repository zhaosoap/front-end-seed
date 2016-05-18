var StationData = function(_tuple){
    this.id = _tuple["id"];
    this.pop = _tuple["pop"];
    this.position = [];
    this.position.push(parseFloat(_tuple["position"]["latitude"]));
    this.position.push(parseFloat(_tuple["position"]["longitude"]));
    this.heat = 0;
};

var dataContainer = {
	timeIndex:0,
    currHour:8,
    regionId:0,
    regionMapping:["airport","gzeast","residence"],
    residenceData:[],
    mapObj:null,
    startHour:7,
    endHour:12,
    markerPos:null,
    rectBounds:null,
    rectRange:0.01,
    centerMarker:null,
    centerRect:null,
    // query: hour,slice,startHour,endHour,startLat,startLng,endLat,endLng
    query:null,
    getMovementData: function(){
        var data_url = '/movement/get_movement_data';
        var data = this.query;
        
        $.ajax({
            type: 'POST',
            url: data_url,
            data: JSON.stringify(data),
            contentType: 'application/json;charset=UTF-8',
            success: dataContainer.parseMovementData
        }); 
    },
    
    parseMovementData: function(_data){
        var tempFlowData = [];
        var data = JSON.parse(_data);
        for (var i in data)
        {
            tempFlowData[i] = [];
            for(var j in data[i])
            {
                var datum = data[i][j];
                var tempStation = new StationData(datum);
                tempFlowData[i].push(tempStation);
            }
        }

        dataContainer.residenceData = tempFlowData;
        residenceHeat.setStationList(dataContainer.residenceData[dataContainer.timeIndex]);
        residenceMap.displayFlag = true;
        
        // Set slider
        if (timeSlider != null)
            timeSlider.remove();
        var startHour = dataContainer.startHour, endHour = dataContainer.endHour;
        TimeSliderOptions.cellText = [];
        TimeSliderOptions.defaultActiveId = 12;
        for (var hour_i=startHour; hour_i<endHour; hour_i++)
        {
            for (var slice_i = 0; slice_i<12; slice_i++)
            {
                var min = slice_i * 5;
                var minText = min<10?("0"+min):(""+min);
                var tmpText = hour_i +":" + minText;
                TimeSliderOptions.cellText.push(tmpText);
            }
        }
        TimeSliderOptions.cellNum = tempFlowData.length;
        timeSlider = new SlideWindow(TimeSliderOptions);
        timeSlider.setListener();
       
        gridSystem.centerGps = dataContainer.markerPos;
        gridSystem.setGridDataList(dataContainer.timeIndex);
        gridSystem.drawGridMap();
        gridSystem.setFocusGrid(TimeSliderOptions.defaultActiveId);
        
        $(timeSlider.cellBar).animate({left:"-="+TimeSliderOptions.defaultActiveId*timeSlider.cellWidth+"px"},200);
        timeSlider.leftMostCellId = TimeSliderOptions.defaultActiveId;
        timeSlider.resetArrow();
        // Shift the grid
        $("#"+timeSlider.gridMapDomId).animate({left:"-="+TimeSliderOptions.defaultActiveId*timeSlider.cellWidth+"px"},200);

        // Set marker
        if (dataContainer.centerMarker == null)
            dataContainer.centerMarker = L.marker(dataContainer.markerPos,{icon: centerIcon}).addTo(residenceMap.mapObj);
        else
            dataContainer.centerMarker.setLatLng(dataContainer.markerPos);
            
        // Set rectangle
        if (dataContainer.centerRect == null)
            dataContainer.centerRect = L.rectangle(dataContainer.rectBounds, {color: "#fff", weight: 4, opacity:0.8}).addTo(residenceMap.mapObj);
        else
            dataContainer.centerRect.setBounds(dataContainer.rectBounds);

        $('#point_selected_btn').html(SelectionWindow.focusRegion.htmlStr);
        endLoaderPage();
        $("#cover_on_top").fadeOut(400);
    }
};


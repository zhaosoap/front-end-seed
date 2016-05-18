/**
 * Created by g84046468 on 2015-10-06.
 */
var timeSlider;
var GridSystemOptions = {
    cellNumX: 8,
    cellNumY: 8,
    gridNumShown: 12,
    domId: "grid_view_panel",
    polarScaleDist: 0.03,
    polarScaleAngle: 45
};

// PolarPos Object: store the polar system position
var PolarPos = function(_r,_angle){
    this.r = _r;
    this.angle = _angle;
    this.reset = function(_r,_angle){
        this.r = _r;
        this.angle = _angle;
    }
};

// The following function takes charge of the transition between gps and polar system
var gpsToPolar = function(centerGps,gps){
    var diffGps = [gps[0]-centerGps[0],gps[1]-centerGps[1]];
    var dist = Math.sqrt(diffGps[0]*diffGps[0]+diffGps[1]*diffGps[1]);
    var angleDeg = Math.atan2(diffGps[0],diffGps[1])*180/Math.PI;
    if (angleDeg < 0) angleDeg += 360;

    return new PolarPos(dist,angleDeg);
};

var normPolarPoint = function(pPoint,pScale){
    var normPoint = new PolarPos();
    normPoint.r = Math.floor(pPoint.r/pScale.r);
    normPoint.angle = Math.floor(pPoint.angle/pScale.angle);

    return normPoint;
};

var polarToGps = function(centerGps,pPoint){
    var xOffset = pPoint.r * Math.cos(pPoint.angle*Math.PI/180);
    var yOffset = pPoint.r * Math.sin(pPoint.angle*Math.PI/180);
    var newGps = [0,0];
    newGps[1] = centerGps[1] + xOffset;
    newGps[0] = centerGps[0] + yOffset;

    return newGps;
};

var TimeSliderOptions = {
    cellNum: 24,
    cellNumShown: 12,
    domId: "slide_container",
    defaultActiveId: 0,
    cellText: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    gridMapDomId: "grid_view_panel"
};

var SlideWindow = function(option) {
    this.cellNum = option.cellNum;
    this.cellNumShown = option.cellNumShown;
    this.cellText = option.cellText;
    this.activeCellId = option.defaultActiveId;
    this.windowDom = document.getElementById(option.domId);
    this.gridMapDomId = option.gridMapDomId;

    this.cellWidth = parseInt($(this.windowDom).css("width"))/this.cellNumShown;
    this.barWidth = this.cellWidth*this.cellNum;

    this.cellList = [];

    // Generate the bar of cells
    this.cellBar = document.createElement('div');
    this.cellBar.className = "slide_bar";
    this.cellBar.style.width = this.barWidth+"px";
    this.windowDom.appendChild(this.cellBar);
    
    this.remove = function(){
        $("#"+this.gridMapDomId).css({left:"0px"});
        this.windowDom.removeChild(this.cellBar);
    };
    
    this.setListener = function(){
        // Set Listeners
        $('.slide_cell').click(function(e){
            var cellId = $(this).index('.slide_cell');
            // Change CSS
            timeSlider.changeFocusCell(cellId);

            gridSystem.setFocusGrid(cellId);
            
        });

    };
    this.changeFocusCell = function(cid){
        if (cid == this.activeCellId)
            return;
        // Change css
        $(this.cellList[this.activeCellId]).removeClass("checked");
        $(this.cellList[cid]).addClass("checked");
        this.activeCellId = cid;
    };

    this.leftMostCellId = 0;
    this.leftArrowDom = document.getElementById("left_arrow");
    this.rightArrowDom = document.getElementById("right_arrow");

    this.resetArrow = function(){
        if (this.leftMostCellId <= 0)
            this.leftArrowDom.style.display = "none";
        else
            this.leftArrowDom.style.display = "block";

        if (this.leftMostCellId >= this.cellNum-this.cellNumShown)
            this.rightArrowDom.style.display = "none";
        else
            this.rightArrowDom.style.display = "block";
    };
    // Direction: true->shift right; false->shift left
    this.shiftBar = function(direction){
        if (direction)
        {
            $(this.cellBar).animate({left:"-="+this.cellWidth+"px"},200);
            this.leftMostCellId ++;
            // Shift the grid
            $("#"+this.gridMapDomId).animate({left:"-="+this.cellWidth+"px"},200);
        }
        else
        {
            $(this.cellBar).animate({left:"+="+this.cellWidth+"px"},200);
            this.leftMostCellId --;
            // Shift the grid
            $("#"+this.gridMapDomId).animate({left:"+="+this.cellWidth+"px"},200);
        }
        this.resetArrow();
    };

    for (var i=0; i<this.cellNum; i++)
    {
        var newDiv = document.createElement('div');
        newDiv.className = "slide_cell";
        if (i == this.activeCellId)
            $(newDiv).addClass("checked");
        newDiv.style.width = this.cellWidth+"px";
        newDiv.innerHTML = "<span>"+this.cellText[i]+"</span>";

        //OnClick event is defined outside
        this.cellBar.appendChild(newDiv);
        this.cellList[i] = newDiv;
    }

    this.resetArrow();
};

var GridSystem = function(option) {
    // CellData Object: each cell in the grid has a position (x,y) and a value v
    this.CellData = function (x, y, v) {
        this.x = x;
        this.y = y;
        this.v = v;
    };

    this.polarScale = new PolarPos(option.polarScaleDist, option.polarScaleAngle);       // Scale of polar axis
    this.gridMapList = [];                              // A list of grids
    this.gridDataList = [];                             // A list of grids' data
    this.gridStationMatList = null;            // Stores all data in the grids
    this.gridNumShown = option.gridNumShown;

    this.cellNumX = option.cellNumX;                                  // Size of grid
    this.cellNumY = option.cellNumY;
    this.clickFlag = false;                             // Whether any cell is clicked

    this.centerGps = null;

    this.domId = option.domId;

    this.cellChecked = null;

    // Set data in a single grid
    this.setGridData = function (center, dataList, time) {
        var gridData = [];
        var gridStationMat = [];
        var centerGps = center;
        var temp_grid_mat = [];
        // Create an empty matrix
        for (var i = 0; i < this.cellNumX; i++) {
            temp_grid_mat[i] = [];
            gridStationMat[i] = [];
            for (var j = 0; j < this.cellNumY; j++) {
                temp_grid_mat[i][j] = 0;
                gridStationMat[i][j] = [];
            }
        }

        for (var index in dataList) {
            var datum = dataList[index];
            var tempPoint = gpsToPolar(centerGps, datum.position);
            var normPoint = normPolarPoint(tempPoint, this.polarScale);
            if (normPoint.r < this.cellNumX) {
                temp_grid_mat[normPoint.r][normPoint.angle] += datum.pop;
                gridStationMat[normPoint.r][normPoint.angle].push(datum);
            }
        }
        // push data into gridData
        for (var i = 0; i < this.cellNumX; i++) {
            for (var j = 0; j < this.cellNumY; j++) {
                var tempCell = new this.CellData(j, i, temp_grid_mat[i][j]);
                gridData.push(tempCell);
            }
        }
        this.gridDataList.push(gridData);
        this.gridStationMatList[time] = gridStationMat;
    };

    // Set data for the system with dataContainer Obj
    this.setGridDataList = function() {
        this.gridDataList = [];
        this.gridStationMatList = [];
        for (var i = 0; i < dataContainer.residenceData.length; i++) {
            this.setGridData(this.centerGps, dataContainer.residenceData[i], i);
        }
    };

    this.drawGridMap = function () {
        // Clear the view
        for (var index in this.gridMapList) {
            this.gridMapList[index].dom.remove();
        }
        $(".grid").remove();
        this.gridMapList = [];

        var gridMapContainer = document.getElementById(this.domId);
        var gridWidth = parseInt($(gridMapContainer).css("width")) / this.gridNumShown;

        for (var i = 0; i < this.gridDataList.length; i++) {
            var gridDom = document.createElement("div");
            gridDom.className = "grid";
            $(gridDom).css("width", gridWidth);
            $(gridDom).css("left", i * (gridWidth));
            gridMapContainer.appendChild(gridDom);

            var gridMapDom = document.createElement("div");
            gridMapDom.className = "grid_map";

            gridDom.appendChild(gridMapDom);

            var gridMap = new GridMap(gridMapDom, 8, 8, this.gridDataList[i], i, this);
            gridMap.drawCells();
            this.gridMapList.push(gridMap);
        }
    };
    
    this.setFocusGrid = function(tid){
        if(!this.gridMapList[tid])
            return;
        
        this.gridMapList[dataContainer.timeIndex].contour.attr("stroke","#000");
        dataContainer.timeIndex = tid;
        this.gridMapList[dataContainer.timeIndex].contour.attr("stroke","#F00");
        // Wrap this up
        if (residenceHeat.station_list!=[])
        {
            deselectRegion(this);
            residenceMap.layers.heatLayer.setStationList(dataContainer.residenceData[dataContainer.timeIndex]);
        }
    };
};

var GridMap = function (_dom,_x,_y, _data, _time,_parent){
    this.xLength = _x;
    this.yLength = _y;
    this.dom = d3.select(_dom);
    this.width = parseInt(this.dom.style("width"));
    this.timeId = _time;

    this.contourWidth = 3;
    this.height = parseInt(this.dom.style("height"));
    this.cWidth = (this.width-2*this.contourWidth)/this.xLength;
    this.cHeight = (this.height-2*this.contourWidth)/this.yLength;
    this.colorScale = ["#F9FF40","#FFE240","#FFAF40","#FF7040","#FF4040","#FF0000"];
    this.data = _data;
    this.svg = null;
    this.resetData = function(_data){
        this.data = _data;
        this.drawCells();
    };

    this.parent = _parent;
    
    this.drawCells = function(){
        var cell_width = this.cWidth;
        var cell_height = this.cHeight;
        var yCellNum = this.yLength;
        var timeId = this.timeId;
        var contourWidth = this.contourWidth;
        var colors = this.colorScale;
        var gridSystem = this.parent;
        
        if (this.svg)
        {
            this.svg.remove();
        }

        this.svg = this.dom.append("svg")
            .attr("width",this.width)
            .attr("height",this.height);

        var contourColor = "#000";
        if (timeId == dataContainer.timeIndex)
            contourColor = "#F00";

        this.contour = this.svg.append("rect")
            .attr("x",0 )
            .attr("y",0)
            .attr("width",this.width)
            .attr("height",this.height)
            .attr("stroke",contourColor)
            .attr("stroke-width",this.contourWidth)
            .attr("fill-opacity",0);

        this.cellsGroup = this.svg.append("g");

        this.cells = this.cellsGroup.selectAll("rect")
            .data(this.data)
            .enter()
            .append("rect")
            .attr("x", function(d) { return contourWidth+d.x*cell_width; })
            .attr("y", function(d) { return contourWidth+(yCellNum-1-d.y)*cell_height; })
            .attr("width",this.cWidth-1)
            .attr("height",this.cHeight-1)
            .attr("cell_x", function(d){ return d.x; })
            .attr("cell_y", function(d){ return d.y; })
            .attr("class",function(d){return "_"+d.x+"_"+ d.y;})
            .attr("id",function(d){return timeId + "_"+ d.x + "_"+ d.y})
            .classed("cell",true)
            .classed("unchecked",true)
            .style("fill",function(d){
                if (d.v == 0)
                    return "#1B1C1C";
                else
                {
                    return colors[Math.min(Math.floor(3*d.v/fullHeat),colors.length-1)];
                }
            })
            .attr("stroke","rgba(220,220,220,0)")
            .attr("stroke-width","1")
            .on("mouseover",function(){
                if (timeId != dataContainer.timeIndex) return;

                var cellX = d3.select(this).attr("cell_x");
                var cellY = d3.select(this).attr("cell_y");
                var classValue = "_"+cellX+"_"+cellY;
                d3.selectAll("."+classValue+".unchecked").attr("stroke","#fff").attr("stroke-width",2);

                drawPolarRegion(cellY,cellX, true, gridSystem);
                
                if (gridSystem.clickFlag) return;
                printRegionInfo(cellY,cellX,gridSystem);
            })
            .on("mouseout",function(){
                if (timeId != dataContainer.timeIndex) return;

                var cellX = d3.select(this).attr("cell_x");
                var cellY = d3.select(this).attr("cell_y");
                var classValue = "_"+cellX+"_"+cellY;
                d3.selectAll("."+classValue+".unchecked").attr("stroke","rgba(220,220,220,0)");

                residenceMap.mapObj.removeLayer(regionPolygon);
                
                if (gridSystem.clickFlag) return;
                printRegionInfo(cellY,cellX,gridSystem);
            })
            .on("click",function(){
                if (timeId != dataContainer.timeIndex) return;

                if (gridSystem.cellChecked != null && gridSystem.cellChecked.attr("id") == d3.select(this).attr("id"))
                {
                    gridSystem.clickFlag = false;
                    deselectRegion(gridSystem);
                }
                else
                {
                    gridSystem.clickFlag = true;

                    if (gridSystem.cellChecked)
                    {
                        gridSystem.cellChecked.attr("stroke","rgba(220,220,220,0)").attr("stroke-width","1")
                            .classed("checked",false).classed("unchecked",true);
                    }

                    var cellX = d3.select(this).attr("cell_x");
                    var cellY = d3.select(this).attr("cell_y");

                    drawPolarRegion(cellY,cellX, false,gridSystem);
                    printRegionInfo(cellY,cellX,gridSystem);

                    gridSystem.cellChecked = d3.select(this);
                    gridSystem.cellChecked.classed("checked",true).classed("unchecked",false);
                    d3.select(this).attr("stroke","#94E4FF").attr("stroke-width",2);
                }
            });

    }
};

// Initialize gridSystem object
var gridSystem = new GridSystem(GridSystemOptions);

// Interaction with map
var regionPolygon = null;
var selectedPolygon = null;

function interpolateArc (startAngle,endAngle,radius,center,pointNum){
    if (pointNum == undefined || pointNum < 2)
        pointNum = 10;

    var currAngle = 0, tempPoint = null;
    var pointArray = [];
    for (var i=0; i<=pointNum; i++)
    {
        currAngle = startAngle + i*(endAngle-startAngle)/pointNum;
        tempPoint = new PolarPos(radius,currAngle);
        pointArray.push(polarToGps(center,tempPoint));
    }
    return pointArray;
}

function drawPolarRegion(r_coord, angle_coord, flag, gridSystem){
    var polarScale = gridSystem.polarScale;
    if (flag)
    {
        var lineColor = "#757575";
        var lineOpacity = 0.5;
    }
    else
    {
        var lineColor = "#1179CF";
        var lineOpacity = 0.8;
    }
    var next_r_coord = parseInt(r_coord) + 1;
    var next_angle_coord = parseInt(angle_coord)+1;
    var points = [];

    // arc (0->1)
    var arcPoints1 = interpolateArc(angle_coord*polarScale.angle,next_angle_coord*polarScale.angle,r_coord*polarScale.r,dataContainer.markerPos,40);
    points = points.concat(arcPoints1);
    // line (1->2)
    var polarP = new PolarPos(next_r_coord*polarScale.r,next_angle_coord*polarScale.angle);
    points.push(polarToGps(dataContainer.markerPos,polarP));
    // arc (2->3)
    var arcPoints2 = interpolateArc(next_angle_coord*polarScale.angle,angle_coord*polarScale.angle,next_r_coord*polarScale.r,dataContainer.markerPos,40);
    points = points.concat(arcPoints2);
    // line (3->0)
    polarP = new PolarPos(r_coord*polarScale.r,angle_coord*polarScale.angle);
    points.push(polarToGps(dataContainer.markerPos,polarP));

    if (flag){
        regionPolygon = new L.Polygon(points,{color:lineColor,opacity:lineOpacity,fillOpacity:0});
        regionPolygon.addTo(residenceMap.mapObj);
    }
    else{
        if (residenceMap.mapObj.hasLayer(selectedPolygon))
            residenceMap.mapObj.removeLayer(selectedPolygon);
        selectedPolygon = new L.Polygon(points,{color:lineColor,opacity:lineOpacity,fillOpacity:0.2,fillColor:lineColor});
        selectedPolygon.addTo(residenceMap.mapObj);
        // zoom the map to the polygon
        //residenceMap.mapObj.fitBounds(selectedPolygon.getBounds());
    }
}

function sortStations(stationList) {
    // Bubble sort
    for (var i=0; i<stationList.length; i++)
    {
        for (var j=i; j>0; j--)
        {
            if (stationList[j].pop > stationList[j-1].pop)
            {
                // Swap
                var temp = stationList[j-1];
                stationList[j-1] = stationList[j];
                stationList[j] = temp;
            }
        }
    }
}

function printRegionInfo(x,y,gridSystem){
    // Delete current wrapper
    
    var stationList = gridSystem.gridStationMatList[dataContainer.timeIndex][x][y];

    sortStations(stationList);

    var sumPop = 0, sumLocs = 0;
    for (var i in stationList)
    {
        sumPop += stationList[i].pop;
        sumLocs += 1;
    }

    var string = "Region Info <hr />"
		+ "Time "+timeSlider.cellText[dataContainer.timeIndex]+":"+"<br />"
        + "Total Visits: "+sumPop + "";

    // Show a popup
    if(selectedPolygon!=null)
        selectedPolygon.bindPopup(string).openPopup();
}

function drawLineChart(x,y,gridsystem){
    // Prepare data
    var sumPopList = [], max = 0;
    for (var i=0; i<gridsystem.gridDataList.length; i++)
    {
        var stationList = gridsystem.gridStationMatList[i][x][y];
        var sumPop = 0;
        for (var j in stationList)
        {
            sumPop += stationList[j].pop;
        }
        sumPopList.push(sumPop);
        max = Math.max(sumPop, max);
    }

    var lineDom = document.getElementById("line_container");

    drawLine(sumPopList,lineDom,max,gridsystem.gridDataList.length);
}

function printStation(dom, station){
    var newDom = document.createElement("div");
    newDom.className = "grid_station_single";
    var string = "Location #" + station.id + "<br />"
        + "Position  : <" + station.position[0] + ", " + station.position[1] + "><br />"
        + "Population: " + station.pop + "<br /><br />";
    newDom.innerHTML = string;
    dom.appendChild(newDom);
}

function deselectRegion(gridSystem){
    if (selectedPolygon && residenceMap.mapObj.hasLayer(selectedPolygon))
        residenceMap.mapObj.removeLayer(selectedPolygon);

	selectedPolygon = null;
    
    d3.select("#line_container").selectAll("*").remove();
	
	if (gridSystem.cellChecked != null)
	{
        gridSystem.cellChecked.attr("stroke","rgba(220,220,220,0)").attr("stroke-width","1")
        .classed("checked",false).classed("unchecked",true);

        gridSystem.cellChecked = null;
	}
}

var blueIcon = L.icon({
    iconUrl: 'images/markers/marker-blue.png',
    iconSize:     [20, 34], // size of the icon
    iconAnchor:   [10, 34], // point of the icon which will correspond to marker's location
    popupAnchor:  [-3, -35] // point from which the popup should open relative to the iconAnchor
});

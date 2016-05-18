var StationData = function(_tuple){
    this.id = _tuple[0];
    this.position = _tuple[1];
    this.pop = _tuple[2];
    this.position[0] = parseFloat(this.position[0]);
    this.position[1] = parseFloat(this.position[1]);
    this.heat = 0;
    this.totalPop = 0;

    for (var i in this.pop)
    {
        for (var j in this.pop[i])
        {
            for (var k in this.pop[i][j])
            {
                this.totalPop += this.pop[i][j][k];
            }
        }
    }
    this.coveredPop = this.totalPop;
};

var dataContainer = {
    timeIndex:8,
    timeAggrData:null,
    stationList:[],

    readStationFile: function(){
        // Read data file
        startLoaderPage("Loading Data...");
        d3.json("data/density/sample/stay_"+dataContainer.timeIndex+".json", function(station_data_list){
            // empty the storage
            dataContainer.stationList = [];

            for (var i in station_data_list)
            {
                var datum = station_data_list[i];
                var tempStation = new StationData(datum);
                dataContainer.stationList.push(tempStation);
            }

            // Set heatmap data
            dataContainer.setMaxAndTotal();
            heatmapContainer.heatmapStats.totalLoc = dataContainer.stationList.length;

            heatmapContainer.refreshHeatmap(2);
            themeriver.refresh();
            endLoaderPage();
        })
    },

    setMaxAndTotal: function(){
        var max_pop = 0;
        var total_pop = 0;
        for (var index in this.stationList)
        {
            var station_pop = this.stationList[index].totalPop;
            total_pop += station_pop;
            max_pop = Math.max(max_pop,station_pop);
        }
        heatmapContainer.heatmapStats.maxPop = max_pop;
        heatmapContainer.heatmapStats.totalPop = total_pop;
    },
    // Calculate the heat value of each station
    setHeat: function(max_value, type, dim_i, label_i, change){
        heatmapContainer.heatmapStats.heat_data = [];
        var dimMat = selectionPanel.queryMat; 
        heatmapContainer.dimMat = dimMat;
        switch (type){
            case 0:
                // Heatlayer changes, data remains the same
                for (var index in this.stationList)
                {
                    var station = this.stationList[index];
                    station.heat = Math.min(1.0,station.coveredPop/max_value);
                    heatmapContainer.heatmapStats.heat_data.push([station.position[0],station.position[1],station.heat]);
                }
                break;
            case 1:
                // Dim matrix changes, change the data
                var coveredPop = 0;
                var scalar;
                if (change) scalar = 1;
                else scalar = -1;
                
                // startLoaderPage("Parsing Data...");
                for (var index in this.stationList)
                {
                    // Select the changed dimension
                    var station = this.stationList[index];
                    var station_selected_pop = 0;
                    for (var i in station.pop)
                    {
                        if (dim_i == 0)
                        {
                            i = label_i;
                        }
                        for (var j in station.pop[i])
                        {
                            if (dim_i == 1)
                            {
                                j = label_i;
                            }
                            for (var k in station.pop[i][j])
                            {
                                if (dim_i == 2)
                                {
                                    k = label_i;
                                }
                                station.coveredPop += scalar*station.pop[i][j][k];
                                if (dim_i == 2)
                                {
                                    break;
                                }
                            }
                            if (dim_i == 1)
                            {
                                break;
                            }
                        }
                        if (dim_i == 0)
                        {
                            break;
                        }
                    }
                    coveredPop += station.coveredPop;
                    station.heat = Math.min(1.0,station.coveredPop/max_value);
                    heatmapContainer.heatmapStats.heat_data.push([station.position[0],station.position[1],station.heat]);
                }
                break;
            case 2:
                // Change data file, reload all data
                var coveredPop = 0;

                for (var index in this.stationList)
                {
                    var station = this.stationList[index];

                    var station_selected_pop = 0;
                    for (var i in station.pop)
                    {
                        for (var j in station.pop[i])
                        {
                            for (var k in station.pop[i][j])
                            {
                                if (dimMat[0][i]&&dimMat[1][j]&&dimMat[2][k])
                                {
                                    station_selected_pop += station.pop[i][j][k];
                                }
                            }
                        }
                    }
                    station.coveredPop = station_selected_pop;
                    coveredPop += station_selected_pop;
                    station.heat = Math.min(1.0,station.coveredPop/max_value);
                    heatmapContainer.heatmapStats.heat_data.push([station.position[0],station.position[1],station.heat]);
                }
                break;
        }
        if (type == 1 || type == 2)
        {
            heatmapContainer.heatmapStats.queryPop = coveredPop;
            heatmapContainer.heatmapStats.queryPopPercent = Math.round(heatmapContainer.heatmapStats.queryPop / heatmapContainer.heatmapStats.totalPop * 10000) / 100;
        }
    }
};


function matEqual(mat1,mat2){
    // if the other array is a falsy value, return
    if (mat1==null || mat2==null)
        return false;
    else if (!Array.isArray(mat1)||!Array.isArray(mat2))
    {
        return mat1 == mat2;
    }
    else if (mat1.length != mat2.length)
        return false;
    else {
        for (var i in mat1){
            if (!matEqual(mat1[i],mat2[i]))
            {
                return false;
            }
        }
        return true;
    }    
}

function startLoaderPage(str){
    $("#loader_page").css({'display':'block'});
    $("#loader_text>span").html(str);
}

function updateLoaderPage(str){
    $("#loader_text>span").html(str);
}

function endLoaderPage(){
    $("#loader_page").css({'display':'none'});
}
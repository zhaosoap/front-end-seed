function HeatLayerContainer(map){
    this.mapContainer = map;
    this.heat_data = [];
    this.station_list = [];
    this.heatLayer = null;
    this.absFullHeat = true;

    this.heatmapStats = {
        heatlevel: 1.0,
        maxPop: 0,
        maxPopDisplay: 0,
        totalPop: 0,
        totalLoc: 0,
        queryPop: 0,
        queryPopPercent: 0,
        queryLoc: 0,
        queryLocPercent: 0
    };

    this.heatmapOptions = {
        minOpacity: 0.05,
        maxZoom: 15,
        max: 1,
        radius: 13,
        opacity: 0.9,
        density: 1,

        gradient: {
            0.15: 'blue',
            0.3: 'cyan',
            0.4: 'lime',
            0.6: 'yellow',
            1.0: 'red'
        },

        heatlevel: 1.0,
        blur: 20,
        max_radius: 100,
        min_radius: 1
    };


    this.heatmapOptions.heatlevel = this.heatmapStats.heatlevel;

    // Show the heatmap
    this.drawHeatmap = function(){
        if (this.mapContainer.mapObj.hasLayer(this.heatLayer))
        {
            this.heatLayer.setLatLngs(this.heat_data);
            return;
        }

        this.heatLayer = L.heatLayer(this.heat_data, this.heatmapOptions).addTo(this.mapContainer.mapObj);
        this.mapContainer.layers.heatLayer = this;
    };

    // Update heatlevel number and redraw the map
    this.updateHeatlevel = function(new_value){
        this.heatmapOptions.heatlevel = new_value;
        if (!this.mapContainer.layers.absHeatThresFlag)
        {
            this.heatmapStats.maxPopDisplay = this.heatmapStats.maxPop*new_value;
            this.setHeat();
        }
    };

    this.setMaxAndTotal = function(){
        var max_pop = 0;
        var total_pop = 0;
        for (var index in this.station_list)
        {
            var station_pop = this.station_list[index].pop;
            total_pop += station_pop;
            max_pop = Math.max(max_pop,station_pop);
        }
        if (this.absFullHeat)
        {
            this.heatmapStats.maxPop = fullHeat;
        }
        else
        {
            this.heatmapStats.maxPop = max_pop;
        }
        this.heatmapStats.totalPop = total_pop;
        this.heatmapStats.maxPopDisplay = total_pop * this.heatmapStats.heatlevel;
    };

    // Calculate the heat value of each station
    this.setHeat = function(max_value){
        // Set heatmap data
        this.setMaxAndTotal();
        this.heatmapStats.totalLoc = this.station_list.length;
        this.heatmapStats.maxPopDisplay = this.heatmapStats.maxPop * this.heatmapOptions.heatlevel;

        if (max_value == undefined)
        {
            max_value = this.heatmapStats.maxPopDisplay;
        }

        this.heat_data = [];

        var coveredPop = 0;

        for (var index in this.station_list)
        {
            var station = this.station_list[index];

            station.heat = station.pop/max_value;
            this.heat_data.push([station.position[0],station.position[1],station.heat]);
        }
        this.heatmapStats.queryPop = coveredPop;
        this.heatmapStats.queryPopPercent = Math.round(this.heatmapStats.queryPop / this.heatmapStats.totalPop * 10000) / 100;

        this.drawHeatmap();
    };

    this.setStationList = function(stationList){
        this.station_list = stationList;
        this.setHeat();
    }
}


function HeatmapContainer(mapdom) {
    this.mapDOM = mapdom;
    this.mapObj = null;
    this.markerA = null;
    this.markerB = null;
    this.clickFlag = false;
    this.displayFlag = false;

    this.layers = {
        heatFlag:true,
        heatLayer:null,
        absHeatThresFlag:false,
        absHeatThres:1500
    };

    this.initMap = function(){
        // Connect to Mapbox and show the map
        L.mapbox.accessToken = 'pk.eyJ1IjoibGlzaGVuZ2dhbzIxIiwiYSI6ImYzN2FkNjBkNDJmMDE0MmU4YjVlYmY1YzljZDE2ZjIzIn0.Ns5_p5awUvbNFxB5H9JW6w#9';
        this.mapObj = L.mapbox.map(this.mapDOM, 'lishenggao21.n8icc894',{zoomControl:false}).setView([31.1945,121.4301], 11);
        this.mapObj.mapLayers = L.mapbox.tileLayer('mapbox.streets');

        var heatlayers = this.layers.heatLayer;

        this.mapObj.invalidateSize();

        //regionSelector.init();
        //regionSelector.addTo(this.mapObj);
    };

    this.toggleHeatmap = function(cb){
        this.parentMap.layers.heatFlag = !this.parentMap.layers.heatFlag;
        if (!this.parentMap.layers.heatFlag)
        {

            cb.classList.remove("checked");
            this.parentMap.layers.heatLayer.setOpacity(0);
        }
        else
        {
            cb.classList.add("checked");
            this.parentMap.layers.heatLayer.setOpacity(1);
        }
    };
    
    this.removeLayers = function(){
        this.mapObj.removeLayer(heatLayer);
    };
}

function stationOnHover(station, _shape, x, y){

    station.bringToFront();

    if (_shape == 'circle')
    {
        station.setStyle({
            color: 'red',
            fillColor: 'yellow',
        });
    }
    else if(_shape == 'sel')
    {
        station.setStyle({
            color: '#94E4FF',
            fillColor: 'blue',
        });
    }

    var station_item = station.stationObj;
    var station_rank = parseInt(station.station_index)+1;
    var info_string = "Popular Location #" + station_rank + "<br />"
        + "Location ID: " + station_item.id + "<br />"
        + "Position  : <" + station_item.position[0] + ", " + station_item.position[1] + "><br />"
        + "Population: " + station_item.pop + "<br />";

    return info_string;
}

function stationOffHover(station, _shape){

    if (_shape == 'circle')
    {
        station.setStyle({
            color: 'black',
            fillColor: 'white',
        });
    }
    else if(_shape == 'sel')
    {
        station.setStyle({
            color: '#94E4FF',
            fillColor: 'white',
        });
    }
}

function stationOnClick(_mapContainer, station){
    var clickedId = station.id;
    if (!_mapContainer.clickFlag || clickedId == dataContainer.stationIds || clickedId == dataContainer.stationIds)
    {
        // Nothing
    }
    else
    {
        changePointSetting(station.stationObj);
    }

}


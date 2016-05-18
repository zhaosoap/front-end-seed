var heatmapContainer = {
    displayDOM: "pop_num_display",
    dimMat:null,
    heatmapStats: {
        heatlevel: 1.0,
        maxPop: 0,
        maxPopDisplay: 0,
        totalPop: 0,
        totalLoc: 0,
        queryPop: 0,
        queryPopPercent: 0,
        queryLoc: 0,
        queryLocPercent: 0,
        heat_data: []
    },

    heatmapOptions: {
        minOpacity: 0,
        maxZoom: 15,
        max: 1,
        radius: 13,
        opacity:1,
        density:1,

        gradient: {
            0.4: 'blue',
            0.6: 'cyan',
            0.7: 'lime',
            0.8: 'yellow',
            1.0: 'red'
        },

        heatlevel: 1.0,
        blur: 13,
        max_radius: 100,
        min_radius: 1,
        defaultHeatThres:4000
    },

    heatmap: {
        map:null,
        mapLayers:null,
        heatLayer:null,
        heatFlag:true,
        pointFlag:true,
    },

    pointMap: {
        circlesGroup:null,
        popThres:1500,
        visibleStationNum:0,
        //radiusArray:[2,3,3,5,5,10,15],
        radiusArray:[2,3,3,3,3,3,5,5,5,5,5],

        drawPoints: function(){
            // Read data
            var zoom;
            var circle;

            if (heatmapContainer.heatmap.map.hasLayer(this.circlesGroup))
            {
                heatmapContainer.heatmap.map.removeLayer(this.circlesGroup);
            }

            this.circlesGroup = L.featureGroup();

            zoom = heatmapContainer.heatmap.map.getZoom();

            for (var i in dataContainer.stationList)
            {

                var station = dataContainer.stationList[i];

                circle = L.circleMarker([station.position[0],station.position[1]],{
                    color: '#000',
                    weight: Math.min(5,this.radiusArray[zoom-9]/2),
                    fillColor: '#eee',
                    opacity: 1,
                    fillOpacity: 1
                });

                circle.setRadius(this.radiusArray[zoom-9]);
                circle.station_index = i;

                var popup = L.popup();
                circle.popup = popup;

                circle.on('mouseover', function(e){
                    popup
                        .setLatLng(e.latlng)
                        .setContent(stationOnHover(this,'circle'))
                        .openOn(heatmapContainer.heatmap.map);
                });

                circle.on('mouseout', function(e){
                    stationOffHover(this,'circle');
                    heatmapContainer.heatmap.map.closePopup();
                });
                
                station.circle = circle;
                
				if (station.coveredPop> this.popThres)
                {
               		this.circlesGroup.addLayer(circle);
                }
            }

            if (heatmapContainer.heatmap.pointFlag) {
                this.circlesGroup.addTo(heatmapContainer.heatmap.map);
            }
        }
    },

    initHeatmap: function(){
        // Connect to Mapbox and show the map
        L.mapbox.accessToken = 'pk.eyJ1IjoibGlzaGVuZ2dhbzIxIiwiYSI6ImYzN2FkNjBkNDJmMDE0MmU4YjVlYmY1YzljZDE2ZjIzIn0.Ns5_p5awUvbNFxB5H9JW6w#9';
        this.heatmap.map = L.mapbox.map('map', 'lishenggao21.n8icc894', { zoomControl:false }).setView([31.1945,121.4301], 11);
        this.heatmap.mapLayers = L.mapbox.tileLayer('mapbox.streets');
        // Adapt to zoom
        this.heatmap.map.on('zoomend', function(e)
        {
            // Change radius
            heatmapContainer.pointMap.drawPoints(heatmapContainer.pointMap.visibleStationNum);
        });
        this.heatmap.map.invalidateSize();
        this.heatmapOptions.heatlevel = this.heatmapStats.heatlevel;
    },

    // Show the heatmap
    drawHeatmap: function(){
        if (this.heatmap.heatLayer != undefined)
        {
            this.heatmap.heatLayer.setLatLngs(this.heatmapStats.heat_data);
            return;
        }

        this.heatmap.heatLayer = L.heatLayer(this.heatmapStats.heat_data, this.heatmapOptions).addTo(this.heatmap.map);
    },

    // Update heatlevel number and redraw the map
    updateHeatlevel: function(new_value){
        this.heatmapOptions.heatlevel = new_value;
        dataContainer.setHeat(this.heatmapOptions.defaultHeatThres*this.heatmapOptions.heatlevel,0);
    },

    displayResultStat: function(){
        $("#"+this.displayDOM).html(heatmapContainer.heatmapStats.queryPop + "(" + heatmapContainer.heatmapStats.queryPopPercent + "%)");
    },



    toggleHeatmap: function(cb){
        this.heatmap.heatFlag = !this.heatmap.heatFlag;
        if (!heatmapContainer.heatmap.heatFlag)
        {

            cb.classList.remove("checked");
            this.heatmap.heatLayer.setOpacity(0);
        }
        else
        {
            cb.classList.add("checked");
            this.heatmap.heatLayer.setOpacity(1);
        }
    },

    toggleCircles: function(cb){
        this.heatmap.pointFlag = !this.heatmap.pointFlag;
        if (!this.heatmap.pointFlag)
        {
            cb.classList.remove("checked");
            this.heatmap.map.removeLayer(this.pointMap.circlesGroup);
        }
        else
        {
            cb.classList.add("checked");
            this.pointMap.circlesGroup.addTo(this.heatmap.map);
        }
    },

    refreshHeatmap: function(type, dim_i, label_i, change){
        dataContainer.setHeat(this.heatmapOptions.defaultHeatThres*this.heatmapOptions.heatlevel, type, dim_i, label_i, change);
        this.drawHeatmap(this.heatmapStats.heat_data);
        this.displayResultStat();
        this.pointMap.drawPoints()
    }
};

function stationOnHover(station, _shape){

    if (_shape == 'circle')
    {
        station.setStyle({
            color: 'red',
            fillColor: 'yellow',
        });
    }
    else if(_shape == 'mark')
    {
        if (station.selected)
        {
            return;
        }
        station.setIcon(square_icon_sel);
    }

    var station_item = dataContainer.stationList[station.station_index];
    var station_rank = parseInt(station.station_index)+1;
    var info_string = "Location ID: " + station_item.id + "<br />"
        + "Position  : <" + station_item.position[0] + ", " + station_item.position[1] + "><br />"
        + "Population: " + station_item.coveredPop + "<br />";

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
    else if(_shape == 'mark')
    {
        if (station.selected)
        {
            return;
        }

        station.setIcon(station.icon);
    }
}

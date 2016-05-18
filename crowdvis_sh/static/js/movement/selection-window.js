var submit_btn = null;
var region_info_dom = null;
var loader_id = "loader_page";

var blueIcon = L.icon({
    iconUrl: 'images/markers/marker-blue.png',
    iconSize:     [20, 34], // size of the icon
    iconAnchor:   [10, 34], // point of the icon which will correspond to marker's location
    popupAnchor:  [-3, -35] // point from which the popup should open relative to the iconAnchor
});

var RegionObject = function(gps,bound,label,index){
    this.centerGps = gps;
    this.bound = bound;
    this.label = label;
    this.index = index;
    this.htmlStr = label+'<br />'
        + 'Position: ['+gps[0]+', '+gps[1]+']';
    this.rect = L.rectangle(bound, {color: "#1D12FC", weight: 2}).addTo(SelectionWindow.mapContainer.mapObj);
    var regionHtmlObj = document.createElement('div');
    regionHtmlObj.className = 'region_list_item';
    regionHtmlObj.innerHTML = this.htmlStr;
    document.getElementById('region_list').appendChild(regionHtmlObj);

    this.dom = regionHtmlObj;
    this.dom.region = this;
    $(this.dom).mouseover(function(){
        if (SelectionWindow.focusRegion != null) return;
        this.region.rect.setStyle({color: '#6159FF'});
    });
    $(this.dom).mouseout(function(){
        if (SelectionWindow.focusRegion != null) return;
        this.region.rect.setStyle({color: '#1D12FC'});
    });
    $(this.dom).mousedown(function(){
        if (SelectionWindow.focusRegion != null)
        {
            SelectionWindow.focusRegion.rect.setStyle({color: '#1D12FC'});
            $(SelectionWindow.focusRegion.dom).removeClass('active');
            if (SelectionWindow.focusRegion == this.region)
            {
                $(submit_btn).removeClass('valid');
                SelectionWindow.focusRegion = null;
                return;
            }
        }
        else
        {
            $(submit_btn).addClass('valid');
        }
        SelectionWindow.mapContainer.mapObj.fitBounds(this.region.rect.getBounds());
        SelectionWindow.focusRegion = this.region;
        this.region.rect.setStyle({color: '#FFE95C'});
        $(this).addClass('active');
    });
};

var SelectionWindow = {
    mapContainer:null,
    regionList:[],
    focusRegion:null,
    makeQuery:function(){
        var query = {};
        query.regionId = this.focusRegion.index;
        dataContainer.query = query;
        dataContainer.markerPos = this.focusRegion.centerGps;
        dataContainer.rectBounds = this.focusRegion.rect.getBounds();
        dataContainer.getMovementData();
    }
};

function initSelectionWindow(){
    
  	$("#point_select_btn").click(function(e){
  	    $("#select_panel").css({'display':'block'});
		$("#cover_on_top").fadeIn(400);
	});
	
	$("#exit_sign").click(function(e){
        // Reset region selector
		$("#select_panel").fadeOut(400,function(){
            $("#cover_on_top").fadeOut(200);
        });
	});

    // Render heat layer
    SelectionWindow.mapContainer = new HeatmapContainer("map_on_top");
    SelectionWindow.mapContainer.initMap();

    SelectionWindow.regionList.push(new RegionObject([31.14435,121.80608],[[31.13435,121.79608],[31.15435,121.81608]],'Pudong Airport',0));
    SelectionWindow.regionList.push(new RegionObject([31.19190,121.33482],[[31.18190,121.32482],[31.20190,121.34482]],'Hongqiao Airport',1));
    SelectionWindow.regionList.push(new RegionObject([31.29742,121.50143],[[31.29242,121.49643],[31.30242,121.50643]],'Fudan University',2));
    SelectionWindow.regionList.push(new RegionObject([31.19449,121.43007],[[31.18949,121.42507],[31.19949,121.43507]],'Xujiahui District',3));

    // Onclick event
    submit_btn = document.getElementById('region_submit_btn');
    $(submit_btn).on('click',function(){
        if (!$(this).hasClass("valid"))
            return;
        
        SelectionWindow.makeQuery();
        // Reset region selector
        deselectRegion(gridSystem);
        
        // Reset grid system
        gridSystem.setFocusGrid(0);
        
        var loaderStr = "Extracting Requested Data...<br />" + SelectionWindow.focusRegion.htmlStr;
        $("#select_panel").fadeOut(400);
        startLoaderPage(loaderStr);
    });

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


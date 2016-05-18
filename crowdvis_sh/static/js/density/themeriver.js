var colorChart = ["#0084C6","#6495ED","#60C6DD","#9BCA63","#FAD860","#FF9385"];

var themeriver = {
    // Duplicate of timeData in dataContainer
    timeData:null,
    // Data prepared for themeriver and piechart display
    themeriverData:[],
    piechartData:[],
    // Themeriver components
    themeriverDOM:null,
    xScale:null,
    maxRiverWidth:0,
    focusDimIndex:0,
    mouseClickChartFlag: false,

    // Reset themeriver data and draw the graph
    refresh:function(){
        this.timeData = dataContainer.timeAggrData;
        this.setData();
    },

    // prepare the data to be shown in themeriver
    setData:function(){
        
        this.max_sum = 0;
        var dimMat = selectionPanel.queryMat;

        this.themeriverData = [];
        for(var _i=0; _i < dimMat[this.focusDimIndex].length; _i++)
        {
            var tempArray = [];
            for (var _j=0;_j<24;_j++)
            {
                tempArray.push(0);
            }
            this.themeriverData.push(tempArray);
        }


        for (var time_i in this.timeData)
        {
            var popCube = this.timeData[time_i];

            for (var i in popCube)
            {
                for (var j in popCube[i])
                {
                    for (var k in popCube[i][j])
                    {
                        if (this.focusDimIndex==0)
                        {
                            if (dimMat[1][j] && dimMat[2][k]) this.themeriverData[i][time_i] += popCube[i][j][k];
                        }
                        else if (this.focusDimIndex==1)
                        {
                            if (dimMat[0][i]&&dimMat[2][k]) this.themeriverData[j][time_i] += popCube[i][j][k];
                        }
                        else if (this.focusDimIndex==2)
                        {
                            if (dimMat[0][i]&&dimMat[1][j]) this.themeriverData[k][time_i] += popCube[i][j][k];
                        }
                    }
                }
            }
        }

        for (var i in this.themeriverData)
        {
            if (!dimMat[this.focusDimIndex][i]){
                for (var j in this.themeriverData[i])
                {
                    this.themeriverData[i][j]=0;
                }
            }
        }

        var max_sum = 0;
        for (var i in this.timeData)
        {
            var temp_sum = 0;
            for(var j in dimMat[this.focusDimIndex])
            {
                temp_sum += this.themeriverData[j][i];
            }
            max_sum = Math.max(max_sum,temp_sum);
        }

        this.maxRiverWidth = max_sum;

        // Show the pie chart
        cover_data = [heatmapContainer.heatmapStats.queryPop,heatmapContainer.heatmapStats.totalPop-heatmapContainer.heatmapStats.queryPop];
        piechart_data = [];
        
        for (var i=0;i<dimMat[this.focusDimIndex].length;i++) {
            piechart_data.push(this.themeriverData[i][dataContainer.timeIndex]);
        }
        piechartContainer.setData(piechart_data,cover_data);

        this.showThemeriver();
    },

    showThemeriver:function() {
        if (this.themeriverDOM)
        {
            d3.select("#tr_svg").remove();
        }
        var data = this.themeriverData;
        var max_data = this.maxRiverWidth;

        width = $("#themeriver_wrapper").width() - 40;
        height = $("#themeriver_wrapper").height() - 70;

        data = data.map(function(d) {
            return d.map(function(p,i) {
                return {x:i, y:p, y0:0};
            });
        });

        var upperlimit = max_data*1.8;
        //  Create x and y axis
        var xScale = d3.scale.linear().domain([0, 23]).range([0, width]);

        var yScale = d3.scale.linear().domain([0, upperlimit]).range([height, 0]);

        var xAxis = d3.svg.axis().scale(xScale).tickSize(-height).ticks(24).orient("bottom");

        var svg = d3.select("#themeriver_wrapper").append("svg")
            .attr("id","tr_svg")
            .attr("width", width + 40)
            .attr("height", height + 70)
            .append("g")
            .attr("transform", "translate(20, 10)");

        var stack = d3.layout.stack().offset("silhouette");
        var layers = stack(data);
        var area = d3.svg.area()
            .interpolate('cardinal')
            .x(function(d, i) { return xScale(i); })
            .y0(function (d) { return yScale(d.y0); })
            .y1(function (d) { return yScale(d.y0+d.y); });

        //svg.append("g").attr("class", "y axis").attr("stroke", "black").style("font-family", "Georgia, serif").style("font-size", "12px").style("z-index", "90").call(yAxis);
        var y_offset = (0.5-0.9)*height/1.8;
        svg.selectAll(".layer")
            .data(layers)
            .enter().append("path")
            .attr("class", "layer")
            .attr("d", function(d){ return area(d) })
            .style("fill", function(d,i){ return colorChart[i]; })
            .style("opacity",1)
            .attr("stroke", "#FFF")
            .attr("stroke-width", 0.5)
            .attr("transform", "translate(0, " + y_offset + ")");

        // x-axis
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .attr("stroke", "black")
            .style("font-family", "Georgia, serif")
            .style("font-size", "12px")
            .call(xAxis);

        var indicatorLine = svg.append("rect").attr("x", function() {
            return xScale(1) - 2.5;
        }).attr("y", 0).attr("id", "indiLine").attr("width", 5).attr("height", height).attr("fill", "#FAD02A").attr("opacity", 0.8);

        var currLine = svg.append("rect").attr("id", "currLine").attr("x", function() {
            return xScale(dataContainer.timeIndex) - 1.5;
        }).attr("y", 0).attr("width", 3).attr("height", height).attr("fill", "#E07400").attr("opacity", 1);

        // Set mouseon, click, mouseout events
        var themeriver_svgPanel = svg.append("rect")
            .attr("width", width)
            .attr("height", height)
            .attr("fill", "#fff")
            .attr("opacity", 0)
            .on("mousemove", function(d) {
                 var mousePos = d3.mouse(svg[0][0]);
                 var mouseX = mousePos[0];
                 var minI = 0;
                 var min = 1e9;

                 for (var i = 0; i < 24; ++i) {
                     var absValue = Math.abs(xScale(i) - mouseX);
                     if (absValue < min) {
                         min = absValue;
                         minI = i;
                     }
                 }

                 indicatorLine.attr("x", function() {
                    return xScale(minI) - 1.5;
                 });

                 // Dragging event
                if (this.mouseClickChartFlag) {
                    currLine.attr("x", function() {
                        return xScale(minI) - 1.5;
                    });
                    if(dataContainer.timeIndex != minI)
                    {
                        dataContainer.timeIndex = minI;
                        dataContainer.readStationFile();
                    }
                }

            }).on("mousedown", function() {
                this.mouseClickChartFlag = true;
                d3.select("#indiLine").attr("opacity", 0);

                var mousePos = d3.mouse(svg[0][0]);
                var mouseX = mousePos[0];
                var minI = 0;
                var min = 1e9;

                for (var i = 0; i < 24; ++i) {
                    var absValue = Math.abs(xScale(i) - mouseX);
                    if (absValue < min) {
                        min = absValue;
                        minI = i;
                    }
                }

                currLine.attr("x", function() {
                    return xScale(minI) - 1.5;
                });

                if(dataContainer.timeIndex != minI)
                {
                    dataContainer.timeIndex = minI;
                    dataContainer.readStationFile();
                }

            }).on("mouseup", function() {
                this.mouseClickChartFlag = false;
                d3.select("#indiLine").attr("opacity", 0.3);
            });

        this.themeriverDOM = svg;
        this.xScale = xScale;
        $("#riverwidth").html("Max River Width: "+this.maxRiverWidth);
    },

    setFocusCat:function() {
        this.setData()
    },


    demo:function() {
        d3.select("#indiLine").attr("opacity", 0);
        d3.select("#currLine").attr("x", function() {
            return themeriver.xScale(0) - 1.5;
        });
        this.demoActivity(0);
    },

    demoActivity:function(i){
        if (i > 23) {
            d3.select("#indiLine").attr("opacity", 0.3);
        } else {
            d3.select("#currLine").attr("x", function() {
                return themeriver.xScale(i) - 1.5;
            });
            dataContainer.timeIndex = i;
            dataContainer.readStationFile();
            setTimeout(function() {
                themeriver.demoActivity(i + 1);
            }, 400);
        }
    },

    setDropdown:function(){
        var dropdownDOM = $("#dropdown-menu");
            for (var i=0;i<selectionPanel.focusDimNum;i++)
            {
                dropdownDOM.append('<li><a href="#" class="dim_selector">'+selectionPanel.dimList[i].name+'</a></li>');
            }
            $("#dropdownText").html(selectionPanel.dimList[0].name);
            // Set listener
            $(".dim_selector").click(function(){
                themeriver.focusDimIndex = $(this).parent().index();
                $("#dropdownText").html($(this).html());
                themeriver.setFocusCat();
            });
        }
};

var piechartContainer ={
    dimPieDOM:null,
    coverPieDOM:null,
    dimPieData:null,
    coverPieData:null,
    coverColors:["#E0E0E0","#595959"],
    coverTitles:["Covered", "Uncovered"],
    setData: function(_data1,_data2){
        this.dimPieData = _data1;
        this.coverPieData = _data2;
        this.showPieChart();
    },
    showPieChart:function(){
        if (this.dimPieDOM)
        {
            d3.select("#pc_svg").remove();
        }

        if (this.coverPieDOM)
        {
            d3.select("#pc_svg2").remove();
        }

        var width = $("#piechart_wrapper_1").width(),
            height = $("#piechart_wrapper_1").height(),
            radius = Math.min(width,height)/2-40;

        var arc = d3.svg.arc()
            .outerRadius(radius - 10)
            .innerRadius(0);

        var tots = d3.sum(this.dimPieData, function(d) {
            return d;
        });
        
        var tots_2 = d3.sum(this.coverPieData, function(d) {
            return d;
        });

        this.dimPieData.forEach(function(d){
            d.percentage = d/tots;
        });

        var pie = d3.layout.pie()
            .sort(null)
            .value(function(d) {return d;});

		this.dimPie = d3.select("#piechart_wrapper_1").append("svg")
			.attr("width",width)
            .attr("height",height)
            .attr("id","pc_svg");
		
        this.dimPieDOM = this.dimPie.append("g")
            .attr("transform", "translate("+width/2+","+radius+")");

        var g = this.dimPieDOM.selectAll(".arc")
            .data(pie(this.dimPieData))
            .enter().append("g")
            .attr("class","arc");
            
        g.append("path")
            .attr("d",arc)
            .style("fill", function(d,i){return colorChart[i];})
            .attr("stroke", "#FFF")
            .attr("stroke-width", function(d){if(d.value != 0) return 1; else return 0;});

        g.append("text")
            .attr("transform", function(d) {return "translate("+arc.centroid(d)+")";})
            .attr("dy", ".20em")
            .style("text-anchor","middle")
            .attr("font-size","12px")
            .text(function(d,i){if(d.value != 0) return Math.round(1000*d.value/tots)/10+'%';});
            
        
        for (var i in selectionPanel.dimList[themeriver.focusDimIndex].labels)
        {
        	var color = colorChart[i];
        	this.dimPie.append("rect")
        		.attr("x",10+(i%3)*80)
        		.attr("y",160+Math.floor(i/3)*20)
        		.attr("width",15)
        		.attr("height",15)
        		.style("fill",color);
        	
        	this.dimPie.append("text")
        		.attr("x",10+(i%3)*80+22)
        		.attr("y",172+Math.floor(i/3)*20)
        		.style("fill","#fff")
        		.text(selectionPanel.dimList[themeriver.focusDimIndex].labels[i]);
        }

		this.coverPie = d3.select("#piechart_wrapper_2").append("svg")
            .attr("width",width)
            .attr("height",height)
            .attr("id","pc_svg2");
        this.coverPieDOM = this.coverPie.append("g")
            .attr("transform", "translate("+width/2+","+radius+")");

        var g2 = this.coverPieDOM.selectAll(".arc")
            .data(pie(this.coverPieData))
            .enter().append("g")
            .attr("class","arc");

        g2.append("path")
            .attr("d",arc)
            .style("fill", function(d,i){return piechartContainer.coverColors[i];})
            .attr("stroke", "#FFF")
            .attr("stroke-width", function (d) {
                if (d.value != 0) return 1; else return 0;
            });
        g2.append("text")
            .attr("transform", function(d) {return "translate("+arc.centroid(d)+")";})
            .attr("dy", ".20em")
            .style("text-anchor","middle")
            .attr("font-size","12px")
            .text(function(d,i){if (d.value!=0) return Math.round(1000*d.value/tots_2)/10+'%';});
            
        this.coverPie.append("rect")
        		.attr("x",30)
        		.attr("y",160)
        		.attr("width",15)
        		.attr("height",15)
        		.style("fill","#E0E0E0");
        	
        this.coverPie.append("text")
        		.attr("x",52)
        		.attr("y",172)
        		.style("fill","#fff")
        		.text("Covered");
        
        this.coverPie.append("rect")
        		.attr("x",110)
        		.attr("y",160)
        		.attr("width",15)
        		.attr("height",15)
        		.style("fill","#595959");
        
        this.coverPie.append("text")
        		.attr("x",132)
        		.attr("y",172)
        		.style("fill","#fff")
        		.text("Uncovered");
    }
};

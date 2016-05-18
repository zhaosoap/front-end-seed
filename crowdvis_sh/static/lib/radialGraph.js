/**
 * Created by Qiaomu on 2015/12/7.
 *
 * Edited by Lisheng on 2016/01/13
 * 1. Delete Variables: startHour, endHour; change: hoursPerSector->slicesPerSector;
 *    --Using numberOfSectors, numberOfSlices for calculation
 */
function RadialGraph(parameter){

    var isLegend = true;
    var _this = this;
    var rawData = null;

    parameter = parameter? parameter:{};
    parameter.sortType = parameter.sortType == undefined? "distance": parameter.sortType ;
    parameter.maxDistance = parameter.maxDistance == undefined? 20 : parseFloat(parameter.maxDistance);
    parameter.sigmaNum = parameter.sigmaNum == undefined ? 2 : parameter.sigmaNum;
    parameter.maxLength = parameter.maxLength == undefined? 150 : parameter.maxLength;
    parameter.numberOfSectors = parameter.numberOfSectors == undefined? 12: parameter.numberOfSectors;
    parameter.numberOfSlices = parameter.numberOfSlices == undefined? 24: parameter.numberOfSlices;

    parameter.panelWidth = parameter.panelWidth == undefined? 500: parameter.panelWidth;
    parameter.panelHeight = parameter.panelHeight == undefined? 500: parameter.panelHeight;
    parameter.textColor = parameter.textColor == undefined? 'red': parameter.textColor;

    parameter.elementId = parameter.elementId == undefined? 'radial_graph': parameter.elementId;
    if(parameter.startColor == undefined || parameter.stopColor == undefined){
        parameter.stopColor = 'rgb(65,171,93)';
        parameter.startColor = 'rgb(247,252,245)';
    }
    parameter.borderColor = parameter.borderColor == undefined? "dodgerblue": parameter.borderColor;
    parameter.selectBoundaryColor = parameter.selectBoundaryColor == undefined? "red": parameter.selectBoundaryColor;
    var sortType = parameter.sortType;
    var maxDistance = parameter.maxDistance;
    var sigmaNum = parameter.sigmaNum;
    var maxLength = parameter.maxLength;
    var numberOfSectors = parameter.numberOfSectors;
    var numberOfSlices = parameter.numberOfSlices;
    var slicesPerSector = Math.ceil(numberOfSlices/numberOfSectors);
    var panelWidth = parameter.panelWidth;
    var panelHeight = parameter.panelHeight;
    var elementId = parameter.elementId;
    var element = parameter.element == undefined? ("#" + elementId): parameter.element;
    var startColor = parameter.startColor;
    var stopColor = parameter.stopColor;
    var borderColor = parameter.borderColor;
    var selectBoundaryColor = parameter.selectBoundaryColor;
    var textColor = parameter.textColor;
    var textArray = parameter.textArray;
    var legendLength = parameter.legendLength?parameter.legendLength: maxLength * 2 / 3;



    this.on = function(order, func){
        if(order == 'mouseover') this.runMouseOver = func;
        else if(order == 'mouseout') this.runMouseOut = func;
        else if(order == 'click') this.runClick = func;
    };


    this.setData = function(data) {
        rawData = data;
    };

    var switchIsLegend = function() {
        isLegend = !isLegend;
        //d3
        //    .select("#legend_tree_map")
        //    .style("display", isLegend ? "block" : "none");
    };

    this.switchIsLegend = switchIsLegend;

    this.drawLegend = function() {
        d3.select("#legend_tree_map").remove();

        var margin = {left: 15, right: 10, top: 20, bottom: 15};

        var legendWidth = legendLength;
        var legendHeight = 45;

        var legend = d3.select('#radial_graph_svg').append('g').attr('id','legend_tree_map');
        var gradient = legend.append("g").append("svg:defs")
            .append("svg:linearGradient")
            .attr("id", "gradient3")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "0%")
            .attr("spreadMethod", "pad");

        gradient.append("svg:stop")
            .attr("offset", "0%")
            .attr("stop-color", startColor)
            .attr("stop-opacity", 1);

        gradient.append("svg:stop")
            .attr("offset", "90%")
            .attr("stop-color", stopColor)
            .attr("stop-opacity", 1);

        gradient.append("svg:stop")
            .attr("offset", "100%")
            .attr("stop-color", stopColor)
            .attr("stop-opacity", 1);

        legend.append("g").append("rect").attr("width", legendWidth - margin.left - margin.right).attr("height", legendHeight - margin.top - margin.bottom).attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .attr("fill", "url(#gradient3)");

        legend.append("text").text("Total Visit").style("fill",textColor).style("font-size", "10px").style("font-weight", "bold").style("text-anchor", "start").attr("transform", "translate(" + margin.left + "," + (margin.top - 5) + ")");

        legend.append("text").text("0").style("font-size", "10px").style("fill",textColor).style("text-anchor", "start").attr("transform", "translate(" + margin.left + "," + (legendHeight - margin.bottom + legendHeight - margin.top - margin.bottom) + ")");

        legend.append("text").text(maxDistance).style("text-anchor", "end").style("fill",textColor).style("font-size", "10px").attr("transform", "translate(" + (legendWidth - margin.right) + "," + (legendHeight - margin.bottom + legendHeight - margin.top - margin.bottom) + ")");
    };

    this.setRadialGraph_sortType = function(_sortType) {
        if(sortType == _sortType) {
            return ;
        }

        sortType = _sortType;
    };


    this.setRadialGraphMaxDistance = function(_maxDistance) {
        if(maxDistance == _maxDistance) {
            return ;
        }

        maxDistance = _maxDistance;
    };


    this.setRadialGraphSigmaOfGaussianSmooth = function(_sigmaNum) {
        if(sigmaNum == _sigmaNum) {
            return ;
        }

        sigmaNum = _sigmaNum;
    };

    var setRadialGraphSigmaOfGaussianSmooth = setRadialGraphSigmaOfGaussianSmooth;

    var isDataAvaliable = function() {
        if(!rawData || rawData == null || rawData.length == 0) {
            return false;
        }

        return true;
    };

    this.isDataAvailable = isDataAvaliable;

    var clear = function() {
        d3.select("#radial_graph_svg").remove();
    };

    this.clear = clear;

    this.constructRadialGraph = function() {
        clear();
        var _this = this;
        if(!isDataAvaliable()) {
            return ;
        }
        var loyaltySliceNum = 1;    // adjust loyalty

        var marker = null;

        var selected_nid = -1;
        d3.select('radial_graph_svg').remove();
        var radialGraph = d3
            .select(element)
            .append("svg")
            .attr("id", "radial_graph_svg")
            .attr('width',panelWidth)
            .attr('height', panelHeight);

        var radialGraph_g = radialGraph
            .append("g")
            .attr("transform", "translate("+ panelWidth / 2 + "," + panelHeight / 2 + ")");

        var areaType = "persons";

        var nodes = getNodeList();

        var realMaxDistance = d3.max(nodes, function(d) {   // the max distance of data, sometimes we could encode using this
            return d.distance;
        });

        var totalPersonsOfGraph = nodes.reduce(function(preV, curV) {
            return preV + curV.totalPersons;
        }, 0);

        setCid("loyalty" , 1, loyaltySliceNum, nodes);

        var grids = constructGrids();

        gaussianSmooth(grids, loyaltySliceNum, numberOfSlices);
        calculateGridScale(grids, loyaltySliceNum, numberOfSlices);
        drawRadialGraph(grids, loyaltySliceNum, numberOfSlices);

        function getNodeList() {

            var nodes = [];
            for(var i in rawData) {
                var nid = i;
                var node = rawData[nid];
                node.nid = nid;
                if(node['value']!= undefined){
                    for(var j in node.value) {
                        node[j] = node.value[j];
                    }
                }

                node.value = node[areaType];

                node.personsOfHours = [];
                for(var k = 0; k < numberOfSlices; k++){
                    node.personsOfHours[k] =0;
                }
                var inputLen = node['persons'].length;
                var hourLen = numberOfSlices;
                var ratio = hourLen / inputLen;
                var lastStep = ratio;
                for(var k = 0; k < node['persons'].length; k ++){
                    for(var t = 0; t < ratio; t++){
                        node.personsOfHours[k * ratio + t] = node['persons'][k] / ratio;
                    }

                }

                var totalPersons = 0;
                for(var j = 0,jlen =  node.persons.length; j < jlen; j++){
                    totalPersons += node.persons[j]
                }
                node.totalPersons = totalPersons;

                if(node.distance <= 0.4) {    // filter out distance == 0.4
                    continue ;
                }

                nodes.push(node);
            }

            return nodes;
        }

        function setCid(propertyName , total, sliceNum, nodes) {

            var step = total / sliceNum;

            for(var i = 0; i < nodes.length; ++i) {
                var id = 0;
                nodes[i][propertyName+"_id"] = id;
            }
        }

        function constructGrids() {
            var grids = new Array(loyaltySliceNum);
            for (var i = 0; i < loyaltySliceNum; ++i) {
                grids[i] = new Array(numberOfSlices);
                for (var j = 0; j < numberOfSlices; ++j) {
                    grids[i][j] = [];
                    grids[i][j].value = 0;
                }
            }

            for(var i in nodes) {
                var node = nodes[i];
                for(var j in node.persons) {
                    grids[node.loyalty_id][j].value = grids[node.loyalty_id][j].value + node.persons[j];
                }
            }

            return grids;
        }

        function calculateGaussianValue(d, sigma) {
            return Math.exp(-d*d/2/sigma/sigma)/Math.sqrt(2*Math.PI)/sigma;
        }

        function gaussianSmooth(grids, loyaltySliceNum, directionSliceNum) {
            for(var i = 0; i < loyaltySliceNum; ++i) {
                for(var j = 0; j < directionSliceNum; ++j) {
                    var grid = grids[i][j];
                    grid.gaussianValue = 0;

                    for(var k = 0; k < directionSliceNum; ++k) {
                        var _grid = grids[i][k];

                        var d1 = k-j;
                        if(d1 < 0) {
                            d1 = d1 + directionSliceNum;
                        }
                        var d2 = j-k;
                        if(d2 < 0) {
                            d2 = d2 + directionSliceNum;
                        }
                        var dis = Math.min(d1, d2);

                        grid.gaussianValue = grid.gaussianValue + _grid.value * calculateGaussianValue(dis, sigmaNum);
                    }
                }
            }

        }

        function calculateGridScale(grids, loyaltySliceNum, directionSliceNum) {    // scale = sqrt(gaussianValue)
            for(var i = 0; i < loyaltySliceNum; ++i) {
                for(var j = 0; j < directionSliceNum; ++j) {
                    var grid = grids[i][j];
                    grid.scale = Math.sqrt(grid.gaussianValue);
                }
            }
        }

        function drawRadialGraph(grids, loyaltySliceNum, directionSliceNum) {


            var maxScale = 0;
            for(var i = 0; i < loyaltySliceNum; ++i) {
                if (nodes.length == 0) {
                    continue;
                }

                // calculate angles
                var clus = constructClusters(nodes);
                var clusAngles = generateClusAngles(i, clus);

                maxScale = d3.max(clusAngles, function (d) {
                    return d3.max(d, function (_d) {
                        return _d.scaleCeil;
                    })
                });

                // draw treemap
                var roots = [];
                for(var j = 0; j < clus.length; ++j) {
                    var root = {
                        elements: clus[j],
                        edges: clusAngles[j]
                    };

                    constructTree(root, clus[j].timeSlice);
                    roots.push(root);
                }

                for(var j = 0; j < roots.length; ++j) {
                    drawTreemap(roots[j]);
                }
            }
            drawClockDial();

            function constructClusters(nodes) {
                var clusLen = numberOfSectors;

                var clus = [];
                var clusSet = [];   // make sure uniqueness of nodes in one hour sector

                // init clusters
                for(var i = 0; i < clusLen; ++i) {
                    var clu = [];
                    clu.persons = 0;
                    clu.timeSlice = i;

                    clus.push(clu);
                    clusSet.push(d3.set());
                }

                for(var i in nodes) {
                    for(var j=0; j<numberOfSlices; j++) {

                        var _j = Math.floor((j-0) / slicesPerSector);

                        if(nodes[i].personsOfHours[j] > 0) {
                            clus[_j].persons = clus[_j].persons + nodes[i].personsOfHours[j];

                            if(!clusSet[_j].has(i)) {
                                clus[_j].push(nodes[i]);
                                clusSet[_j].add(i);
                            }
                        }
                    }
                }

                generateMinMaxAngleOfClusters(clus);

                return clus;
            }

            function generateMinMaxAngleOfClusters(clus) {
                clus[0].minAngle = 0;
                clus[0].maxAngle = 360;
                if(slicesPerSector<=numberOfSlices) {
                    clus[0].maxAngle = slicesPerSector/numberOfSlices*360;
                }

                for(var i = 1; i < clus.length-1; ++i) {
                    clus[i].minAngle = clus[i-1].maxAngle;
                    clus[i].maxAngle = clus[i].minAngle + slicesPerSector/numberOfSlices*360;
                }
                if(clus.length > 1) {
                    clus[clus.length-1].minAngle = clus[clus.length-2].maxAngle;
                    clus[clus.length-1].maxAngle = 360;
                }
            }

            function generateClusAngles(loyaltyLevel, clus) {
                var clusAngles = [];

                for(var j = 0; j < clus.length; ++j) {
                    var clusAngle = [];
                    clusAngle.startAngle = clus[j].minAngle;
                    clusAngle.endAngle = clus[j].maxAngle;

                    clusAngles.push(clusAngle);
                }

                // If grids are on the range of clusAngle, then simply add them.
                for (var j = 0; j < clus.length; ++j) {
                    transformGridsToCluAngles(loyaltyLevel, clusAngles[j]);
                }

                // head and tail are normally not on a certain grid, so we need to calculate their info
                generateClusAnglesHeadAndTail(clusAngles);

                return clusAngles;
            }

            function transformGridsToCluAngles(loyaltyLevel ,cluAngles) {
                var step = 360 / directionSliceNum;

                cluAngles.length = 0;
                var startAngle = cluAngles.startAngle;
                var endAngle = cluAngles.endAngle;

                var offset = 0;
                if (endAngle <= startAngle) {
                    offset = 360;
                }

                var n = Math.floor((startAngle - step / 2) / step);

                if (!funcService.isInRangeInclude(n * step + step / 2, startAngle, endAngle + offset)) {
                    n = n + 1;
                }

                while (funcService.isInRangeInclude(n * step + step / 2, startAngle, endAngle + offset)) {
                    var _n = n;
                    var angle = n * step + step / 2;
                    if (angle >= 360) {
                        angle = angle - 360;
                        _n = _n - directionSliceNum;
                    }

                    cluAngles.push({
                        angle: angle,
                        scaleFloor: loyaltyLevel - 1 < 0 ? 0 : grids[loyaltyLevel - 1][_n].scale,
                        scaleCeil: grids[i][_n].scale
                    });

                    n = n + 1;
                }
            }

            function generateClusAnglesHeadAndTail(clusAngles) {
                for(var j = 0; j < clus.length; ++j) {
                    var cluAngles = clusAngles[j];

                    var cluAngleHead = generateCluAngle(cluAngles.startAngle);
                    var cluAngleTail = generateCluAngle(cluAngles.endAngle);

                    // cluAngleHead is the head of cluAngles and cluAngleTail is the tail.
                    cluAngles.splice(0, 0, cluAngleHead);
                    cluAngles.push(cluAngleTail);
                }
            }

            function generateCluAngle(gama) {   // calculate CluAngle, which the angle is not on certain grid
                var step = 360 / directionSliceNum;

                var cluAngle = {
                    angle: gama,
                    scaleFloor: 0,
                    scaleCeil: 0
                };

                var _gama = gama-step/2;
                if(_gama<0) {
                    _gama = _gama+360;
                }
                if(_gama >= 360) {
                    _gama = _gama-360;
                }

                var pre_gridIndex = Math.floor(_gama / step);

                if(pre_gridIndex*step == _gama) {
                    cluAngle.scaleFloor = i-1<0?0:grids[i-1][pre_gridIndex].scale;
                    cluAngle.scaleCeil = grids[i][pre_gridIndex].scale;

                } else {
                    var succ_gridIndex = pre_gridIndex+1;

                    var alpha = step/2 + pre_gridIndex*step;
                    var beta = step/2 + succ_gridIndex*step;

                    if(succ_gridIndex >= directionSliceNum) {
                        succ_gridIndex = succ_gridIndex - directionSliceNum;

                        if(beta < alpha) {
                            beta = beta + 360;
                        }
                        if(gama < alpha) {
                            gama = gama + 360;
                        }
                    }

                    cluAngle.scaleFloor = 0;
                    if(i-1>=0) {
                        cluAngle.scaleFloor = getScaleInGivenLine(gama, alpha, grids[i-1][pre_gridIndex].scale, beta, grids[i-1][succ_gridIndex].scale);
                    }
                    cluAngle.scaleCeil = getScaleInGivenLine(gama, alpha, grids[i][pre_gridIndex].scale, beta, grids[i][succ_gridIndex].scale);
                }

                return cluAngle;
            }


            function getScaleInGivenLine(angle, angle1, scale1, angle2, scale2) {

                var radian = angle/180*Math.PI;

                var p1 = [scale1*Math.cos(angle1/180*Math.PI), scale1*Math.sin(angle1/180*Math.PI)];
                var p2 = [scale2*Math.cos(angle2/180*Math.PI), scale2*Math.sin(angle2/180*Math.PI)];

                var scale = 0;

                if(p2[0]-p1[0] != 0) {
                    var k = (p2[1] - p1[1]) / (p2[0] - p1[0]);
                    var b = p1[1] - p1[0]*k;

                    scale = b/(Math.sin(radian)-k*Math.cos(radian));
                } else {

                    scale = p1[0] / Math.cos(radian);
                }

                return scale;
            }

            function getAngleInGivenLine(scale, angle1, scale1, angle2, scale2) {   // precision of acos is too bad, sad~~~
                var e = 1e-6;

                if(Math.abs(scale-scale1) < e) {
                    return angle1;
                }
                if(Math.abs(scale-scale2) < e) {
                    return angle2;
                }

                var p1 = [scale1*Math.cos(angle1/180*Math.PI), scale1*Math.sin(angle1/180*Math.PI)];
                var p2 = [scale2*Math.cos(angle2/180*Math.PI), scale2*Math.sin(angle2/180*Math.PI)];

                if(p2[0]-p1[0] != 0) {
                    var k = (p2[1] - p1[1]) / (p2[0] - p1[0]);
                    var b = p1[1] - p1[0]*k;

                    var delta2 = b*b*k*k-(k*k+1)*(b*b-scale*scale);
                    var delta = Math.sqrt(delta2);

                    var cosAngle_1 = (-b*k+delta)/(k*k+1)/scale;
                    var sinAngle_1 = (k*scale*cosAngle_1+b)/scale;
                    var angle_1 = Math.acos(cosAngle_1);

                    if(Math.abs(Math.sin(angle_1) - sinAngle_1) > e) {
                        angle_1 = 2*Math.PI - angle_1;
                    }

                    angle_1 = angle_1/Math.PI*180;
                    if(angle_1<0) {
                        angle_1 = angle_1 + 360;
                    }
                    if(angle_1>=360) {
                        angle_1 = angle_1 - 360;
                    }

                    if(isInclude(angle_1, angle1, angle2)) {
                        return angle_1;
                    }

                    var cosAngle_2 = (-b*k-delta)/(k*k+1)/scale;
                    var sinAngle_2 = (k*scale*cosAngle_2+b)/scale;
                    var angle_2 = Math.acos(cosAngle_2);

                    if(Math.abs(Math.sin(angle_2) - sinAngle_2) > e) {
                        angle_2 = 2*Math.PI - angle_2;
                    }

                    angle_2 = angle_2/Math.PI*180;
                    if(angle_2<0) {
                        angle_2 = angle_2 + 360;
                    }
                    if(angle_2>=360) {
                        angle_2 = angle_2 - 360;
                    }

                    if(isInclude(angle_2, angle1, angle2)) {
                        return angle_2;
                    }

                } else {
                    var cosAngle = p1[0] / scale;
                    var angle = Math.acos(cosAngle_1);
                    angle = angle/Math.PI*180;
                    if(isInclude(angle, angle1, angle2)) {
                        return angle;
                    } else {
                        angle = angle + 180;
                        if(isInclude(angle, angle1, angle2)) {
                            return angle;
                        }
                    }
                }

                function isInclude(angle, angle1, angle2) {
                    var delta = angle-angle1;
                    if(delta < 0) {
                        delta = delta + 360;
                    }
                    var _delta = angle2-angle1;
                    if(_delta < 0) {
                        _delta = _delta + 360;
                    }

                    if(_delta >= delta) {
                        return true;
                    }

                    return false;
                }

                console.log("getAngleInGivenLine is Null !");
                return null;
            }

            function constructTree(node, timeSlice) {
                if(node.elements.length <= 1) {
                    return ;
                }

                var cutResult_vertical = verticalCut(node, timeSlice);

                var cutResult_horozontal = horizontalCut(node, timeSlice);

                node.children = cutResult_vertical;
                if(cutResult_horozontal != null) {
                    var L_W_ratio_vertical = calculateLenthWidthRatioOfCutResult(cutResult_vertical);
                    var L_W_ratio_horizontal = calculateLenthWidthRatioOfCutResult(cutResult_horozontal);

                    if(L_W_ratio_horizontal <= L_W_ratio_vertical) {
                        node.children = cutResult_horozontal;
                    }
                }

                constructTree(node.children.left, timeSlice);
                constructTree(node.children.right, timeSlice);
            }

            function calculateLenthWidthRatioOfCutResult(cutResult) {
                var lwRatioLeft = calculateLenthWidthRatioOfNode(cutResult.left);
                var lwRatioRight = calculateLenthWidthRatioOfNode(cutResult.right);

                return (lwRatioLeft+lwRatioRight)/2;
            }

            function calculateLenthWidthRatioOfNode(node) {
                var edges = node.edges;

                var totalWidth = 0;
                for(var i = 0; i < edges.length; ++i) {
                    var w1 = scaleToLength(edges[i].scaleFloor);
                    var w2 = scaleToLength(edges[i].scaleCeil);

                    totalWidth = totalWidth + w2 - w1;
                }
                var width = totalWidth / edges.length;

                var totalUpLenth = 0;
                var totalDownLenth = 0;
                for(var i = 1; i < edges.length; ++i) {
                    var pre_up_p = getPoint_angle(edges[i-1].angle, scaleToLength(edges[i-1].scaleCeil));
                    var up_p = getPoint_angle(edges[i].angle, scaleToLength(edges[i].scaleCeil));
                    totalUpLenth = totalUpLenth + funcService.getDistance(pre_up_p, up_p);

                    var pre_down_p = getPoint_angle(edges[i-1].angle, scaleToLength(edges[i-1].scaleFloor));
                    var down_p = getPoint_angle(edges[i].angle, scaleToLength(edges[i].scaleFloor));
                    totalDownLenth = totalDownLenth + funcService.getDistance(pre_down_p, down_p);
                }
                var length = (totalUpLenth+totalDownLenth)/2;
                var ratio = 1e9;
                if(width > 0) {
                    ratio = length / width;
                }
                if(ratio <= 0) {
                    ratio = 1e9;
                }
                if(ratio < 1) {
                    ratio = 1 / ratio;
                }

                return ratio;
            }

            function verticalCut(node, timeSlice) {
                return cut(node, sortType, "angle", timeSlice);
            }

            function horizontalCut(node, timeSlice) {
                return cut(node, sortType, "scale", timeSlice);
            }

            function cut(node, elePropertyType, edgePropertyType, timeSlice) {

                var elements = node.elements;
                var edges = funcService.objectClone(node.edges);

                elements.sort(function(a, b) {
                    if(elePropertyType == "distance") {
                        return b[elePropertyType] - a[elePropertyType];
                    } else {
                        return a[elePropertyType] - b[elePropertyType];
                    }
                });

                var totalPersons = 0;
                for(var i = 0; i < elements.length; ++i) {
                    totalPersons = totalPersons + getPersonsOfTimeslice(i, timeSlice);
                }

                var accuPersons = 0;
                var index = -1;
                for(var i = 0; i < elements.length; ++i) {
                    if(accuPersons+getPersonsOfTimeslice(i, timeSlice) > totalPersons/2) {
                        break ;
                    } else {
                        accuPersons = accuPersons + getPersonsOfTimeslice(i, timeSlice);
                        index = i;
                    }
                }
                if(index == -1) {
                    index = 0;
                    accuPersons = accuPersons + getPersonsOfTimeslice(0, timeSlice);
                }

                function getPersonsOfTimeslice(eleID ,timeSlice) {
                    var persons = 0;

                    var timeSliceEnd = Math.min(numberOfSlices, (timeSlice+1)*slicesPerSector-1);

                    for(var j = timeSlice*slicesPerSector; j <= timeSliceEnd; ++j) {
                        persons = persons + elements[eleID].personsOfHours[j];
                    }

                    return persons;
                }

                var ratio = accuPersons/totalPersons;
                var bisectResult = bisect(edges, ratio, edgePropertyType);
                if(bisectResult == null) {
                    return null;
                }

                var leftChild = {
                    elements: [],
                    edges: []
                };
                var rightChild = {
                    elements: [],
                    edges: []
                };

                for (var i = 0; i <= index; ++i) {
                    leftChild.elements.push(elements[i]);
                }
                for (var i = index + 1; i < node.elements.length; ++i) {
                    rightChild.elements.push(elements[i]);
                }

                if(edgePropertyType == "angle") {
                    edges = node.edges;

                    leftChild.edges = calculateLeftEdges(edges, bisectResult.edgeIndex, bisectResult.edge);
                    rightChild.edges = calculateRightEdges(edges, bisectResult.edgeIndex, bisectResult.edge);
                }

                if(edgePropertyType == "scale") {
                    edges = node.edges;

                    leftChild.edges = calculateUpEdges(edges, bisectResult.scale, bisectResult.property, bisectResult.startIndex, bisectResult.endIndex);
                    rightChild.edges = calculateDownEdges(edges, bisectResult.scale, bisectResult.property, bisectResult.startIndex, bisectResult.endIndex);
                }

                return {
                    left: leftChild,
                    right: rightChild
                };

                function calculateLeftEdges(edges, bisectEdgeIndex, edge) {
                    var result = [];

                    for (var i = 0; i <= bisectEdgeIndex; ++i) {
                        result.push(edges[i]);
                    }
                    result.push(edge);

                    result.startAngle = edges.startAngle;
                    result.endAngle = edge.angle;

                    return result;
                }

                function calculateRightEdges(edges, bisectEdgeIndex, edge) {
                    var result = [];

                    result.push(edge);
                    for (var i = bisectEdgeIndex + 1; i < edges.length; ++i) {
                        result.push(edges[i]);
                    }

                    result.startAngle = edge.angle;
                    result.endAngle = edges.endAngle;

                    return result;
                }

                function calculateDownEdges(edges, scale, property, startIndex, endIndex) {
                    var result = [];
                    result.startAngle = edges.startAngle;
                    result.endAngle = edges.endAngle;

                    if(property == "scaleCeil") {
                        for(var i =0; i<startIndex; ++i) {
                            result.push(edges[i]);
                        }
                    }

                    if(startIndex != 0) {
                        var startEdge = {
                            angle: 0,
                            scaleFloor: scale,
                            scaleCeil: scale
                        };

                        var angle = getAngleInGivenLine(scale, edges[startIndex-1].angle, edges[startIndex-1][property], edges[startIndex].angle, edges[startIndex][property]);
                        startEdge.angle = angle;

                        if(property == "scaleCeil") {
                            startEdge.scaleFloor = getScaleInGivenLine(angle, edges[startIndex-1].angle, edges[startIndex-1]["scaleFloor"], edges[startIndex].angle, edges[startIndex]["scaleFloor"]);
                        } else {
                            result.startAngle = angle;
                        }

                        result.push(startEdge);
                    }

                    for(var i = startIndex; i <= endIndex; ++i) {
                        var edge = {
                            angle: edges[i].angle,
                            scaleFloor: edges[i].scaleFloor,
                            scaleCeil: scale
                        };

                        result.push(edge);
                    }

                    if(endIndex != edges.length-1) {
                        var endEdge = {
                            angle: 0,
                            scaleFloor: scale,
                            scaleCeil: scale
                        };


                        var angle = getAngleInGivenLine(scale, edges[endIndex].angle, edges[endIndex][property], edges[endIndex+1].angle, edges[endIndex+1][property]);
                        endEdge.angle = angle;

                        if(property == "scaleCeil") {
                            endEdge.scaleFloor = getScaleInGivenLine(angle, edges[endIndex].angle, edges[endIndex]["scaleFloor"], edges[endIndex+1].angle, edges[endIndex+1]["scaleFloor"]);
                        }  else {
                            result.endAngle = angle;
                        }

                        result.push(endEdge);
                    }

                    if(property == "scaleCeil") {
                        for(var i = endIndex+1; i<edges.length; ++i) {
                            result.push(edges[i]);
                        }
                    }


                    return result;
                }

                function calculateUpEdges(edges, scale, property, startIndex, endIndex) {
                    var result = [];
                    result.startAngle = edges.startAngle;
                    result.endAngle = edges.endAngle;

                    if(property == "scaleFloor") {
                        for(var i =0; i<startIndex; ++i) {
                            result.push(edges[i]);
                        }
                    }

                    if(startIndex != 0) {
                        var startEdge = {
                            angle: 0,
                            scaleFloor: scale,
                            scaleCeil: scale
                        };

                        var angle = getAngleInGivenLine(scale, edges[startIndex-1].angle, edges[startIndex-1][property], edges[startIndex].angle, edges[startIndex][property]);
                        startEdge.angle = angle;

                        if(property == "scaleFloor") {
                            startEdge.scaleFloor = getScaleInGivenLine(angle, edges[startIndex-1].angle, edges[startIndex-1]["scaleCeil"], edges[startIndex].angle, edges[startIndex]["scaleCeil"]);
                        } else {
                            result.startAngle = angle;
                        }

                        result.push(startEdge);
                    }

                    for(var i = startIndex; i <= endIndex; ++i) {
                        var edge = {
                            angle: edges[i].angle,
                            scaleFloor: scale,
                            scaleCeil: edges[i].scaleCeil
                        };

                        result.push(edge);
                    }

                    if(endIndex != edges.length-1) {
                        var endEdge = {
                            angle: 0,
                            scaleFloor: scale,
                            scaleCeil: scale
                        };

                        var angle = getAngleInGivenLine(scale, edges[endIndex].angle, edges[endIndex][property], edges[endIndex+1].angle, edges[endIndex+1][property]);
                        endEdge.angle = angle;

                        if(property == "scaleFloor") {
                            endEdge.scaleFloor = getScaleInGivenLine(angle, edges[endIndex].angle, edges[endIndex]["scaleCeil"], edges[endIndex+1].angle, edges[endIndex+1]["scaleCeil"]);
                        }  else {
                            result.endAngle = angle;
                        }

                        result.push(endEdge);
                    }

                    if(property == "scaleFloor") {
                        for(var i = endIndex+1; i<edges.length; ++i) {
                            result.push(edges[i]);
                        }
                    }

                    return result;
                }

                function bisect(edges, ratio, edgePropertyType) {

                    var polygon = constructPolygonOfEdges(edges);
                    var polygonFloor = constructPolygonOfEdgesOfFloor(edges);
                    var polygonCeil = constructPolygonOfEdgesOfCeil(edges);
                    var isConcave = {
                        general: funcService.isConcave(polygon),
                        floor: funcService.isConcave(polygonFloor),
                        ceil: funcService.isConcave(polygonCeil)
                    };
//                        isConcave = true;   // set true to avoid convex case

                    if(edgePropertyType == "scale") {
                        ratio = 1 - ratio;
                    }

                    var min_max = getMinMax(edges, edgePropertyType, isConcave);
                    var left = min_max.min;
                    var right = min_max.max;

                    if(left > right) {
                        return null;
                    }

                    var totalArea = funcService.calculateArea(polygon);

                    var bisectResult_left = calculateBisectResult(edges, left, totalArea, edgePropertyType);
                    var bisectResult_right = calculateBisectResult(edges, right, totalArea, edgePropertyType);

                    if(isFound(bisectResult_left, ratio)) {
                        return bisectResult_left;
                    }

                    if(isFound(bisectResult_right, ratio)) {
                        return bisectResult_right;
                    }

                    if((ratio-bisectResult_left.ratio)*(ratio-bisectResult_right.ratio) > 0) {
                        return null;
                    }

                    do {
                        var m = (left+right)/2;

                        var biserctResult = calculateBisectResult(edges, m, totalArea, edgePropertyType);

                        if(isFound(biserctResult, ratio)) {
                            return biserctResult;
                        }

                        if(biserctResult.ratio < ratio) {
                            left = m;
                        } else {
                            right = m;
                        }

                    } while(true);


                    function getMinMax(edges, edgePropertyType, isConcave) {

                        var min = 1e9;
                        var max = -1e9;

                        var edgeP_1 = edgePropertyType;
                        var edgeP_2 = edgePropertyType;

                        if(edgePropertyType == "scale") {
                            if(isConcave.floor) {
                                min = -1e9;
                            }
                            if(isConcave.ceil) {
                                max = 1e9;
                            }
                        }

                        if(edgePropertyType == "scale") {
                            edgeP_1 = edgePropertyType + "Floor";
                            edgeP_2 = edgePropertyType + "Ceil";
                        }

                        for(var i = 0; i < edges.length; ++i) {
                            if(edgePropertyType == "scale" && isConcave.floor) {
                                if (edges[i][edgeP_1] > min) {
                                    min = edges[i][edgeP_1];
                                }
                            } else {
                                if (edges[i][edgeP_1] < min) {
                                    min = edges[i][edgeP_1];
                                }
                            }

                            if(edgePropertyType == "scale" && isConcave.ceil) {
                                if(edges[i][edgeP_2] < max) {
                                    max = edges[i][edgeP_2];
                                }
                            } else {
                                if(edges[i][edgeP_2] > max) {
                                    max = edges[i][edgeP_2];
                                }
                            }
                        }

                        return {
                            min: min,
                            max: max
                        }
                    }

                    function calculateBisectResult(edges, m, totalArea, edgePropertyType) {

                        if(edgePropertyType == "angle") {
                            return calculateBisectResult_vertical(edges, m, totalArea);
                        }

                        if(edgePropertyType == "scale") {
                            return calculateBisectResult_horizontal(edges, m, totalArea);
                        }
                    }

                    function calculateBisectResult_vertical(edges, m, totalArea) {
                        var edge = {
                            angle: m,
                            scaleFloor: 0,
                            scaleCeil: 0
                        };
                        if(m > 360) {
                            edge.angle = edge.angle - 360;
                        }

                        var index = -1;
                        for(var i = 0; i < edges.length-1; ++i) {
                            index = i;

                            if(edges[i].angle<=m && edges[i+1].angle>=m) {
                                break;
                            }
                        }

                        var alpha = edges[index].angle;
                        var beta = edges[index+1].angle;
                        var gama = m;

                        edge.scaleFloor = getScaleInGivenLine(gama, alpha, edges[index].scaleFloor, beta, edges[index+1].scaleFloor);
                        edge.scaleCeil = getScaleInGivenLine(gama, alpha, edges[index].scaleCeil, beta, edges[index+1].scaleCeil);


                        var leftEdges = calculateLeftEdges(edges, index, edge);
                        var polygon = constructPolygonOfEdges(leftEdges);

                        var leftArea = funcService.calculateArea(polygon);

                        var _ratio = leftArea/totalArea;

                        return {
                            ratio: _ratio,
                            edge: edge,
                            edgeIndex: index
                        }
                    }

                    function calculateBisectResult_horizontal(edges, m, totalArea) {
                        var scale = m;

                        var property = "scaleCeil";
                        if(m < edges[0].scaleFloor || m < edges[edges.length-1].scaleFloor) {
                            property = "scaleFloor";
                        }

                        for(var startIndex = 0; startIndex < edges.length; ++startIndex) {
                            if(edges[startIndex].scaleFloor <= m && edges[startIndex].scaleCeil >=m) {
                                break ;
                            }
                        }

                        for(var endIndex = edges.length-1; endIndex >= 0; --endIndex) {
                            if(edges[endIndex].scaleFloor <= m && edges[endIndex].scaleCeil >=m) {
                                break ;
                            }
                        }

                        var downEdges = calculateDownEdges(edges, scale, property, startIndex, endIndex);
                        var polygon = constructPolygonOfEdges(downEdges);
                        var downArea = funcService.calculateArea(polygon);

                        var _ratio = downArea/totalArea;

                        return {
                            ratio: _ratio,
                            scale: scale,
                            property: property,
                            startIndex: startIndex,
                            endIndex: endIndex
                        }
                    }

                    function isFound(biserctResult, ratio) {
                        var e = 1e-6;
                        if(Math.abs(biserctResult.ratio-ratio)<e) {
                            return true;
                        }

                        return false;
                    }
                }
            }

            function drawTreemap(node) {

                var polygon = constructPolygonOfEdges(node.edges);

                var fill = "none";
                var opa = 1;

                if(node.elements.length == 1) {
                    fill = "green";
                    opa = node.elements[0].distance;
                    var colorScale = d3.scale.linear()
                        .range([startColor, stopColor]) // or use hex values
                        .domain([0.2, maxDistance]);

                    var fillColor = d3.scale.linear()
                        .range([colorScale(0.2), colorScale(0.05 * maxDistance), colorScale(0.1 * maxDistance), colorScale(0.5 * maxDistance), colorScale(0.7 * maxDistance), colorScale(0.9 * maxDistance), colorScale(maxDistance)])
                        .domain([0.2, 0.05 * maxDistance, 0.1 * maxDistance, 0.5 * maxDistance, 0.7 * maxDistance, 0.9 * maxDistance, maxDistance]);

                    var nid = node.elements[0].nid;

                    //var nodeData = mapService.data.map.source[nid];

                    var _marker = null;

                    radialGraph_g
                        .append("path")
                        .attr("class", "treemap_node_"+nid)
                        .attr("d", funcService.polygon(polygon))
                        .attr("fill", fillColor((opa)))
                        .attr("fill-opacity", 1)
                        .attr("stroke", "black")
                        .attr("stroke-width", 0.3)
                        .attr("stroke-opacity", 0.8)
                        .on("mouseover", function() {
                            d3.selectAll(".treemap_node_"+nid)
                                .attr("stroke", selectBoundaryColor)
                                .attr("stroke-width", 2.5)
                                .attr("stroke-opacity", 0.7);
                            // ??????????

                            if(_this.runMouseOver) _this.runMouseOver(nid);
                            //if(selected_nid == -1) {
                            //    mapService.map.source.setView([nodeData.gps.lat, nodeData.gps.lng]);
                            //}
                            //
                            //if(mapService.data.d3Overlay.sel.source) {
                            //    mapService.data.d3Overlay.sel.source
                            //        .selectAll("circle")
                            //        .attr("display", "none");
                            //}
                            //
                            //_marker = mapService.map.source.addGreenMarker(nodeData.gps.lat, nodeData.gps.lng);
                        })
                        .on("mouseout", function() {
                            if(_this.runMouseOut) _this.runMouseOut(nid);
                            //if(_marker != null) {
                            //    mapService.map.source.removeLayer(_marker);
                            //    _marker = null;
                            //}


                            if(selected_nid != nid) {
                                d3.selectAll(".treemap_node_" + nid)
                                    .attr("stroke", "black")
                                    .attr("stroke-width", 1)
                                    .attr("stroke-opacity", 0.3);
                            }
                        })
                        .on("click", function() {
                            if(_this.runClick) _this.runClick(nid);
                            if(selected_nid != -1) {
                                d3.selectAll(".treemap_node_"+selected_nid)
                                    .attr("stroke", "black")
                                    .attr("stroke-width", 1)
                                    .attr("stroke-opacity", 0.3);
                            }

                            if(selected_nid == nid) {
                                selected_nid = -1;

                                return;
                            }

                            selected_nid = nid;
                            marker = _marker;
                        });
                }

                if(node.elements.length > 1) {
                    drawTreemap(node.children.left);
                    drawTreemap(node.children.right);
                }
                _this.drawLegend();
            }

            function constructPolygonOfEdges(edges) {
                var polygon = [];
                for(var i = 0; i < edges.length; ++i) {
                    polygon.push(getPoint_angle(edges[i].angle, scaleToLength(edges[i].scaleFloor)));
                }
                for(var i = edges.length-1; i >= 0; --i) {
                    polygon.push(getPoint_angle(edges[i].angle, scaleToLength(edges[i].scaleCeil)));
                }

                return polygon;
            }

            function constructPolygonOfEdgesOfFloor(edges) {
                var polygon = [];
                for(var i = 0; i < edges.length; ++i) {
                    polygon.push(getPoint_angle(edges[i].angle, scaleToLength(edges[i].scaleFloor)));
                }

                return polygon;
            }

            function constructPolygonOfEdgesOfCeil(edges) {
                var polygon = [];
                for(var i = edges.length-1; i >= 0; --i) {
                    polygon.push(getPoint_angle(edges[i].angle, scaleToLength(edges[i].scaleCeil)));
                }

                return polygon;
            }

            function scaleToLength(scale) {
                var len = 0;
                if(maxScale > 0) {
                    len = scale / maxScale * maxLength;
                }

                return len;
            }

            function getPoint_angle(_angle, len) {
                var angle = _angle - 90;

                var radian = angle/180*Math.PI;

                var point = [len*Math.cos(radian), len*Math.sin(radian)];
                return point;
            }

            function drawClockDial() {
                var radius = scaleToLength(maxScale) + 5;
                var outer_circle = radialGraph_g.append("circle")
                    .attr("r", function () {
                        return radius;
                    })
                    .attr("cx", 0)
                    .attr("cy", 0)
                    .attr("fill", "none")
                    .attr("stroke", "black")
                    .attr("stroke-width", 1)
                    .attr("stroke-opacity", 1);

                var outer_circle2 = radialGraph_g.append("circle")
                    .attr("r", function () {
                        return radius + 7;
                    })
                    .attr("cx", 0)
                    .attr("cy", 0)
                    .attr("fill", "none")
                    .attr("stroke", borderColor)
                    .attr("stroke-width", 3)
                    .attr("stroke-opacity", 1);

                var step = 360 * slicesPerSector / numberOfSlices;
                var i = 0;
                while (i * slicesPerSector <= numberOfSlices) {
                    var point = getPoint_angle(step * i, radius);
                    radialGraph_g.append("line")
                        .attr("x1", 0)
                        .attr("y1", 0)
                        .attr("x2", point[0])
                        .attr("y2", point[1])
                        .attr("stroke", "#f46d43")
                        .attr("stroke-width", 2)
                        .attr("stroke-opacity", 0.8)
                        .style("stroke-dasharray", 3);

                    point = getPoint_angle(step * i, radius + 22);
                    radialGraph_g.append("text")
                        .attr("transform", "translate(" + (point[0] - 6) + "," + (point[1] + 6) + ")")
                        .text(function () {
                            if (i==numberOfSectors)
                                return "";
                            return textArray==undefined?i*slicesPerSector:textArray[i];
                        })
                        .style("fill",textColor);

                    i = i + 1;
                }

                radialGraph_g.append("text")
                    .text("Visitors: " + totalPersonsOfGraph)
                    .style("stroke",textColor)
                    .style("fill",textColor)
                    .attr("transform", "translate(100, -180)");
            }
        }
    };


    var funcService = {
        objectClone: objectClone,
        getCoordinateVector: getCoordinateVector,
        getDistance: getDistance,
        getDirectionRadius: getDirectionRadius,
        swap: swap,
        polygon: polygon,
        line: line,
        getCenterPoint: getCenterPoint,
        isInRangeInclude: isInRangeInclude,
        calculateArea: calculateArea,
        isConcave: isConcave,
        crossMulti: crossMulti,
        getPropertyNum: getPropertyNum
    };
    function objectClone (sObj) {
        if (typeof sObj !== "object") {
            return sObj;
        }

        var s = {};
        if (sObj.constructor == Array) {
            s = [];
        }

        for (var i in sObj) {
            s[i] = objectClone(sObj[i]);
        }

        return s;
    }

    // get coordinate vector
    function getCoordinateVector(node) {
        if (node.hasOwnProperty('X') && node.hasOwnProperty('Y')) {
            return [node.X, node.Y];
        }
        else if (node.hasOwnProperty('x') && node.hasOwnProperty('y')) {
            return [node.x, node.y];
        }
        else if (node instanceof Array && node instanceof Array) {
            return node;
        }

        return node;
    }

    // get euclidean distance
    function getDistance(p, q) {
        var dis = 0;
        p = getCoordinateVector(p);
        q = getCoordinateVector(q);

        if (p instanceof Array && q instanceof Array) {
            dis = Math.sqrt(Math.pow(p[0] - q[0], 2) + Math.pow(p[1] - q[1], 2));
        }

        return dis;
    }

    function getDirectionRadius(source, dest) {
        source = getCoordinateVector(source);
        dest = getCoordinateVector(dest);

        var thita = Math.atan2(source[1]-dest[1], source[0]-dest[0]);

        return thita;
    }

    // swap two variables
    function swap(a, b) {
        var c = a;
        a = b;
        b = c;
    }

    // generate polygon path
    function polygon(d) {
        if (d.length == 0) {
            return "";
        }
        return 'M' + d.join('L') + 'Z';
    }

    // generate line path
    function line(d) {
        return 'M' + d.join('L');
    }

    // get center point
    function getCenterPoint(p1, p2) {
        return [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];
    }

    // is include in the range
    function isInRangeInclude(value, min, max) {
        return (value >= min) && (value <= max);
    }

    // calculate area of polygon
    function calculateArea(polygon) {
        var area = 0;
        var n = polygon.length;

        for (var i = 0; i < polygon.length; ++i) {
            var i2 = i;
            var i3 = i + 1;
            if (i3 >= n) {
                i3 = i3 - n;
            }
            var p2 = [polygon[i2][0], -1 * polygon[i2][1]];
            var p3 = [polygon[i3][0], -1 * polygon[i3][1]];

            var _area = p2[0] * p3[1] - p3[0] * p2[1];
            _area = _area * 0.5;

            area = area + _area;
        }

        return area;
    }

    // is polygon concave
    function isConcave(polygon) {

        var n = polygon.length;

        var flag = false;

        for (var i = 0; i < n; ++i) {
            var i1 = i - 1;
            if (i1 < 0) {
                i1 = i1 + n;
            }
            var i2 = i;
            var i3 = i + 1;
            if (i3 >= n) {
                i3 = i3 - n;
            }
            var p1 = [polygon[i1][0], -1 * polygon[i1][1]];
            var p2 = [polygon[i2][0], -1 * polygon[i2][1]];
            var p3 = [polygon[i3][0], -1 * polygon[i3][1]];

            var result = crossMulti(p1, p2, p3);
            if (result < 0) {
                flag = true;
            }
        }

        return flag;
    }

    // cross multiply
    function crossMulti(p1, p2, p3) {
        return (p1[0]*p2[1]+p2[0]*p3[1]+p3[0]*p1[1]) - (p1[0]*p3[1]+p2[0]*p1[1]+p3[0]*p2[1]);
    }

    // get number of properties in one object
    function getPropertyNum(obj) {
        var count = 0;
        for(var i in obj) {
            ++count;
        }
        return count;
    }

}
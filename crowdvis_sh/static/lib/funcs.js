/**
 * Created by Jiayi Xu on 20/1/15.
 */

// Include the tools that may applied in different places
function setFuncs(service) {

	//Clone the object
    service.funcs.objectClone = function(sObj){

		// Type 1: not an object - return it directly
	    if(typeof sObj !== "object"){
	        return sObj;
	    }
		
		// How about the other types??
	    var s = {};
		
		// Type 2: an array
	    if(sObj.constructor == Array){
	    	s = [];
	    }
	
	    for(var i in sObj){
	    	s[i] = service.funcs.objectClone(sObj[i]);
	   	}
	   	
	   	// Default: return {}
	
	    return s;

    };

	// Calculate and return the distance if p, q objects have x\y attribute or they are arrays of coordinats; return 0 otherwise
    service.funcs.getDistance = function getDistance(p, q) {
        var dis = 0;
        if(p.hasOwnProperty('X') && p.hasOwnProperty('Y') && q.hasOwnProperty('X') && q.hasOwnProperty('Y')) {
            dis = Math.sqrt(Math.pow(p.X- q.X, 2) + Math.pow(p.Y - q.Y, 2));
        } else
        if(p.hasOwnProperty('x') && p.hasOwnProperty('y') && q.hasOwnProperty('x') && q.hasOwnProperty('y')) {
            dis = Math.sqrt(Math.pow(p.x- q.x, 2) + Math.pow(p.y - q.y, 2));
        } else
        if(p instanceof Array && q instanceof Array) {
            dis = Math.sqrt(Math.pow(p[0]- q[0], 2) + Math.pow(p[1] - q[1], 2));
        }
        
        return dis;
    };

    service.funcs.adjustWeightsAccordingToAdditiveVoronoi = function adjustWeightsAccordingToAdditiveVoronoi(nodes, weights) {
        var nodeNum = nodes.length;
        var maxRatio = 0;

        for(var i = 0; i < nodeNum; ++i) {
            for(var j = i+1; j < nodeNum; ++j) {
                var dis = service.funcs.getDistance(nodes[i], nodes[j]);
                var ratio = (weights[i] + weights[j]) / dis;
                if(ratio > maxRatio) {
                    maxRatio = ratio;
                }
            }
        }

        if(maxRatio > 0) {
            for(var i = 0; i < nodeNum; ++i) {
                weights[i] = weights[i] / maxRatio;
            }
        }
    };

	// Simply swap a & b
    service.funcs.swap = function swap(a, b) {
        var c = a;
        a = b;
        b = c;
    };

	// ?
    service.funcs.polygon = function polygon(d) {
        return 'M' + d.join('L') + 'Z';
    };

	// Given two points (array), calculate the center points
    service.funcs.getCenterPoint = function getCenterPoint(p1, p2) {
        return [(p1[0]+p2[0])/2, (p1[1]+p2[1])/2];
    }
}
/*
 (c) 2014, Vladimir Agafonkin
 Leaflet.heat, a tiny and fast heatmap plugin for Leaflet.
 https://github.com/Leaflet/Leaflet.heat
*/

// Map zoom value to scale; choose 9 as pivot
var zoomMap = [500,250,150,70,35,15,10,4,2,1,0.5,0.25,0.15,0.07,0.035,0.015,8e-3,4e-3,2e-3,1e-3];

(function () { 'use strict';

function simpleheat(canvas) {
    // jshint newcap: false, validthis: true
    if (!(this instanceof simpleheat)) { return new simpleheat(canvas); }
	// Take either id or HTML Object
    this._canvas = canvas = typeof canvas === 'string' ? document.getElementById(canvas) : canvas;

    this._ctx = canvas.getContext('2d');
    this._width = canvas.width;
    this._height = canvas.height;

    this._max = 1;
    this._data = [];
}

simpleheat.prototype = {
	blur: 20,
    
    radius: 25,
  	
  	opacity: 1,
  	
  	grad: {
        0.4: 'blue',
        0.6: 'cyan',
        0.7: 'lime',
        0.8: 'yellow',
        1.0: 'red'
    },
    
    setOpacity: function (opacity) {
    	this.opacity = opacity;
    	return this;
    },

    data: function (data) {
        this._data = data;
        return this;
    },

    max: function (max) {
        this._max = max;
        return this;
    },

    add: function (point) {
        this._data.push(point);
        return this;
    },

    clear: function () {
        this._data = [];
        return this;
    },

    circle: function (r, blur) {
        blur = blur === undefined ? 20 : blur;
        // create a grayscale blurred circle image that we'll use for drawing points
        var circleObj = this._circle = document.createElement('canvas'),
            ctx = circleObj.getContext('2d'),
            r2 = this._r = r + blur;

        circleObj.width = circleObj.height = r2 * 2;

        ctx.shadowOffsetX = ctx.shadowOffsetY = 1000;
        ctx.shadowBlur = blur;
        ctx.shadowColor = 'black';

        ctx.beginPath();
        ctx.arc(r2 - 1000, r2 - 1000, r, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fill();

        return this;
    },

    gradient: function (grad) {
        // create a 256x1 gradient that we'll use to turn a grayscale heatmap into a colored one
        var canvas = document.createElement('canvas'),
            ctx = canvas.getContext('2d'),
            gradient = ctx.createLinearGradient(0, 0, 0, 256);

        canvas.width = 1;
        canvas.height = 256;

        for (var i in grad) {
            gradient.addColorStop(i, grad[i]);
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1, 256);

        this._grad = ctx.getImageData(0, 0, 1, 256).data;

        return this;
    },

	updateCircle: function() {
		this.circle(this._r, this.blur);
	},
	
    draw: function (minOpacity) {
    	
        if (!this._circle) {
            this.circle(this._r);
        }
        else {
        	this.updateCircle(this._r,this.blur);
        }
        if (!this._grad) {
            this.gradient(this.grad);
        }

        var ctx = this._ctx;

        ctx.clearRect(0, 0, this._width, this._height);

        // draw a grayscale heatmap by putting a blurred circle at each data point
        for (var i = 0, len = this._data.length, p; i < len; i++) {
            p = this._data[i];

            ctx.globalAlpha = Math.max(p[2] / this._max, minOpacity === undefined ? 0.05 : minOpacity);
            ctx.drawImage(this._circle, p[0] - this._r, p[1] - this._r);
        }

        // colorize the heatmap, using opacity value of each pixel to get the right color from our gradient
        var colored = ctx.getImageData(0, 0, this._width, this._height);
        this._colorize(colored.data, this._grad);
        ctx.putImageData(colored, 0, 0);
        
        return this;
    },

    _colorize: function (pixels, gradient) {
        for (var i = 3, len = pixels.length, j; i < len; i += 4) {
            j = pixels[i] * 4; // get gradient color from opacity value

            if (j) {
                pixels[i - 3] = gradient[j];
                pixels[i - 2] = gradient[j + 1];
                pixels[i - 1] = gradient[j + 2];
                // Implement the opacity value limit
                pixels[i] = Math.min(200*this.opacity,2*pixels[i]);
            }
            
        }
    }
};

window.simpleheat = simpleheat;

})();


/*
 * Definiation of HeatLayer
 * 
 * 
 */

L.HeatLayer = (L.Layer ? L.Layer : L.Class).extend({

	/*
	 * options:{
	 * 		minOpacity,maxZoom,max,radius,opacity,grad,heatlevel,blur,max_radius,min_radius,cellNum
	 * }
	 * 	
	 */
	options:{
		max_radius: 60,
		min_radius: 5,
		cellNum: 1,
        density: 1
	},
	
	//set data points and layer options
    initialize: function (latlngs, options) {
        this._latlngs = latlngs;
        L.setOptions(this, options);
        //if (options.radius)
        	//this.radiuPerCell = options.radius/(this.cellNum*this.cellNum);
        return this;
    },
	
	//modify data and options
	setOpacity: function (opacity) {
		this._heat.setOpacity(opacity);
		return this.redraw();
	},
	
    setLatLngs: function (latlngs) {
        this._latlngs = latlngs;
        return this.redraw();
    },

    addLatLng: function (latlng) {
        this._latlngs.push(latlng);
        return this.redraw();
    },

    setOptions: function (options) {
        L.setOptions(this, options);
        
        if (this._heat) {
            this._updateOptions();
        }
        return this.redraw();
    },
    
    // redraw the heatmap on request
    redraw: function () {
        if (this._heat && !this._frame && !this._map._animating) {
            this._frame = L.Util.requestAnimFrame(this._redraw, this);
        }
        return this;
    },
    
    
    onAdd: function (map) {
        this._map = map;

        if (!this._canvas) {
            this._initCanvas();
        }

        map._panes.overlayPane.appendChild(this._canvas);

		// Listener: call this_reset function when map stops changing
        map.on('moveend', this._reset, this);

		
        if (map.options.zoomAnimation && L.Browser.any3d) {
            map.on('zoomanim', this._animateZoom, this);
        }
        
        this._reset();
    },

	// Remove the listeners
    onRemove: function (map) {
        map.getPanes().overlayPane.removeChild(this._canvas);

        map.off('moveend', this._reset, this);

        if (map.options.zoomAnimation) {
            map.off('zoomanim', this._animateZoom, this);
        }
    },

    addTo: function (map) {
        map.addLayer(this);
        return this;
    },


	// Create a new canvas object
    _initCanvas: function () {
        var canvas = this._canvas = L.DomUtil.create('canvas', 'leaflet-heatmap-layer leaflet-layer');

        var size = this._map.getSize();
        canvas.width  = size.x;
        canvas.height = size.y;

		// Check whether zoom animation is enabled
        var animated = this._map.options.zoomAnimation && L.Browser.any3d;
        L.DomUtil.addClass(canvas, 'leaflet-zoom-' + (animated ? 'animated' : 'hide'));

		// Create a simpleheat object
        this._heat = simpleheat(canvas);
        this._updateOptions();
        
        
    },
	
	// update the simpleheat object parameters using specified value
    _updateOptions: function () {
        this._heat.circle(this.radiuPerCell || this._heat.r, this.options.blur);
		
		
		if (this.options.opacity) {
			this._heat.opacity = this.options.opacity;
		}
        if (this.options.gradient) {
            this._heat.gradient(this.options.gradient);
        }
        if (this.options.max) {
            this._heat.max(this.options.max);
        }
    },

	// reset & redraw the layer
    _reset: function () {
    	
    	//set the canvas potision and size
        var topLeft = this._map.containerPointToLayerPoint([0, 0]);
        L.DomUtil.setPosition(this._canvas, topLeft);

        var size = this._map.getSize();

        if (this._heat._width !== size.x) {
            this._canvas.width = this._heat._width  = size.x;
        }
        if (this._heat._height !== size.y) {
            this._canvas.height = this._heat._height = size.y;
        }

        this._redraw();
    },

	
    _redraw: function () {
    	// Adjsut radius to current zoom level
    	var zoom = this._map.getZoom();
    	
        var rToDisplay = this.options.radius * Math.pow(1.4,zoom-11);
        rToDisplay = Math.min(this.options.max_radius, rToDisplay);
        rToDisplay = Math.max(this.options.min_radius, rToDisplay);
        
		var blurToDisplay = this.options.blur * Math.pow(1.4,zoom-11);
		
    	
        var data = [],
            //r = this._heat._r,
            r = rToDisplay,
            size = this._map.getSize(),
            
            //boundary of current map: width+2r, height+2r
            bounds = new L.LatLngBounds(
                this._map.containerPointToLatLng(L.point([-r, -r])),
                this._map.containerPointToLatLng(size.add([r, r]))),

			//set the parameters
            max = this.options.max === undefined ? 1 : this.options.max,
            maxZoom = this.options.maxZoom === undefined ? this._map.getMaxZoom() : this.options.maxZoom,
            
            cellNum = this.options.cellNum,
            //cellSize = r/(2*cellNum),
            cellSize = r,
            //v = cellNum * cellNum  / (Math.pow(1.6,11-zoom)*3),
            v = cellNum * cellNum  / (Math.pow(1.6,11-zoom)*this.options.density),
           
            grid = [],
            panePos = this._map._getMapPanePos(),
            offsetX = panePos.x % cellSize,
            offsetY = panePos.y % cellSize,
            i, len, p, cell, x, y, j, len2, k;
            
        for (i = 0, len = this._latlngs.length; i < len; i++) {
            if (bounds.contains(this._latlngs[i])) {
            	//Point in the given field
                p = this._map.latLngToContainerPoint(this._latlngs[i]);
                x = Math.floor((p.x - offsetX) / cellSize) + 2;
                y = Math.floor((p.y - offsetY) / cellSize) + 2;

                var alt =
                    this._latlngs[i].alt !== undefined ? this._latlngs[i].alt :
                    this._latlngs[i][2] !== undefined ? +this._latlngs[i][2] : 1;
                k = alt * v;

                grid[y] = grid[y] || [];
                cell = grid[y][x];

                if (!cell) {
                    grid[y][x] = [p.x, p.y, k];

                } else {
                    cell[0] = (cell[0] * cell[2] + p.x * k) / (cell[2] + k); // x
                    cell[1] = (cell[1] * cell[2] + p.y * k) / (cell[2] + k); // y
                    cell[2] += k; // cumulated intensity value
                }
            }
        }

        for (i = 0, len = grid.length; i < len; i++) {
            if (grid[i]) {
                for (j = 0, len2 = grid[i].length; j < len2; j++) {
                    cell = grid[i][j];
                    if (cell) {
                        data.push([
                            Math.round(cell[0]),
                            Math.round(cell[1]),
                            Math.min(cell[2], max)
                        ]);
                    }
                }
            }
        }
        
        this._heat._r = rToDisplay;
        this._heat.blur = blurToDisplay;
        this._heat.data(data);
        this._heat.draw(this.options.minOpacity);

        this._frame = null;
    },

    _animateZoom: function (e) {
        var scale = this._map.getZoomScale(e.zoom),
            offset = this._map._getCenterOffset(e.center)._multiplyBy(-scale).subtract(this._map._getMapPanePos());
        if (L.DomUtil.setTransform) {
           L.DomUtil.setTransform(this._canvas, offset, scale);

        } else {
            this._canvas.style[L.DomUtil.TRANSFORM] = L.DomUtil.getTranslateString(offset) + ' scale(' + scale + ')';
        }
        
        this._redraw();
    }
});

L.heatLayer = function (latlngs, options) {
    return new L.HeatLayer(latlngs, options);
};
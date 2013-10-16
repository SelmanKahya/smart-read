; // start this bad boy off with a semicolon, thats right a semicolon

(function($) {

	/************ BEGIN VirtualRectangle Class Definition ***********/
	var VirtualRectangle = function(startRect) {
		this.startRect = startRect;
		this.top 	= startRect.top;
		this.left 	= startRect.left;
		this.width 	= startRect.width;
		this.height = startRect.height;
		this.scale 	= 1.0;
	};

	VirtualRectangle.prototype.applyConstraints = function() {
		
	};

	VirtualRectangle.prototype.getZoom = function() {
		return this.height / this.startRect.height;
	};

	VirtualRectangle.prototype.getOffsetX = function() {
		return (this.left - this.startRect.left) / this.scale;
	};

	VirtualRectangle.prototype.getOffsetY = function() {
		return (this.top - this.startRect.top) / this.scale;
	};

	VirtualRectangle.prototype.pan = function(deltaX, deltaY) {
		this.top += deltaY;
		this.left += deltaX;
	}

	VirtualRectangle.prototype.zoom = function(originX, originY, delta) {
		var scale = (this.width + delta) / this.startRect.width;
		var width = scale * this.startRect.width;
		var height = scale * this.startRect.height;

		// we want to keep the transorm origin in th same place on screen
		// so we need to do a transformation to compensate
		var rightShift = 0; //(originX)/(this.startRect.width) * (width - this.width);
		var upShift = 0;// (originY)/(this.startRect.height) * (height - this.height);
		
		this.width = width;
		this.height = height;
		this.scale = scale;
		this.top -= upShift;
		this.left -= rightShift;
	};

	VirtualRectangle.prototype.applyScale = function(originX, originY, scale) {

		if(scale > 4) scale = 4;
		if(scale < 0.1) scale = 0.1;
		
		var width = scale * this.startRect.width;
		var height = scale * this.startRect.height;
		
		// we want to keep the transorm origin in th same place on screen
		// so we need to do a transformation to compensate
		var rightShift =0// 0.5 * (width - this.width);
		var upShift = 0//.5 * (height - this.height);
		this.width = width;
		this.height = height;
		this.scale = scale;
		this.top -= upShift;
		this.left -= rightShift;
	};

	/************ END VirtualRectangle Class Definition ***********/

	var getTransformString = function(vrect) {
		var str =  'scale(' + vrect.getZoom() + ') '
			str +=	'translate('+vrect.getOffsetX()+'px, '+vrect.getOffsetY()+'px)'
			return str;
	};
	
	var bindMouseWheelHandler = function($elem, vRect, startRender, stopRender, options) {
		var timeout = null;
		// zoom via mouse wheel events
		$elem.mousewheel(function(event, dt) {
			event.preventDefault();

			vRect.zoom(event.offsetX, event.offsetY, dt*options.scaleRate);
			
			if(timeout) {
				clearTimeout(timeout);
			}
			startRender();
			// set the timeout to stop running
			timeout = setTimeout(function() {
				stopRender();
			}, 35);
			
		});
	};

	var bindMouseDownHandler = function($elem, vRect, startRender, stopRender, options) {
		var mouseTrack = false;
		var mousePos = {
			x: 0,
			y: 0
		}
		// pan and zoom via click and drag
		$elem.mousedown(function(e) {
			mouseTrack = true;
			mousePos.x = e.clientX;
			mousePos.y = e.clientY;
			startRender();
		}).mouseup(function(e) {
			mouseTrack = false;
			stopRender();
		}).mousemove(function(e) {
			if(mouseTrack) {
				var deltaX = e.clientX - mousePos.x;
				var deltaY = e.clientY - mousePos.y;
				vRect.pan(deltaX, deltaY);
				vRect.applyConstraints();
				mousePos.x = e.clientX;
				mousePos.y = e.clientY;
			}
		});
		
	};

	var bindGestureHandler = function($elem, vRect, startRender, stopRender, options) {

		var timeout; // capture this the click handler functions closure
		var startScale = 1;

		$elem.on("gesturestart", function(event) {
			event.preventDefault();
			startScale = event.originalEvent.scale
			startRender();
		}).on("gestureend", function(event) {
			event.preventDefault();

			stopRender();
		}).on("gesturechange", function(event) {
			event.preventDefault();
			/*var log = ""
			for(x in event) {
				log += x + "\n";
			}
			alert(log);*/
			vRect.applyScale(0, 0, event.originalEvent.scale);
			// if(timeout) {
			// 	clearTimeout(timeout);
			// }
			startRender();
			// set the timeout to stop running
			// timeout = setTimeout(function() {
			// 	stopRender();
			// }, 105);
		});
	}

	$.fn.zoomAndScale = function(options) {

		options = $.extend({}, $.fn.zoomAndScale.defaults, options);

		return this.each(function() {
			var $elem = $(this);
			var $parent = $('body');

			// put it in the center of it's parent
			var right = ($elem.width() -  $parent.width()) / 2;
			var top = ($elem.height() -  $parent.height()) / 2 + 20;
			if(right > 0) {
				$elem.css({
				"position": "relative",
				"right": right + "px",
				"top": "-" + top + "px"
				});
			}
			


			var dontRender = true;
			
			var startRect = {
				top: 0,
				left: 0,
				width: $elem.width(),
				height: $elem.height()
			};
			var virtualRect = new VirtualRectangle(startRect);
			virtualRect.applyScale(0, 0, ( $parent.height() / $elem.height() ) * 0.9 );
			$elem.css('-webkit-transform', getTransformString(virtualRect) );

			//$elem.css('-webkit-transform-origin', "0 0");

			$elem.css('-webkit-transform', getTransformString(virtualRect) );

			// render loop for the element
			var render = function() {
				if(dontRender) return;
				$elem.css('-webkit-transform', getTransformString(virtualRect) );
				setTimeout(render, options.frameRate);
			};

			var startRender = function() {
				if(dontRender) {
					dontRender = false;
					render();
				}
			};

			var stopRender = function() {
				dontRender = true;
			}

			bindMouseDownHandler($elem, virtualRect, startRender, stopRender, options);
			bindMouseWheelHandler($elem, virtualRect, startRender, stopRender, options);
			bindGestureHandler($elem, virtualRect, startRender, stopRender, options);
		
			
		});
	};

	$.fn.zoomAndScale.defaults = {
		frameRate: 30,
		scaleRate: 30
	}

})(jQuery);
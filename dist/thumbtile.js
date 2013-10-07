/*!
 * ThumbTile.js
 * ------------
 * Arrange images as tiles
 * 
 * @version 0.8.0
 * @url http://github.com/mach3/thumbtile.js
 * @license MIT License
 * @author mach3 <http://github.com/mach3>
 */
(function(){

	/**
	 * ThumbTile
	 * ---------
	 * @class Arrange images as tile
	 */
	var ThumbTile = function(){
		this.initialize.apply(this, arguments);
	};

	$.extend(ThumbTile.prototype, {

		/**
		 * Options:
		 * - gutter:Integer = Gutter size
		 * - base:Integer = Base height of image
		 * - rows:Integer = Max row count
		 * - timeout:Integer = Timeout for loading images as integer
		 * - data:Object = key-value pair to be set as data of img element
		 */
		options: {
			gutter: 10,
			base: 150,
			rows: null,
			timeout: null,
			data: {}
		},

		/**
		 * Attributes:
		 * - el:HTMLElement = Container element
		 * - $el:jQuery = Container element
		 * - items:Array = Collection of image objects
		 * - count:Integer = Length of images
		 */
		el: null,
		$el: null,
		items: [],
		count: 0,

		/**
		 * Constructor
		 * Load images, then render the tile
		 * @constructor
		 * @param HTMLElement el
		 * @param Array images
		 * @param Object options
		 */
		initialize: function(el, images, options){
			this.el = el;
			this.$el = $(el);
			this.count = images.length;
			this.config(options);
			this.load(images).then($.proxy(this.render, this));
			return this;
		},

		/**
		 * Configure
		 * @param Object options
		 */
		config: function(options){
			this.options = $.extend(true, {}, this.options, options);
			return this;
		},

		/**
		 * Load images by array, return deferred object
		 * When all images loaded or reach to timeout, resolve it
		 * @param Array images
		 * @return jQuery.Deferred
		 */
		load: function(images){
			var my = this, dfd;
			dfd = $.Deferred();
			$.each(images, function(i, image){
				var item = {
					src: image.src,
					index: i,
					el: new Image(),
					data: image.data || {}
				};
				item.el.onload = function(){
					my.count --;
					if(! my.count){
						dfd.resolve();
					}
				};
				item.el.src = image.src;
				my.items.push(item);
			});
			if(this.options.timeout){
				setTimeout(function(){
					dfd.resolve();
				}, this.options.timeout);
			}
			return dfd;
		},

		/**
		 * Render images as tile by this.items
		 */
		render: function(){
			var my = this, w, width, rows, r;

			width = this.$el.width();
			w = 0;
			r = 0;
			rows = [];
			this.$el.html("");

			// run for each items
			$.each(this.items, function(i, item){
				var row, resize;

				// if image not loaded, pass this
				if(item.el.complete !== true && item.el.readyState !== "complete"){
					return;
				}

				// resize the image with base height...
				row = rows[r] = rows[r] || [];
				resize = my.resize(item.el.width, item.el.height);
				row.push(item);
				item.width = resize.width;
				item.height = resize.height;
				w += item.width;

				// then if total width of images in row exceed the container's width,
				// calcurate the rate for resizing, append them, refresh the row
				if(w > width){
					var rate = (width - (my.options.gutter * (row.length - 1))) / w;
					$.each(row, function(i, item){
						var last, img;
						last = i === (row.length - 1);
						img = $("<img>", {
							src: item.src
						})
						.css({
							"width": (item.width * rate),
							"height": (item.height * rate),
							"float": "left",
							"margin-right": last ? 0 : my.options.gutter,
							"margin-top": !! r ? my.options.gutter : 0
						})
						.data(item.data)
						.appendTo(my.el);
					});
					r ++;
					w = 0;
				}

				// if options.row is set and equals to the row count, return
				if(!! my.options.rows && r >= my.options.rows){
					return false;
				}
			});

			return this;
		},

		/**
		 * Resize the image with base height
		 * @param Integer width
		 * @param Integer height
		 * @param Integer base (optional)
		 */
		resize: function(width, height, base){
			base = base || this.base;
			return {
				height: this.options.base,
				width: parseInt(width * (this.options.base / height), 10)
			};
		}

	});

	/**
	 * Interface for jQuery
	 * @param Array images
	 * @param Object options
	 */
	$.fn.thumbTile = function(images, options){
		var key, ins;

		key = "thumbTileInstance";
		ins = this.data(key);

		if(! arguments.length && ins instanceof ThumbTile){
			ins.render();
		} else if(!! images){
			ins = new ThumbTile(this.get(0), images, options);
			this.data(key, ins);
		}
		return this;
	};

}());
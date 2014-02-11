// This class is used to navigate an EPub's package document
Readium.Models.PackageDocument = Backbone.Model.extend({

	initialize: function(attributes, options) {
		var that = this;
		
		if(!attributes.file_path) {
			// Sanity Check: we need to know where to fetch the data from
			throw "This class cannot be synced without a file path";
		}
		else {
			// set it as a property of `this` so that `BackboneFileSystemSync`
			// knows how to find it
			this.file_path = attributes.file_path;

			// use the `FileSystemApi` to generate a fully resolved
			// `filesytem:url`
			Readium.FileSystemApi(function(api) {
				api.getFsUri(that.file_path, function(uri) {
					that.uri_obj = new URI(uri);
				})
			});
		}
		this.on('change:spine_position', this.onSpinePosChanged);
		
    },

    onSpinePosChanged: function() {
    	if( this.get("spine_position") >= this.previous("spine_position") ) {
    		this.trigger("increased:spine_position");
    	}
    	else {
    		this.trigger("decreased:spine_position");
    	}
    },

	// just want to make sure that we do not slip into an
	// invalid state
	validate: function(attrs) {
		
		if( !( attrs.manifest || this.get("manifest") ) ) {
			return "ERROR: All ePUBs must have a manifest";
		}

		//validate the spine exists and the position is valids
		var spine = attrs.spine || this.get("spine") ;
		if( !spine ) {
			return "ERROR: All ePUBs must have a spine";
		}
		if(attrs.spine_position < 0 || attrs.spine_position >= spine.length)	{
			return "ERROR: invalid spine position";
		}
	},

	sync: BBFileSystemSync,

	defaults: {
		spine_position: 0
	},
	
	getManifestItemById: function(id) {
		return this.get("manifest").find(function(x) { 
					if(x.get("id") === id) return x;
				});
	},

	getSpineItem: function(index) {
		return this.get("res_spine").at(index);
	},

	spineLength: function() {
		return this.get("res_spine").length;
	},

	// gets the next position in the spine for which the
	// spineItem does not have `linear='false'`. The start
	// param is the non-inclusive position to begin the search
	// from. If start is not supplied, the search will begin at
	// postion 0. If no linear position can be found, this 
	// funciton returns -1
	getNextLinearSpinePostition: function(start) {
		var spine = this.get("res_spine");
		if(start === undefined || start < -1) {
			start = -1;
		}

		while(start < spine.length - 1) {
			start += 1;
			if(spine.at(start).get("linear") !== "no") {
				return start;
			}
		}

		return -1;
	},

	// gets the previous position in the spine for which the
	// spineItem does not have `linear='false'`. The start
	// param is the non-inclusive position to begin the search
	// from. If start is not supplied, the search will begin at
	// the end of the spine. If no linear position can be found, 
	// this function returns -1
	getPrevLinearSpinePostition: function(start) {
		var spine = this.get("res_spine");
		if(start === undefined || start > spine.length) {
			start = spine.length;
		}

		while(start > 0) {
			start -= 1;
			if(spine.at(start).get("linear") !== "no") {
				return start;
			}
		}

		return -1;
	},

	goToNextSection: function() {
		var cp = this.get("spine_position");
		this.set({spine_position: (cp + 1) });
	},

	goToPrevSection: function() {
		var cp = this.get("spine_position");
		this.set({spine_position: (cp - 1) });	
	},

	spineIndexFromHref: function(href) {
		var spine = this.get("res_spine");
		href = this.resolveUri(href).replace(/#.*$/, "");
		for(var i = 0; i < spine.length; i++) {
			var path = spine.at(i).get("href");
			path = this.resolveUri(path).replace(/#.*$/, "");
			if(path === href) {
				return i;
			}
		}
		return -1;
	},

	goToHref: function(href) {
		var spine = this.get("spine");
		var manifest = this.get("manifest");
		var that = this;
		href = that.resolveUri(href).replace(/#.*$/, "");
		var node = manifest.find(function(x) {
			var path = that.resolveUri(x.get("href")).replace(/#.*$/, "");
			if (href == path) return x;
		});
								 
		// didn't find the spine node, href invalid
		if(!node) {
			return null;
		}

		var id = node.get("id");
		
		for(var i = 0; i < spine.length; ++i ) {
			if(spine[i].idref === id) {
				// always aproach link spine items in fwd dir
				this.set({spine_position: i}, {silent: true});
				this._previousAttributes.spine_position = 0
				this.trigger("change:spine_position")
				break;
			}
		}
	},

	getTocItem: function() {
		var manifest = this.get("manifest");
		var spine_id = this.get("metadata").ncx;
		var item = manifest.find(function(item){ 
			if (item.get("properties").indexOf("nav") !== -1) {
				return true;
			}
			else {
				return false;
			}
		});

		if( item ) {
			return item;
		}

		if( spine_id && spine_id.length > 0 ) {
			return manifest.find(function(item) {
				return item.get("id") === spine_id;
			});
		}

		return null;
	},

	getMediaOverlayItem: function(idref) {
		// just look up the object in the mo_map
		var map = this.get("mo_map");
		return map && map[idref];
	},

	// combine the spine item data with the corresponding manifest
	// data to build useful set of backbone objects
	crunchSpine: function(spine, manifest) {
		//var bbSpine = new Readium.Collections.Spine(spine, {packageDocument: this});
		var that = this;
		var index = -1; // to keep track of the index of each spine item
		
		var bbSpine = _.map(spine, function(spineItem) {
			index += 1;
			
			var manItem = manifest.find(function(x) {
				if(x.get("id") === spineItem["idref"]) return x;
			});

			// crunch spine attrs and manifest attrs together into one obj
			var book = that.get("book");
			return _.extend({}, spineItem, manItem.attributes, {"spine_index": index}, {"page_prog_dir": book.get("page_prog_dir")});
		});

		// Add the index of the spine item to the manifest item's id to prevent the backbone collection
		//   from finding duplicate manifest items when different itemref elements in the spine reference
		//   the same manifest item through the "idref" attribute.
		$.each(bbSpine, function () {
			this.id = this.id + this.spine_index;
		});

		return new Readium.Collections.Spine(bbSpine, {packageDocument: this});
	},

	parse: function(xmlDom) {
		var parser = new Readium.Models.PackageDocumentParser(this.uri_obj);
		var json = parser.parse(xmlDom);
		json.res_spine = this.crunchSpine(json.spine, json.manifest);
		return json;
	},

	resolveUri: function(rel_uri) {
		uri = new URI(rel_uri);
		return uri.resolve(this.uri_obj).toString();
	},

	// reslove a relative file path to relative to this the
	// the path of this pack docs file path
	resolvePath: function(path) {
		var suffix;
		var pack_doc_path = this.file_path;
		if(path.indexOf("../") === 0) {
			suffix = path.substr(3);
		}
		else {
			suffix = path;
		}
		var ind = pack_doc_path.lastIndexOf("/")
		return pack_doc_path.substr(0, ind) + "/" + suffix;
	}


});

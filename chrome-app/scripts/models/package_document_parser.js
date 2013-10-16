// `PackageDocumentParser` are used to parse the xml of an epub package
// document and build a javascript object. The constructor accepts an
// instance of `URI` that is used to resolve paths durring the process
Readium.Models.PackageDocumentParser = function(uri_object) {
	this.uri_obj = uri_object;
};

// We use [Jath](https://github.com/dnewcome/jath) for converting xml into
// JSON in a declaritive manner. This is the template that performs that
// conversion
Readium.Models.PackageDocumentParser.JathTemplate = {

	metadata:  { 
		id: "//def:metadata/dc:identifier",
		epub_version: "//def:package/@version",
		title: "//def:metadata/dc:title",
		author: "//def:metadata/dc:creator",
		publisher: "//def:metadata/dc:publisher",
		description: "//def:metadata/dc:description",
		rights: "//def:metadata/dc:rights",
		language: "//def:metadata/dc:language",
		pubdate: "//def:metadata/dc:date",
		modified_date: "//def:metadata/def:meta[@property='dcterms:modified']",
		layout: "//def:metadata/def:meta[@property='rendition:layout']",
		spread: "//def:metadata/def:meta[@property='rendition:spread']",
		orientation: "//def:metadata/def:meta[@property='rendition:orientation']",
		ncx: "//def:spine/@toc",
		page_prog_dir: "//def:spine/@page-progression-direction",
		active_class: "//def:metadata/def:meta[@property='media:active-class']"
	 },

	manifest: [ "//def:item", { 
		id: "@id",
		href: "@href",
		media_type: "@media-type",
		properties: "@properties",
        media_overlay: "@media-overlay"
	} ],
						 
	spine: [ "//def:itemref", { idref: "@idref", properties: "@properties", linear: "@linear" } ],

	bindings: ["//def:bindings/def:mediaType", { 
		handler: "@handler",
		media_type: "@media-type"
	} ]
	
};

// Parse an XML package document into a javascript object
Readium.Models.PackageDocumentParser.prototype.parse = function(xml_content) {

	var json, manifest, cover, xmlDom;
	if(typeof(xml_content) === "string" ) {
		var parser = new window.DOMParser;
  		xmlDom = parser.parseFromString(xml_content, 'text/xml');
	}
	else {
		xmlDom = xml_content;
	}

	Jath.resolver = function( prefix ) {
		var mappings = { 
    		def: "http://www.idpf.org/2007/opf",
			dc: "http://purl.org/dc/elements/1.1/"
		};
		return mappings[ prefix ];
	}

	json = Jath.parse( Readium.Models.PackageDocumentParser.JathTemplate, xmlDom);

	// parse the page-progression-direction if it is present
	json.paginate_backwards = this.paginateBackwards(xmlDom);

	// try to find a cover image
	cover = this.getCoverHref(xmlDom);
	if(cover) {
		json.metadata.cover_href = this.resolveUri(cover);
	}		
	if(json.metadata.layout === "pre-paginated") {
		json.metadata.fixed_layout = true;
	}
    
    // parse the manifest into a proper collection
	json.manifest = new Readium.Collections.ManifestItems(json.manifest, {packageDocument: this});

	// create a map of all the media overlay objects
	json.mo_map = this.resolveMediaOverlays(json.manifest);

	// parse the spine into a proper collection
	json.spine = this.parseSpineProperties(json.spine);

	// return the parse result
	return json;

};

	

Readium.Models.PackageDocumentParser.prototype.getCoverHref = function(dom) {
	var manifest; var $imageNode;
	manifest = dom.getElementsByTagName('manifest')[0];

	// epub3 spec for a cover image is like this:
	/*<item properties="cover-image" id="ci" href="cover.svg" media-type="image/svg+xml" />*/
	$imageNode = $('item[properties~="cover-image"]', manifest);
	if($imageNode.length === 1 && $imageNode.attr("href") ) {
		return $imageNode.attr("href");
	}

	// some epub2's cover image is like this:
	/*<meta name="cover" content="cover-image-item-id" />*/
	var metaNode = $('meta[name="cover"]', dom);
	var contentAttr = metaNode.attr("content");
	if(metaNode.length === 1 && contentAttr) {
		$imageNode = $('item[id="'+contentAttr+'"]', manifest);
		if($imageNode.length === 1 && $imageNode.attr("href")) {
			return $imageNode.attr("href");
		}
	}

	// that didn't seem to work so, it think epub2 just uses item with id=cover
	$imageNode = $('#cover', manifest);
	if($imageNode.length === 1 && $imageNode.attr("href")) {
		return $imageNode.attr("href");
	}

	// seems like there isn't one, thats ok...
	return null;
};

Readium.Models.PackageDocumentParser.prototype.parseSpineProperties = function(spine) {
	
	var parseProperiesString = function(str) {
		var properties = {};
		var allPropStrs = str.split(" "); // split it on white space
		for(var i = 0; i < allPropStrs.length; i++) {
			// brute force!!!
			//rendition:orientation landscape | portrait | auto
			//rendition:spread none | landscape | portrait | both | auto

			//rendition:page-spread-center 
			//page-spread | left | right
			//rendition:layout reflowable | pre-paginated
			if(allPropStrs[i] === "rendition:page-spread-center") properties.page_spread = "center";
			if(allPropStrs[i] === "page-spread-left") properties.page_spread = "left";
			if(allPropStrs[i] === "page-spread-right") properties.page_spread = "right";
			if(allPropStrs[i] === "page-spread-right") properties.page_spread = "right";
			if(allPropStrs[i] === "rendition:layout-reflowable") properties.fixed_flow = false;
			if(allPropStrs[i] === "rendition:layout-pre-paginated") properties.fixed_flow = true;
		}
		return properties;
		
	}

	for(var i = 0; i < spine.length; i++) {
		var props = parseProperiesString(spine[i].properties);
		// add all the properties to the spine item
		_.extend(spine[i], props);
	}
	return spine;
};

// resolve the url of smils on any manifest items that have a MO
// attribute
Readium.Models.PackageDocumentParser.prototype.resolveMediaOverlays = function(manifest) {
	var that = this;
    var momap = {};
    
    // create a bunch of media overlay objects
    manifest.forEach( function(item) {
		if(item.get("media_type") === "application/smil+xml") {
            var url = that.resolveUri(item.get("href"));
            var moObject = new Readium.Models.MediaOverlay();
            moObject.setUrl(url);
            moObject.fetch(); 
            momap[item.id] = moObject;
        }
	});
	return momap;
};

// parse the EPUB3 `page-progression-direction` attribute
Readium.Models.PackageDocumentParser.prototype.paginateBackwards = function(xmlDom) {
	return $('spine', xmlDom).attr('page-progression-direction') === "ltr";
};


// combine the spine item data with the corresponding manifest
// data to build useful set of backbone objects
Readium.Models.PackageDocumentParser.prototype.crunchSpine = function(spine, manifest) {
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

	return new Readium.Collections.Spine(bbSpine, {packageDocument: this});
};

// convert a relative uri to a fully resolved one
Readium.Models.PackageDocumentParser.prototype.resolveUri = function(rel_uri) {
	uri = new URI(rel_uri);
	return uri.resolve(this.uri_obj).toString();
};
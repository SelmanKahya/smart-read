Readium.Models.Toc = Backbone.Model.extend({

	sync: BBFileSystemSync,

	initialize: function(options) {
		this.file_path = options.file_path;
		this.book = options.book;
		this.book.on("change:toc_visible", this.setVisibility, this);
		this.book.on("change:toolbar_visible", this.setTocVis, this);
	},

	// Rationale: Readium expects that any hrefs to EPUB content are either absolute references or references to the content relative
	//   to the EPUBs package document. Since any href passed to this method is specified as either absolute (in which case we 
	//   don't need to worry) or as relative to the nav document (where the click was generated, as this is the toc), we need
	//   to construct an absolute path from that.
	handleLink: function(href) {

		var TOCHref = this.book.packageDocument.getTocItem().get("href");

		// If toc is in the same folder as the package document, use the href straight
		if (TOCHref.indexOf("/") === -1) {

			this.book.goToHref(href);	
		}
		// If the href target is in a child folder of the toc folder, create the relative URI
		// If the href target is in a parent folder of the toc folder, this will fail, for now.
		else {

			var TOC_URI = new URI(TOCHref);
			var targetHrefURI = new URI(href);

			// Use the TOC path, relative to the package document to create an href for the target resource which will also be relative
			//   to the package document (or absolute, if the href for the TOC was absolute).
			href = targetHrefURI.resolve(TOC_URI).toString();
			this.book.goToHref(href);
		}
	},

	setVisibility: function() {
		this.set("visible", this.book.get("toc_visible"));
	},

	hide: function() {
		this.book.set("toc_visible", false)
	},

	setTocVis: function() {
		if(!this.book.get("toolbar_visible")) {
			this.book.set("toc_visible", false);
		}
	},

	defaults: {
		visible: false
	}

}, {
	// Class Level Attributes!
	XHTML_MIME: "application/xhtml+xml",
	XML_MIME: "text/xml",	
	NCX_MIME: "application/x-dtbncx+xml",
	getToc: function(manItem, options) {
		var media_type = manItem.get("media_type");
		if(media_type === Readium.Models.Toc.XHTML_MIME || 
				media_type === Readium.Models.Toc.XML_MIME) {
			return new Readium.Models.XhtmlToc(options);
		}
		else if (media_type ===  Readium.Models.Toc.NCX_MIME) {
			return new Readium.Models.NcxToc(options);
		}
	}
});


Readium.Models.NcxToc = Readium.Models.Toc.extend({

	jath_template: {

		title: "//ncx:docTitle/ncx:text",

		navs: [ "//ncx:navMap/ncx:navPoint", { 
			text: "ncx:navLabel/ncx:text",
			href: "ncx:content/@src"
		} ]
	},

	// Rationale: This method does not use JATH to parse an NCX document, as JATH doesn't really support elements nested 
	//   recursively, as is possibly the case for navPoint elements in an NCX document. 
	parse: function (xmlDom) {
		var ncxJson = {};

		var $navMap;
		var that = this;

		if (typeof(xmlDom) === "string") {
			var parser = new window.DOMParser;
      		xmlDom = parser.parseFromString(xmlDom, 'text/xml');
		}

		// Get NCX TOC text title
		ncxJson.title = $($("text", $("docTitle", xmlDom)[0])[0]).text();
		
		// For each navpoint, create navPoint objects recursively
		ncxJson.navs = [];
		$navMap = $("navMap", xmlDom);
		$.each($navMap.children(), function() {

			if ($(this).is("navPoint")) {

				ncxJson.navs.push(that.createNavPointObject($(this)));
			}
		});

		return ncxJson;
	},

	// Description: Creates an object that represents a NCX navPoint.   
	// Rationale: Since navPoints can be nested within each other, this method creates each navPoint object recursively.
	createNavPointObject : function ($navPoint) {

		var jsonNavPoint = {};
		var that = this;

		// Each navPoint object has a content src, a label and 0 or more child navPoints
		jsonNavPoint.navs = [];
		$.each($navPoint.children(), function () {

			$currElement = $(this);
			if ($currElement.is("content")) {

				jsonNavPoint.href = $currElement.attr("src");
			}
			else if ($currElement.is("navLabel")) {

				jsonNavPoint.text = $($("text", $currElement)[0]).text();
			}
			else if ($currElement.is("navPoint")) {

				jsonNavPoint.navs.push(that.createNavPointObject($currElement));
			}
		});

		return jsonNavPoint;
	},

	TocView: function() {
		return new Readium.Views.NcxTocView({model: this});
	}
});

Readium.Models.XhtmlToc = Readium.Models.Toc.extend({

	parse: function(xmlDom) {
		var json = {};
		if(typeof(xmlDom) === "string" ) {
			var parser = new window.DOMParser;
      		xmlDom = parser.parseFromString(xmlDom, 'text/xml');
		}
		json.title = $('title', xmlDom).text();
		json.body = $('body', xmlDom);
		return json;
	},

	TocView: function() {
		return new Readium.Views.XhtmlTocView({model: this});
	}
});
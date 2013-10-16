Readium.Views.TocViewBase = Backbone.View.extend({

	el: "#readium-toc",

	initialize: function() {
		this.model.on("change", this.render, this);
		this.model.on("change:visible", this.setVisibility, this);
	},

	events: {
		"click a": "handleClick",
		"click #close-toc-button": "closeToc"
	},

	setVisibility: function() {
		this.$el.toggle(this.model.get("visible"));
	},

	handleClick: function(e) {
		e.preventDefault();
		href = $(e.currentTarget).attr("href");
		this.model.handleLink(href);
	},

	handleSelect : function (e) {

		var href = e.val;
		this.model.handleLink(href);
	},

	closeToc: function(e) {
		e.preventDefault();
		this.model.hide();
	}
});


Readium.Views.NcxTocView = Readium.Views.TocViewBase.extend({ 

	initialize: function() {
		Readium.Views.TocViewBase.prototype.initialize.call(this);
		this.nav_template = Handlebars.templates.ncx_nav_template;
	},

	render: function() {

		var ol;

		this.setVisibility();

		// Construct html for the navPoints in the document		
		ol = this.addNavPointElements(this.model.get("navs"));

		this.$('#toc-body').html("<h2 tabindex='-1'>" + (this.model.get("title") || "Contents") + "</h2>")
		this.$('#toc-body').append(ol);
		this.$('#toc-body').append("<div id='toc-end-spacer'>");
		return this;
	},

	// Description: Constructs an html representation of NCX navPoints, based on an object of navPoint information
	// Rationale: This is a recursive method, as NCX navPoint elements can nest 0 or more of themselves as children
	addNavPointElements: function (jsonNavs) {

		var ol = $("<ol></ol>");
		var that = this;

		$.each(jsonNavs, function (navIndex) {

			var hasNavs;

			// Add the current navPoint element to the TOC html 
			ol.append( that.nav_template(jsonNavs[navIndex]) );

			// Check if the current navPoint has navPoints of its own
			hasNavs = jsonNavs[navIndex].navs.length > 0 ? true : false;
			if (hasNavs) {

				var li = $("<li></li>");
				li.append(that.addNavPointElements(jsonNavs[navIndex].navs));
				ol.append(li);
			}
		});

		return ol; 
	}
});

Readium.Views.XhtmlTocView = Readium.Views.TocViewBase.extend({ 

	// ------------------------------------------------------------------------------------ //
	//  "PUBLIC" METHODS (THE API)                                                          //
	// ------------------------------------------------------------------------------------ //

	events : {

		"click a": "handleClick",
		"click #close-toc-button": "closeToc",
		"change #toc-body" : "handleSelect"
	},

	render: function() {
			
		this.$('#toc-body').html( this.model.get("body").html() );
		this.formatPageListNavigation();
		this.$('#toc-body').append("<div id='toc-end-spacer'>");
		return this;
	},

	// ------------------------------------------------------------------------------------ //
	//  "PRIVATE" HELPERS                                                                   //
	// ------------------------------------------------------------------------------------ //

	formatPageListNavigation : function () {

		var $navElements;
		var $pageListNavElement;
		var pageListData = [];

		// Search for a nav element with epub:type="page-list". A nav element of this type must not occur more than once.
		$navElements = this.$("nav");
		$pageListNavElement = $navElements.filter(function () {

			if ($(this).attr("epub:type") === 'page-list') {

				// Hide the standard XHTML page-list nav element, as we'll be displaying a select2 drop-down control for this.
				$(this).attr("id", "page-list-select");
				$(this).hide();
				return true;
			}
		});

		// Each nav element has a single ordered list of page numbers. Extract this data into an array so it can be 
		//   loaded in the page-list control
		// TODO: span elements can be used to create sub-headings. Implement functionality to account for this at some point.
		$.each($('a', $pageListNavElement), function () { 

			var $navTarget = $(this);
			pageListData.push({

				id : $navTarget.attr("href"),
				text : "Page-" + $navTarget.text()
			});
		});

		// Create the select2 control
		$("#page-list-select").select2({

			placeholder : "Select a page",
			data : pageListData
		});

		// the select2 adds no-op inline click handlers, but these are not allowed
		// by chromes content securty policy so just remove them
		this.$('[onclick]').removeAttr('onclick');
	}
});

Readium.Views.ReflowablePaginationView = Readium.Views.PaginationViewBase.extend({

	// ------------------------------------------------------------------------------------ //
	//  "PUBLIC" METHODS (THE API)                                                          //
	// ------------------------------------------------------------------------------------ //

	initialize: function(options) {

		var that = this;

		// call the super ctor
		Readium.Views.PaginationViewBase.prototype.initialize.call(this, options);
		this.page_template = Handlebars.templates.reflowing_template;

		// make sure we have proper vendor prefixed props for when we need them
		this.stashModernizrPrefixedProps();

		// if this book does right to left pagination we need to set the
		// offset on the right
		if(this.model.epub.get("page_prog_dir") === "rtl") {
			this.offset_dir = "right";
		}
		else {
			this.offset_dir = "left";
		}

		this.pages.on("change:current_page", this.pageChangeHandler, this);
		this.model.on("change:toc_visible", this.windowSizeChangeHandler, this);
		this.model.on("repagination_event", this.windowSizeChangeHandler, this);
		this.model.on("change:current_theme", this.injectTheme, this);
		this.model.on("change:two_up", this.setUpMode, this);
		this.model.on("change:two_up", this.adjustIframeColumns, this);
		this.model.on("change:current_margin", this.marginCallback, this);
		this.model.on("save_position", this.savePosition, this);
	},

	render: function(goToLastPage, hashFragmentId) {
		var that = this;
		var json = this.model.getCurrentSection().toJSON();

		// make everything invisible to prevent flicker
		this.setUpMode();
		this.$('#container').html( this.page_template(json) );
		
		this.$('#readium-flowing-content').on("load", function(e) {
			// Important: Firefox doesn't recognize e.srcElement, so this needs to be checked for whenever it's required.
			if (!e.srcElement) e.srcElement = this;

			var lastPageElementId = that.injectCFIElements();
			that.adjustIframeColumns();
			that.iframeLoadCallback(e);
			that.setFontSize();
			that.injectTheme();
			that.setNumPages();
			that.applyKeydownHandler();

            // Rationale: The assumption here is that if a hash fragment is specified, it is the result of Readium 
			//   following a clicked linked, either an internal link, or a link from the table of contents. The intention
			//   to follow a link should supersede restoring the last-page position, as this should only be done for the 
			//   case where Readium is re-opening the book, from the library view. 
			if (hashFragmentId) {

				that.goToHashFragment(hashFragmentId);
			}
			else if (lastPageElementId) {

				that.goToHashFragment(lastPageElementId);
			}
			else {

				if (goToLastPage) {

					that.pages.goToLastPage();
				}
				else {

					that.pages.goToPage(1);
				}		
			}
            
            
		});
        
		return [this.model.get("spine_position")];
	},

    // Description: return the set of currently-visible elements on this page. 
    // if strict is true, the elements must be entirely within the page
    // if strict is false, then elements must be partially within the page
    // used by media overlays
    findVisiblePageElements: function() {

        var $elements = $(this.getBody()).find("[id]");
        var doc = $("#readium-flowing-content").contents()[0].documentElement;
        var doc_top = 0;
        var doc_left = 0;
        var doc_right = doc_left + $(doc).width();
        var doc_bottom = doc_top + $(doc).height();
        
        var visibleElms = this.filterElementsByPosition($elements, doc_top, doc_bottom, doc_left, doc_right);
        return visibleElms;
    },
    
    // override
    // used by media overlays
	indicateMoIsPlaying: function () {
		var moHelper = new Readium.Models.MediaOverlayViewHelper({epubController : this.model});
        var isPlaying = this.mediaOverlayController.get("state") == "playing";
        moHelper.renderReflowableMoPlaying(
			this.model.get("current_theme"),
            isPlaying,
			this
		);
	},

    // override
    // used by media overlays
	highlightText: function () {
        var moHelper = new Readium.Models.MediaOverlayViewHelper({epubController : this.model});
        moHelper.renderReflowableMoFragHighlight(
			this.model.get("current_theme"),
			this,
			this.mediaOverlayController.get("mo_text_id")
		);
	},
    
    // sometimes we have to rehighlight if the page contents weren't fully loaded the first time
    flagRehighlight: function() {
        this.flagMoRehighlight = true; // this is a property of PaginationViewBase
    },
    
    // override
    // Description: return the set of all elements for this spine item that have an @id attribute.
    // used by media overlays
    getAllPageElementsWithId: function() {
        return $(this.getBody()).find("[id]");
    },
    
    
	// Description: navigate to a url hash fragment by calculating the page of
	//   the corresponding elem and setting the page number on `this.model`
	//   as precondition the hash fragment should identify an element in the
	//   section rendered by this view
	goToHashFragment: function(hashFragmentId) {

		// this method is triggered in response to 
		var fragment = hashFragmentId;
		if(fragment) {
			var el = $("#" + fragment, this.getBody())[0];

			if(!el) {
				// couldn't find the el. just give up
                return;
			}

			// we get more precise results if we look at the first children
			while (el.children.length > 0) {
				el = el.children[0];
			}

			var page = this.getElemPageNumber(el);
            if (page > 0) {
                this.pages.goToPage(page);	
			}
		}
		// else false alarm no work to do
	},

	// ------------------------------------------------------------------------------------ //
	//  "PRIVATE" HELPERS                                                                   //
	// ------------------------------------------------------------------------------------ //

	// Description: Sometimes these views hang around in memory before
	//   the GC's get them. we need to remove all of the handlers
	//   that were registered on the model
	destruct: function() {
		
		this.pages.off("change:current_page", this.pageChangeHandler);
		this.model.off("change:toc_visible", this.windowSizeChangeHandler);
		this.model.off("repagination_event", this.windowSizeChangeHandler);
		this.model.off("change:current_theme", this.windowSizeChangeHandler);
		this.model.off("change:two_up", this.setUpMode);
		this.model.off("change:two_up", this.adjustIframeColumns);
		this.model.off("change:current_margin", this.marginCallback);
		// call the super destructor
		Readium.Views.PaginationViewBase.prototype.destruct.call(this);
	},

	// TODO: Extend this to be correct for right-to-left pagination
	findVisibleTextNode: function () {

        var documentLeft = 0;
        var documentRight;
        var columnGap;
        var columnWidth;
        var doc;
        var $elements;
        var $firstVisibleTextNode;

		// Rationale: The intention here is to get a list of all the text nodes in the document, after which we'll
		//   reduce this to the subset of text nodes that is visible on the page. We'll then select one text node
		//   for which we can create a character offset CFI. This CFI will then refer to a "last position" in the 
		//   EPUB, which can be used if the reader re-opens the EPUB.
		// REFACTORING CANDIDATE: The "audiError" check is a total hack to solve a problem for a particular epub. This 
		//   issue needs to be addressed.
		$elements = $("body", this.getBody()).find(":not(iframe)").contents().filter(function () {
			if (this.nodeType === 3 && !$(this).parent().hasClass("audiError")) {
				return true;
			} else {
				return false;
			}
		});

        doc = $("#readium-flowing-content").contents()[0].documentElement;

        if (this.model.get("two_up")) {
        	columnGap = parseInt($(doc).css("-webkit-column-gap").replace("px",""));
        	columnWidth = parseInt($(doc).css("-webkit-column-width").replace("px",""));
        	documentRight = documentLeft + columnGap + (columnWidth * 2);
        } 
        else {
        	documentRight = documentLeft + $(doc).width();
        }

        // Find the first visible text node 
        $.each($elements, function() {

        	var POSITION_ERROR_MARGIN = 5;
        	var $textNodeParent = $(this).parent();
        	var elementLeft = $textNodeParent.position().left;
        	var elementRight = elementLeft + $textNodeParent.width();
        	var nodeText;

        	// Correct for minor right and left position errors
        	elementLeft = Math.abs(elementLeft) < POSITION_ERROR_MARGIN ? 0 : elementLeft;
        	elementRight = Math.abs(elementRight - documentRight) < POSITION_ERROR_MARGIN ? documentRight : elementRight;

        	// Heuristic to find a text node with actual text
        	nodeText = this.nodeValue.replace(/\n/g, "");
        	nodeText = nodeText.replace(/ /g, "");

        	if (elementLeft <= documentRight 
        		&& elementRight >= documentLeft
        		&& nodeText.length > 10) { // 10 is so the text node is actually a text node with writing

        		$firstVisibleTextNode = $(this);

        		// Break the loop
        		return false;
        	}
        });

        return $firstVisibleTextNode;
	},

	// Currently for left-to-right pagination only
	findVisibleCharacterOffset : function($textNode) {

		var $parentNode;
		var elementTop;
		var elementBottom;
		var POSITION_ERROR_MARGIN = 5;
		var $document;
		var documentTop;
		var documentBottom;
		var percentOfTextOffPage;
		var characterOffset;

		// Get parent
		$parentNode = $textNode.parent();

		// get document
		$document = $($("#readium-flowing-content").contents()[0].documentElement);

		// Find percentage of visible node on page
		documentTop = $document.position().top;
		documentBottom = documentTop + $document.height();

		elementTop = $parentNode.offset().top;
		elementBottom = elementTop + $parentNode.height();

		// Element overlaps top
		if (elementTop < documentTop) {

			percentOfTextOffPage = Math.abs(elementTop - documentTop) / $parentNode.height();
			characterOffsetByPercent = Math.ceil(percentOfTextOffPage * $textNode[0].length);
			characterOffset = Math.ceil(0.5 * ($textNode[0].length - characterOffsetByPercent)) + characterOffsetByPercent;
		}
		else if (elementTop >= documentTop && elementTop <= documentBottom) {
			characterOffset = 1;
		}
		else if (elementTop < documentBottom) {
			characterOffset = 1;
		}

		return characterOffset;
	},
    
    // returns all the elements in the set that are inside the box
    // separated this function from the one above in order to debug it
    // set strict to false to include elements that are partially inside the box
    // used by media overlays
    filterElementsByPosition: function($elements, documentTop, documentBottom, documentLeft, documentRight) {
        
        var $visibleElms = $elements.filter(function(idx) {
            var elm_top = $(this).offset().top;
            var elm_left = $(this).offset().left;
            var elm_right = elm_left + $(this).width();
            var elm_bottom = elm_top + $(this).height();
            
            var is_ok_x = elm_left >= documentLeft && elm_right <= documentRight;
            var is_ok_y = elm_top >= documentTop && elm_bottom <= documentBottom;
            
            return is_ok_x && is_ok_y;
        });  

        return $visibleElms;
    },
    
    // Description: Handles clicks of anchor tags by navigating to
	//   the proper location in the epub spine, or opening
	//   a new window for external links
	linkClickHandler: function (e) {
		e.preventDefault();

		var href;

		// Check for both href and xlink:href attribute and get value
		if (e.currentTarget.attributes["xlink:href"]) {
			href = e.currentTarget.attributes["xlink:href"].value;
		}
		else {
			href = e.currentTarget.attributes["href"].value;
		}

		// Resolve the relative path for the requested resource.
		href = this.resolveRelativeURI(href);
		if (href.match(/^http(s)?:/)) {
			window.open(href);
		} 
		else {
			this.model.goToHref(href);
		}
	},

	// Rationale: For the purpose of looking up EPUB resources in the package document manifest, Readium expects that 
	//   all relative links be specified as relative to the package document URI (or absolute references). However, it is 
	//   valid XHTML for a link to another resource in the EPUB to be specfied relative to the current document's
	//   path, rather than to the package document. As such, URIs passed to Readium must be either absolute references or 
	//   relative to the package document. This method resolves URIs to conform to this condition. 
	resolveRelativeURI: function (rel_uri) {
		var relativeURI = new URI(rel_uri);

		// Get URI for resource currently loaded in the view's iframe
		var iframeDocURI = new URI($("#readium-flowing-content").attr("src"));

		return relativeURI.resolve(iframeDocURI).toString();
	},

	applyKeydownHandler : function () {

		var that = this;

		this.$("#readium-flowing-content").contents().keydown(function (e) {

			if (e.which == 39) {
				that.model.paginator.v.pages.goRight();
			}
							
			if (e.which == 37) {
				that.model.paginator.v.pages.goLeft();
			}
		});
	},

	// REFACTORING CANDIDATE: I think this is actually part of the public interface
    goToPage: function(page) {
        // check to make sure we're not already on that page
        if (this.model.get("current_page") != undefined && this.model.get("current_page").indexOf(page) != -1) {
            return;
        }
		var offset = this.calcPageOffset(page).toString() + "px";
		$(this.getBody()).css(this.offset_dir, "-" + offset);
		this.showContent();
        
        // when we change the page, we have to tell MO to update its position
        // if the display now contains a new page
        if (this.model.get("two_up") == false || 
            (this.model.get("two_up") && page % 2 === 1)) {
                this.mediaOverlayController.updatePlaybackForReflowPageChange();
        }
	},

	setFontSize: function() {
		var size = this.model.get("font_size") / 10;
		$(this.getBody()).css("font-size", size + "em");

		// the content size has changed so recalc the number of 
		// pages
		this.setNumPages();
	},

	// Description: we are using experimental styles so we need to 
	//   use modernizr to generate prefixes
	stashModernizrPrefixedProps: function() {
		var cssIfy = function(str) {
			return str.replace(/([A-Z])/g, function(str,m1){ 
				return '-' + m1.toLowerCase(); 
			}).replace(/^ms-/,'-ms-');
		};

		// ask modernizr for the vendor prefixed version
		this.columAxis =  Modernizr.prefixed('columnAxis') || 'columnAxis';
		this.columGap =  Modernizr.prefixed('columnGap') || 'columnGap';
		this.columWidth =  Modernizr.prefixed('columnWidth') || 'columnWidth';

		// we are interested in the css prefixed version
		this.cssColumAxis =  cssIfy(this.columAxis);
		this.cssColumGap =  cssIfy(this.columGap);
		this.cssColumWidth =  cssIfy(this.columWidth);
	},

	getBodyColumnCss: function() {
		var css = {};
		css[this.cssColumAxis] = "horizontal";
		css[this.cssColumGap] = this.gap_width.toString() + "px";
		css[this.cssColumWidth] = this.page_width.toString() + "px";
		css["padding"] = "0px";
		css["margin"] = "0px";
		css["position"] = "absolute";
		css["width"] = this.page_width.toString() + "px";
		css["height"] = this.frame_height.toString() + "px";
		return css;
	},

	injectCFIElements : function () {

		var that = this;
		var contentDocument;
		var epubCFIs;
		var lastPageElementId;

		// Get the content document (assumes a reflowable publication)
		contentDocument = $("#readium-flowing-content").contents()[0];

		// TODO: Could check to make sure the document returned from the iframe has the same name as the 
		//   content document specified by the href returned by the CFI.

		// Inject elements for all the CFIs that reference this content document
		epubCFIs = this.model.get("epubCFIs");
		_.each(epubCFIs, function (cfi, key) {

			if (cfi.contentDocSpinePos === that.model.get("spine_position")) {

				try {
					
					EPUBcfi.Interpreter.injectElement(
						key, 
						contentDocument, 
						cfi.payload,
						["cfi-marker", "audiError"],
	  					[],
	  					["MathJax_Message"]);

					if (cfi.type === "last-page") {
						lastPageElementId = $(cfi.payload).attr("id");
					}
				} 
				catch (e) {

					console.log("Could not inject CFI");
				}
			}
		});

		// This will be undefined unless there is a "last-page" element injected into the page
		return lastPageElementId;
	},

	// Save position in epub
	savePosition : function () {

		var $visibleTextNode;
		var existingCFI;
		var lastPageMarkerExists = false;
		var characterOffset;
		var contentDocumentIdref;
		var packageDocument;
		var generatedCFI;

		// Get first visible element with a text node 
		$visibleTextNode = this.findVisibleTextNode();

		// Check if a last page marker already exists on this page
		try {
			$.each($visibleTextNode.parent().contents(), function () {

				if ($(this).hasClass("last-page")) {
					lastPageMarkerExists = true;
					existingCFI = $(this).attr("data-last-page-cfi");

					// Break out of loop
					return false;
				}
			});
		}
		catch (e) {

			console.log("Could not generate CFI for non-text node as first visible element on page");

			// No need to execute the rest of the save position method if the first visible element is not a text node
			return;
		}

		// Re-add the CFI for the marker on this page and shortcut the method
		// REFACTORING CANDIDATE: This shortcut makes this method confusing, it needs to be refactored for simplicity
		if (lastPageMarkerExists) {

			this.model.addLastPageCFI(existingCFI, this.model.get("spine_position"));
			this.model.save();
			return; 
		}

		characterOffset = this.findVisibleCharacterOffset($visibleTextNode);

		// Get the content document idref
		contentDocumentIdref = this.model.getCurrentSection().get("idref");

		// Get the package document
		// REFACTORING CANDIDATE: This is a temporary approach for retrieving a document representation of the 
		//   package document. Probably best that the package model be able to return this representation of itself.
        $.ajax({

            type: "GET",
            url: this.model.epub.get("root_url"),
            dataType: "xml",
            async: false,
            success: function (response) {

                packageDocument = response;
            }
        });

		// Save the position marker
		generatedCFI = EPUBcfi.Generator.generateCharacterOffsetCFI(
			$visibleTextNode[0], 
			characterOffset, 
			contentDocumentIdref, 
			packageDocument, 
			["cfi-marker", "audiError"], 
			[], 
			["MathJax_Message"]);

		this.model.addLastPageCFI(
			generatedCFI, 
			this.model.get("spine_position"));

		// Save the last page marker been added
		this.model.save();
	},

	adjustIframeColumns: function() {
		var prop_dir = this.offset_dir;
		var $frame = this.$('#readium-flowing-content');
		var page;

		this.setFrameSize();
		this.frame_width = parseInt($frame.width(), 10);
		this.frame_height = parseInt($frame.height(), 10);
		this.gap_width = Math.floor(this.frame_width / 7);
		if(this.model.get("two_up")) {
			this.page_width = Math.floor((this.frame_width - this.gap_width) / 2);
		}
		else {
			this.page_width = this.frame_width;
		}

		// it is important for us to make sure there is no padding or
		// margin on the <html> elem, or it will mess with our column code
		$(this.getBody()).css( this.getBodyColumnCss() );

		// If the first page is offset, adjust the window to only show one page
		if (this.model.get("two_up")) {
			
			var firstPageIsOffset = this.model.getCurrentSection().firstPageOffset();
			var firstPageOffsetValue;

			// Rationale: A current page of [0, 1] indicates that the current display is synthetic, and that 
			//   only the first page should be showing in that display
			// REFACTORING CANDIDATE: This logic is similar to that in pageChangeHandler
			var onFirstPage = 
				this.pages.get("current_page")[0] === 0 &&
			    this.pages.get("current_page")[1] === 1 
			    ? true : false;

			if (firstPageIsOffset && onFirstPage) {

				if (this.model.epub.get("page_prog_dir") === "rtl") {

					firstPageOffset = -(2 * (this.page_width + this.gap_width));
					$frame.css("margin-left", firstPageOffset + "px");
				}
				// Left-to-right pagination
				else {

					firstPageOffset = this.page_width + (this.gap_width * 2);
					$frame.css("margin-left", firstPageOffset + "px");
				}

				page = 1;

			}
			else {

				$frame.css("margin-left", "0px");
				page = this.pages.get("current_page")[0];
			}
		}
		else {

			$frame.css("margin-left", "0px");
			page = this.pages.get("current_page")[0];
		}

		this.setNumPages();
		this.goToPage(page);
	},

	// This is now part of the public interface
	// Description: helper method to get the a reference to the documentElement
	// of the document in this strategy's iFrame.
	// TODO: this is a bad name for this function
	getBody: function() {
		return this.$('#readium-flowing-content').contents()[0].documentElement;
	},

	hideContent: function() {
		$("#flowing-wrapper").css("opacity", "0");
	},

	showContent: function() {
		$("#flowing-wrapper").css("opacity", "1");
	},

	calcPageOffset: function(page_num) {
		return (page_num - 1) * (this.page_width + this.gap_width);
	},

	// Rationale: on iOS frames are automatically expanded to fit the content dom
	// thus we cannot use relative size for the iframe and must set abs 
	// pixel size
	setFrameSize: function() {
		var width = this.getFrameWidth().toString() + "px";
		var height = this.getFrameHeight().toString() + "px";

		this.$('#readium-flowing-content').attr("width", width);
		this.$('#readium-flowing-content').attr("height", height);
		this.$('#readium-flowing-content').css("width", width);
		this.$('#readium-flowing-content').css("height", height);
	},

	getFrameWidth: function() {
		var width;
		var margin = this.model.get("current_margin");
		if (margin === 1) {
			this.model.get("two_up") ? (width = 0.95) : (width = 0.90);
		}
		else if (margin === 2) {
			this.model.get("two_up") ? (width = 0.89) : (width = 0.80);
		}
		else if (margin === 3) {
			this.model.get("two_up") ? (width = 0.83) : (width = 0.70);	
		}
		else if (margin === 4) {
			this.model.get("two_up") ? (width = 0.77) : (width = 0.60);	
		}
		else {
			this.model.get("two_up") ? (width = 0.70) : (width = 0.50);	
		}
		
		return Math.floor( $('#flowing-wrapper').width() * width );
	},

	getFrameHeight: function() {
		return $('#flowing-wrapper').height();
	},

	// Description: calculate the number of pages in the current section,
	//   based on section length : page size ratio
	calcNumPages: function() {

		var body, offset, width, num;
		
		// get a reference to the dom body
		body = this.getBody();

		// cache the current offset 
		offset = body.style[this.offset_dir];

		// set the offset to 0 so that all overflow is part of
		// the scroll width
		body.style[this.offset_dir] = "0px";

		// grab the scrollwidth => total content width
		width = this.getBody().scrollWidth;

		// reset the offset to its original value
		body.style[this.offset_dir] = offset;

		// perform calculation and return result...
		num = Math.floor( (width + this.gap_width) / (this.gap_width + this.page_width) );

		// in two up mode, always set to an even number of pages
		if( num % 2 === 0 && this.model.get("two_up")) {
			//num += 1;
		}
		return num;
	},

    getElemPageNumber: function(elem) {
		
		var $elem;
		var elemWasInvisible = false;
		var rects, shift;
		var elemRectWidth;

		// Rationale: Elements with an epub:type="pagebreak" attribute value are likely to be set as 
		//   display:none, as they indicate the end of a page in the corresponding physical version of a book. We need 
		//   the position of these elements to get the reflowable page number to set in the viewer. Therefore, 
		//   we check if the element has this epub:type value, set it visible, find its location and then set it to 
		//   display:none again. 
		// REFACTORING CANDIDATE: We might want to do this for any element with display:none. 
		$elem = $(elem);
		if ($elem.attr("epub:type") === "pagebreak" && !$elem.is(":visible")) {

			elemWasInvisible = true;
			$elem.show();
		}

		rects = elem.getClientRects();
		if(!rects || rects.length < 1) {
			// if there were no rects the elem had display none
			return -1;
		}

		shift = rects[0][this.offset_dir];

		// calculate to the center of the elem
		// Rationale: The -1 or +1 adjustment is to account for the case in which the target element for which the shift offset
		//   is calculated is at the edge of a page and has 0 width. In this case, if a minor arbitrary adjustment is not applied, 
		//   the calculated page number will be off by 1.   
		elemRectWidth = rects[0].left - rects[0].right;
		if (this.offset_dir === "right" && elemRectWidth === 0) {
			shift -= 1;
		}
		else if (this.offset_dir === "left" && elemRectWidth === 0) {
			shift += 1;
		} // Rationale: There shouldn't be any other case here. The explict second (if else) condition is for clarity.
		shift += Math.abs(elemRectWidth);
		
        // Re-hide the element if it was original set as display:none
        if (elemWasInvisible) {
            $elem.hide();
        }

		// `clientRects` are relative to the top left corner of the frame, but
		// for right to left we actually need to measure relative to right edge
		// of the frame
		if(this.offset_dir === "right") {
			// the right edge is exactly `this.page_width` pixels from the right 
			// edge
			shift = this.page_width - shift;
		}
		// less the amount we already shifted to get to cp
		shift -= parseInt(this.getBody().style[this.offset_dir], 10); 
		return Math.ceil( shift / (this.page_width + this.gap_width) );
	},

	// REFACTORING CANDIDATE: This might be part of the public interface
	getElemPageNumberById: function(elemId) {
        var doc = $("#readium-flowing-content").contents()[0].documentElement;
        // escape periods for jquery
        var elem = $(doc).find("#" + elemId.replace(".", "\\."));
        if (elem.length == 0) {
            return -1;
        }
        else {
            return this.getElemPageNumber(elem[0]);
        }
    },

	pageChangeHandler: function() {
        var that = this;
		this.hideContent();
		setTimeout(function() {
            
			var $reflowableIframe = that.$("#readium-flowing-content");
            if (that.model.get("two_up")) {
				// If the first page is offset, adjust the window to only show one page
				var firstPageIsOffset = that.model.getCurrentSection().firstPageOffset();
				var firstPageOffsetValue;

				// Rationale: A current page of [0, 1] indicates that the current display is synthetic, and that 
				//   only the first page should be showing in that display
				var onFirstPage = 
					that.pages.get("current_page")[0] === 0 &&
				    that.pages.get("current_page")[1] === 1 
				    ? true : false;

				if (firstPageIsOffset && onFirstPage) {

					if (that.model.epub.get("page_prog_dir") === "rtl") {

						firstPageOffset = -(2 * (that.page_width + that.gap_width));
						$reflowableIframe.css("margin-left", firstPageOffset + "px");
					}
					// Left-to-right pagination
					else {

						firstPageOffset = that.page_width + (that.gap_width * 2);
						$reflowableIframe.css("margin-left", firstPageOffset + "px");
					}
                    that.goToPage(1);
				}
				else {

					$reflowableIframe.css("margin-left", "0px");
                    that.goToPage(that.pages.get("current_page")[0]);
				}
			}
			else {

				$reflowableIframe.css("margin-left", "0px");
                that.goToPage(that.pages.get("current_page")[0]);
			}
            that.savePosition();

		}, 150);
	},

	windowSizeChangeHandler: function() {
		this.adjustIframeColumns();
		
		// Make sure we return to the correct position in the epub (This also requires clearing the hash fragment) on resize.
		this.goToHashFragment(this.model.get("hash_fragment"));
	},
    
	marginCallback: function() {
		this.adjustIframeColumns();
	},

	// Rationale: sadly this is just a reprint of what is already in the
	//   themes stylesheet. It isn't very DRY but the implementation is
	//   cleaner this way
	themes: {
		"default-theme": {
			"background-color": "white",
			"color": "black",
			"mo-color": "#777"
		},

		"vancouver-theme": {
			"background-color": "#DDD",
			"color": "#576b96",
			"mo-color": "#777"
		},

		"ballard-theme": {
			"background-color": "#576b96",
			"color": "#DDD",
			"mo-color": "#888"
		},

		"parchment-theme": {
			"background-color": "#f7f1cf",
			"color": "#774c27",
			"mo-color": "#eebb22"
		},

		"night-theme": {
			"background-color": "#141414",
			"color": "white",
			"mo-color": "#666"
		}
	},

	injectTheme: function() {
		var theme = this.model.get("current_theme");
		if(theme === "default") theme = "default-theme";
		$(this.getBody()).css({
			"color": this.themes[theme]["color"],
			"background-color": this.themes[theme]["background-color"]
		});
		
		// stop flicker due to application for alternate style sheets
		// just set content to be invisible
		$("#flowing-wrapper").css("visibility", "hidden");
		this.activateEPubStyle(this.getBody());

		// wait for new stylesheets to parse before setting back to visible
		setTimeout(function() {
			$("#flowing-wrapper").css("visibility", "visible");	
		}, 100);
	},

	setNumPages: function() {
		var num = this.calcNumPages();
		this.pages.set("num_pages", num);
	}
});
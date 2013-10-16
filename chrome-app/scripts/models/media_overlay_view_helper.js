// Description: This model provides helper methods related to Media Overlay functionality required by the fixed and reflowable views.
// Rationale: While these helpers could be included on the view objects themselves, this model was created to encapsulate view functionality
//   related to the display of media overlays for three reasons: First, the requirements for media overlays are expected to grow, which
//   would have produced larger and larger view models (by code size). Second, the primary responsibility of the pagination views is to paginate epub content
//   and provide an interface for accessing rendered content; adding MO methods to those objects would have clouded the abstraction. Third, MO
//   is the primary responsiblity of one contributor. Encapsulating MO view functionality in this model makes it easier for contributors to 
//   focus on their areas of responsibility. 

// REFACTORING CANDIDATE: The interfaces for the methods here are not particularly tight. In some cases, entire views are being 
//   passed to the methods. It would be better if the interfaces were built around something consistent; the page body being passed, 
//   etc. 
//   Interaction with the "pagination" could be improved too. It would be ideal to encorporate the concept of the "currently rendered
//   pages" into the methods here; this would use the ReadiumPagination model, which abstracts this concept. Currently, these methods
//   are working through the backbone views, but essentially using the DOM.

Readium.Models.MediaOverlayViewHelper = Backbone.Model.extend({

	// ------------------------------------------------------------------------------------ //
	//  "PUBLIC" METHODS (THE API)                                                          //
	// ------------------------------------------------------------------------------------ //

	initialize: function () {
		this.epubController = this.get("epubController");
	},

    // active class comes from the package document metadata
    // authors can specify the class name they want to have applied to 
    // active MO text fragments
    addActiveClass: function(fragElm) {
        var activeClass = this.getActiveClass();
        fragElm.toggleClass(activeClass, true);
    },

    removeActiveClass: function(body) {
        if (body != null && body != undefined) {   
            var activeClass = this.getActiveClass();
            var lastFrag = $(body).find("." + activeClass);
            lastFrag.toggleClass(activeClass, false);
            return lastFrag;
        }
        return null;
    },
    
    // we're not using themes for fixed layout, so just apply the active class name to the
    // current MO fragment, so that any authored styles will be applied.
    renderFixedLayoutMoFragHighlight: function(currentPages, currentMOFrag, fixedLayoutView) {
        var that = this;

        $.each(currentPages, function(idx) {
           var body = fixedLayoutView.getPageBody(this);
           that.removeActiveClass(body);
        }); 
        
		if(currentMOFrag) {
    		$.each(currentPages, function(idx) {
                var body = fixedLayoutView.getPageBody(this);
                // escape periods for jquery
                var newFrag = $(body).find("#" + currentMOFrag.replace(".", "\\."));
                if (newFrag.length > 0) {
                	that.addActiveClass(newFrag);	
                } 
           });
		}
	},

	renderFixedMoPlaying: function(currentPages, MOIsPlaying, fixedLayoutView) {
        var that = this;
        // if we are using the author's style for highlighting, then just clear it if we are not playing
        if (this.authorActiveClassExists()) {
            if (!MOIsPlaying) {
        		// get rid of the last highlight
                $.each(currentPages, function(idx) {
                   var body = fixedLayoutView.getPageBody(this);
                   that.removeActiveClass(body);
                }); 
            }
        }
	},
    

    // highlight the text
	renderReflowableMoFragHighlight: function(currentTheme, reflowableView, currentMOFrag) {
        if (currentTheme === "default") {
			currentTheme = "default-theme";
		}
        // get rid of the last highlight
		var body = reflowableView.getBody();
        var lastFrag = this.removeActiveClass(body);
        
        // if the author did not define an active class themselves
        if (this.authorActiveClassExists() == false) {
            if (lastFrag) {
                $(lastFrag).css("color", "");
            }
        }
        if (currentMOFrag) {
            // add active class to the new MO fragment
            // escape periods for jquery
            var newFrag = $(body).find("#" + currentMOFrag.replace(".", "\\."));
            if (newFrag.length > 0) {
                this.addActiveClass(newFrag);
                if (this.authorActiveClassExists() == false) {
                    $(newFrag).css("color", reflowableView.themes[currentTheme]["color"]);   
                }
            }
            // If the element corresponding to currentMOFrag wasn't found, it might be because the document hasn't 
            // completely loaded yet. Flag the view for re-highlighting.
            // Example of where this helps: load Moby Dick, start playback in Ch 1, go to Ch 2 from Toc, back to Ch 1, back to Ch 2. 
            // the highlight for the first phrase of the spine item isn't consistent without this rehighlighting function.
            else {
                reflowableView.flagRehighlight();
            }
		}
	},	
    

	// reflowable pagination uses default readium themes, which include a 'fade' effect on the inactive MO text
	renderReflowableMoPlaying: function(currentTheme, MOIsPlaying, reflowableView) {
		
        // if we are using the author's default style for highlighting, then just clear it if we are not playing
        if (this.authorActiveClassExists()) {
            if (!MOIsPlaying) {
        		// get rid of the last highlight
        		var body = reflowableView.getBody();
                var lastFrag = this.removeActiveClass(body);
            }
        }
        else {
    		if (currentTheme === "default") { 
    			currentTheme = "default-theme";
    		}
        
    		var body = reflowableView.getBody();
            if (MOIsPlaying) {
                // change the color of the body text so it looks inactive compared to the MO fragment that is playing
    			$(body).css("color", reflowableView.themes[currentTheme]["mo-color"]);
    		}
    		else {
                // reset the color of the text to the theme default
    			$(body).css("color", reflowableView.themes[currentTheme]["color"]);	

                // remove style info from the last MO fragment
                var lastFrag = this.removeActiveClass(reflowableView.getBody());
                if (lastFrag) {
                    $(lastFrag).css("color", "");
                }
    		}
        }
		
	},

	// ------------------------------------------------------------------------------------ //
	//  "PRIVATE" HELPERS                                                                   //
	// ------------------------------------------------------------------------------------ //

    getActiveClass: function() {
        var activeClass = this.epubController.packageDocument.get("metadata").active_class;
        if (activeClass == "") {
            // we need an active class value to use, whether the author specified it or not
            activeClass = "-readium-epub-media-overlay-active";
        }
        return activeClass;
    },
    
    // did the author supply an active-class metdata value
    authorActiveClassExists: function() {
        var activeClass = this.epubController.packageDocument.get("metadata").active_class;
        return activeClass == "" ? false : true;
    }
});
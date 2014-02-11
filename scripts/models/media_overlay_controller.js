// Description: This model is the primary integration layer between media overlays and the rest of Readium
// It tracks which MO is playing, and controls what happens to playback when a page turns or an href gets loaded

Readium.Models.MediaOverlayController = Backbone.Model.extend({

	defaults: {
        "state": "unavailable", // "playing", "paused", "not_started", "unavailable"
		"mo_text_id": null, // the current MO text fragment identifier
        "rate": 1.0, // the playback rate
        "volume": 1.0 // the volume
	},

	// ------------------------------------------------------------------------------------ //
	//  "PUBLIC" METHODS (THE API)                                                          //
	// ------------------------------------------------------------------------------------ //

	initialize: function () {

        // the current media overlay
        this.mo = null;
        
        // for mute/unmute
        this.savedVolume = 0;
        
        // the node to start playback at
        this.targetNode = null;
        
        // the current spine item
        this.currentSpineItem = null;
        
        // flag that MO is processing a text src
        this.isProcessingTextSrc = false;
        
        // flag that the user changed the page
        this.flagUserPageChange = false;
        
        // flag that the user's position was restored
        this.flagRestoredPosition = false;
        
        // readium epub controller, set as a constructor option
		this.epubController = this.get("epubController");
		
        // readium reflowable pagination view
        this.view = null;
        
        this.on("change:rate", this.rateChanged, this);
        this.on("change:volume", this.volumeChanged, this);  
        
        this.epubController.on("change:spine_position", this.handleSpineChanged, this);   
        
        // print debug statements
        this.consoleTrace = false;   
	},
    
    setView: function(view) {
        this.view = view;
    },
    
    // hooked up to the 'play/pause' button
	playMo: function(forcePosition) {
        if (this.currentSpineItem == null || !this.currentSpineItem.hasMediaOverlay()) {
            this.mo = null;
            this.set("state", "unavailable");
            this.debugPrint("No overlay available for this spine item.");
            return;
        }
        
        this.debugPrint("playMo");
        
        // just verify that we have the correct MO loaded
        // except when forcePosition is false -- then the MO was purposely set 
        // to something different than our current spine item, because the user navigated there,
        // and Readium will listen to MO regarding text display URLs
        if (forcePosition && this.currentSpineItem.getMediaOverlay() != this.mo) {
            this.mo = this.currentSpineItem.getMediaOverlay();
            this.set("state", "not_started");
        }
        if (this.mo == null) {
            return;
        }
        this.mo.setVolume(this.get("volume"));
        this.mo.setRate(this.get("rate"));
        this.mo.off(); // just to be safe
        this.mo.on("change:current_text_src", this.handleMoTextSrcChanged, this);
		this.mo.on("change:is_document_done", this.handleMoDocumentDoneChanged, this);
        
        // if we are processing a new page caused either by the user going to prev/next page
        // or by the restored position that gets loaded initially
        // there's a reason why this type of action is dealt with in 2 places: here and also mid-playback (see
        // updatePlaybackForReflowPageChange() ). By the time the user presses play, enough screen refreshing has
        // taken place that we can be more certain that the visible elements are the correct ones.
        if (!this.currentSpineItem.isFixedLayout() && (this.flagUserPageChange || this.flagRestoredPosition)) {
            this.flagUserPageChange = false;
            this.flagRestoredPosition = false;
            var visibleElms = this.view.findVisiblePageElements();
            this.targetNode= this.findFirstOnPageReflow(visibleElms);
            this.set("state", "not_started");
        }
        
        if (this.get("state") == "paused") {
            this.set("state", "playing");
            this.resumeMo();
        }
        else {
            this.mo.reset();
            this.set("state", "playing");
            var target = this.targetNode;
            this.targetNode = null;
            this.mo.startPlayback(target);            
        }
	},

    // hooked up to the 'play/pause' button
	pauseMo: function() {
        if (this.mo) {
            this.set("state", "paused");
            this.mo.off();
			this.mo.pause();
		}
	},
    
    // hooked up to the 'mute/unmute' button
    mute: function() {
        if (this.mo) {
            // unmute
            if (this.mo.getVolume() == 0) {
                // if the last-used volume was already at 0, restore it to a quiet level
                if (this.savedVolume == 0) {
                    this.savedVolume = .1;
                }
                this.set("volume", this.savedVolume);
                
            }
            // mute
            else {
                this.savedVolume = this.mo.getVolume();
                this.set("volume", 0);
            }
        }
    },
    
    // hooked up to the volume slider
    volumeChanged: function() {
        if (this.mo) {
            this.mo.setVolume(this.get("volume"));
        }
    },
    
    // hooked up to the rate slider
    rateChanged: function() {
        if (this.mo) {
            this.mo.setRate(this.get("rate"));
        }
    },
    
    increaseVolume: function() {
        var curr = this.get("volume");
        if (curr >= 1.0) {
            return;
        }
        if (curr + 0.1 >= 1.0) {
            this.set("volume", 1.0);
        }
        else {
            this.set("volume", curr + 0.1);
        }
    },
    
    decreaseVolume: function() {
        var curr = this.get("volume");
        if (curr <= 0) {
            return;
        }
        if (curr - 0.1 < 0) {
            this.set("volume", 0);
        }
        else {
            this.set("volume", curr - 0.1);
        }
        
    },
    
    increaseRate: function() {
        var curr = this.get("rate");
        if (curr >= 2.5) {
            return;
        }
        if (curr + 0.1 >= 2.5) {
            this.set("rate", 2.5);
        }
        else {
            this.set("rate", curr + 0.1);
        }
    },
    
    decreaseRate: function() {
        var curr = this.get("rate");
        if (curr <= 0.5) {
            return;
        }
        if (curr - 0.1 <= 0.5) {
            this.set("rate", 0.5);
        }
        else {
            this.set("rate", curr - 0.1);
        }
    },
    
    resetRate: function() {
        this.set("rate", 1.0);
    },
    
    // move to a specific point in the book
    // this could be the start of a section or bookmark etc
    goToHref: function(href) {
        // if we are in the middle of processing our own src, ignore it
        if (this.isProcessingTextSrc) {
            return;
        }
        
        this.debugPrint("goToHref");
        var wasPlaying = this.get("state") == "playing";
        if (wasPlaying) {
            this.pauseMo();
        }
            
        var splitUrl = href.match(/([^#]*)(?:#(.*))?/);
        var spinePos = this.epubController.packageDocument.spineIndexFromHref(splitUrl[1]);
        var spineItem = this.epubController.packageDocument.getSpineItem(spinePos);
            
        if (spineItem.hasMediaOverlay()) {
            this.mo = spineItem.getMediaOverlay();
            this.mo.reset();
            this.set("state", "not_started");
            // find the target node for the URI
            this.targetNode = this.findTarget(spineItem, splitUrl[2]);
            // if MO was playing, then stop and restart at this point
            if (wasPlaying) {
                this.playMo(false);
            }
        }
    },
    
    // called by the reflowable page view when the page changes
    // applies only during playback
    updatePlaybackForReflowPageChange: function() {
        // just to be safe: ignore fxl
        if (this.currentSpineItem.isFixedLayout()) {
            return;
        }
        
        // we only care about this if we are in the middle of playback
        // this is safer because readium might call this function several times
        if (this.get("state") == "playing" && 
            (this.flagUserPageChange || this.flagRestoredPosition)) {
            
            var visibleElms = this.view.findVisiblePageElements();
            
            // make sure there are actually elements on the page
            // if not, we can leave the flagged variables as-is, and 
            // this function will get called again by reflowable pagination view
            if (visibleElms.length > 0) {
                this.debugPrint("updatePlaybackForReflowPageChange");
                this.pauseMo();
            
                this.flagUserPageChange = false;
                this.flagRestoredPosition = false;
                this.set("state", "not_started");
                
                // make sure we're on the right spine item
                if (this.currentSpineItem.hasMediaOverlay()) {
                    if (this.mo != this.currentSpineItem.getMediaOverlay()) {
                        this.mo = this.currentSpineItem.getMediaOverlay();
                    }
                    this.mo.reset();
                    this.targetNode = this.findFirstOnPageReflow(visibleElms);  
                    this.set("mo_text_id", null);
                    this.playMo(true);
                }
                else {
                    this.mo = null;
                    this.set("mo_text_id", null);
                    this.set("state", "unavailable");
                }
            }
        }
    },
    
    // called by the page view when the user used "go to (prev/next) page"
    // if this flag is set, MO will respond to page refresh events
    // this function is really only useful for reflowable content
    userChangedPage: function() {
        this.flagUserPageChange = true;   
    },
    
    restoredPosition: function() {
        this.flagRestoredPosition = true;
    },
    
    // ------------------------------------------------------------------------------------ //
	//  "PRIVATE" METHODS                                                                   //
	// ------------------------------------------------------------------------------------ //
    resumeMo: function() {
        this.set("mo_text_id", null); // clear it so that any listeners re-hear the event
        this.handleMoTextSrcChanged();
        this.mo.resume();
    },
    
    handleMoTextSrcChanged: function() {
        this.debugPrint("handleMoTextSrcChanged " + this.mo.get("current_text_src"));
        this.isProcessingTextSrc = true;
        var textSrc = this.mo.get("current_text_src");
        if (textSrc == null) {
            this.set("mo_text_id", null);
            return;
        }
        
        this.epubController.goToHref(textSrc);
        var frag = "";
        if (textSrc.indexOf("#") != -1 && textSrc.indexOf("#") < textSrc.length -1) {
            frag = textSrc.substr(textSrc.indexOf("#")+1);
        }
        this.set("mo_text_id", frag);
        this.isProcessingTextSrc = false;
    },
    
    // caveat: this gets called when is_document_done changes, so we need to check if the document is indeed done
    handleMoDocumentDoneChanged: function() {
        if (this.mo != null && this.mo != undefined) {
            if (this.mo.get("is_document_done") == false) {
                return;
            }
        }
        this.debugPrint("handleMoDocumentDoneChanged");
        this.pauseMo();
        
        // advance the spine position
        if (this.epubController.hasNextSection()) {
            this.epubController.goToNextSection();
            this.playMo(true);
        }
    },
    
    // this acts as page change handler for fxl content
    handleSpineChanged: function() {
        // sometimes the spine changed event fires but the spine didn't actually change
        if (this.epubController.getCurrentSection() == this.currentSpineItem) {
            return;
        }
        this.currentSpineItem = this.epubController.getCurrentSection();
        
        if (!this.currentSpineItem.isFixedLayout()) {
            return;
        }
        
        var wasPlaying = this.get("state") == "playing";    
        if (wasPlaying) {
            this.pauseMo();
        }
          
        // make sure we're on the right spine item
        if (this.currentSpineItem.hasMediaOverlay()) {
            if (this.mo != this.currentSpineItem.getMediaOverlay()) {
                this.mo = this.currentSpineItem.getMediaOverlay();
            }
        }
        else {
            this.mo = null;
            this.set("mo_text_id", null);
            this.set("state", "unavailable");
        }
        
        if (this.mo == null) {
            return;
        }
        this.mo.reset();
        this.targetNode = this.findFirstOnPageFxl();
        this.set("state", "not_started");
        if (wasPlaying) {
            this.playMo(true);
        }
    },
    
    // find the MO starting point closest to targetId
    findTarget: function(spineItem, targetId) {
        
        if (targetId == null || targetId == undefined || targetId == "" ||
            spineItem == null) {
            return null;
        }
        // two issues here:
        // 1. MO might not have a corresponding <text> pointing to #fragId
        // In this case, we have to find the next-closest
        //
        // 2. we have to look at all elements, not just the currently visible ones. the pages get refreshed a few times
        // and the target element might not be displayed until the second time around. however, we need to find what the
        // most reasonable MO target is and can't risk coming up with nothing (because then MO starts at the top)
        
        var mo = spineItem.getMediaOverlay();
        var docHref = this.epubController.packageDocument.resolveUri(spineItem.get("href"));
        var startHref = docHref + "#" + targetId;
        var node = null;
        $.ajax({
            url: docHref,
            async: false,
            success: function(data, status, jqXHR) {
                var allElms = $(data).find("[id]");
                var foundStart = false; 
                for (var i = 0; i<allElms.length; i++) {
                    var id = $(allElms[i]).attr("id");
                    var src = docHref + "#" + id;
                    if (src == startHref) {
                        foundStart = true;
                    }
                    // once we found our starting point in the set, start looking at MO nodes
                    if (foundStart) {
                        node = mo.findNodeByTextSrc(src);
                        if (node) {
                            break;
                        }
                    }
                }
            }
        });
        return node;
    },
    
    // find the MO element for the first visible page element with an MO <text> equivalent
    findFirstOnPageReflow: function(visibleElms) {
        // this is only useful for reflowable content
        if (this.currentSpineItem.isFixedLayout()) {
            return null;
        }
        
        if (visibleElms.length == 0) {
            this.debugPrint("No visible page elements");
            return null;
        }
        
        var docHref = this.currentSpineItem.resolveUri(this.currentSpineItem.get("href"));
        var node = null;
        for (var i = 0; i<visibleElms.length; i++) {
            var id = $(visibleElms[i]).attr("id");
            var src = docHref + "#" + id;
            
            node = this.mo.findNodeByTextSrc(src);
            if (node) {
                break;
            }
        }
        return node;
    },
    
    // find the MO element for the first element in the current spine item with an MO equivalent
    findFirstOnPageFxl: function() {
        var docHref = this.currentSpineItem.resolveUri(this.currentSpineItem.get("href"));
        var mo = this.currentSpineItem.getMediaOverlay();
        
        $.ajax({
            url: docHref,
            async: false,
            success: function(data, status, jqXHR) {
                var allElms = $(data).find("[id]");
                for (var i = 0; i<allElms.length; i++) {
                    var id = $(allElms[i]).attr("id");
                    var src = docHref + "#" + id;
                    node = mo.findNodeByTextSrc(src);
                    if (node) {
                        break;
                    }
                }
            }
        });
        return node;
    },
    
    debugPrint: function(msg) {
        if (this.consoleTrace) {
            console.log("MO: " + msg);
        }
    }
});
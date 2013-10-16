// loads and plays a single SMIL document
Readium.Models.MediaOverlay = Backbone.Model.extend({
    audioplayer: null,
    smilModel: null,
    consoleTrace: false,
    url: null,
    urlObj: null,
    
    // observable properties
    defaults: {
        current_text_src: null,    
        has_started_playback: false,
        is_document_done: false,
        is_playing: false,
        is_ready: false
    },
    
    initialize: function() {
        var self = this;
        this.audioplayer = new Readium.Models.AudioClipPlayer();

        // always know whether we're playing or paused
        this.audioplayer.setNotifyOnPause(function() {
            self.set({is_playing: self.audioplayer.isPlaying()});
        });
        this.audioplayer.setNotifyOnPlay(function(){
           self.set({is_playing: self.audioplayer.isPlaying()});
        });    
    },
    
    // set the URL before calling fetch()
    setUrl: function(smilUrl) {
        this.url = smilUrl;
        this.urlObj = new URI(this.url);
    },
    
    // start retrieving the data
    fetch: function(options) {
        this.set({is_ready: false});
        options = options || {};
        options.dataType="xml";
        Backbone.Model.prototype.fetch.call(this, options);
    },
    
    // backbone fetch() callback; passes in an xml data object
    parse: function(xml) {
        var self = this;
        this.smilModel = new Readium.Models.SmilModel();
        this.smilModel.setUrl(this.url);
        this.smilModel.setNotifySmilDone(function() {
            self.debugPrint("document done");
            self.set({is_document_done: true});
        });
        
        // very important piece of code: attach render functions to the model
        // at runtime, 'this' is the node in question
        this.smilModel.addRenderers({            
            "audio": function() {
                // have the audio player inform the node directly when it's done playing
                var thisNode = this;
                self.audioplayer.setNotifyClipDone(function() {
                    thisNode.notifyChildDone();
                });
                var isJumpTarget = false;
                if (this.hasOwnProperty("isJumpTarget")) {
                    isJumpTarget = this.isJumpTarget;
                    // reset the node's property
                    this.isJumpTarget = false;
                }

                // play the node
                self.audioplayer.play($(this).attr("src"), parseFloat($(this).attr("clipBegin")), parseFloat($(this).attr("clipEnd")), isJumpTarget);
            }, 
            "text": function(){
                var src = $(this).attr("src");
                self.debugPrint("Text: " + src);
                self.set("current_text_src", src);
            }
        });
        
        // start the playback tree at <body>
        var smiltree = $(xml).find("body")[0]; 
        this.smilModel.build(smiltree);
        this.set({is_ready: true});
    },
    // start playback
    // node is a SMIL node that indicates the starting point
    // if node is null, playback starts at the beginning
    startPlayback: function(node) {
        if (this.get("is_ready") === false) {
            this.debugPrint("document not ready");
            return;
        }
        this.set({is_document_done: false});
        this.set({has_started_playback: true});
        this.smilModel.render(node);        
    },
    pause: function() {
        if (this.get("is_ready") == false) {
            this.debugPrint("document not ready");
            return;
        }
        if (this.get("has_started_playback") == false) {
            this.debugPrint("can't pause: playback not yet started");
            return;
        }
        this.audioplayer.pause();
    },
    resume: function() {
        if (this.get("is_ready") == false) {
            this.debugPrint("document not ready");
            return;
        }
        if (this.get("has_started_playback") == false) {
            this.debugPrint("can't resume: playback not yet started");
            return;
        }
        this.audioplayer.resume();        
    },
    findNodeByTextSrc: function(src) {
        if (this.get("is_ready") == false) {
            this.debugPrint("document not ready");
            return null;
        }
        
        if (src == null || src == undefined || src == "") {
            return null;
        }
        
        var elm = this.smilModel.findNodeByAttrValue("text", "src", src);
        if (elm == null){
            elm = this.smilModel.findNodeByAttrValue("seq", "epub:textref", src);
        }    
        return elm;
    },
    setVolume: function(value) {
        this.audioplayer.setVolume(value);
    },
    setRate: function(value) {
        this.audioplayer.setRate(value);
    },
    getVolume: function() {
        return this.audioplayer.getVolume();
    },
    getRate: function() {
        return this.audioplayer.getRate();
    },
    reset: function() {
        this.set("current_text_src", null);
        this.set("has_started_playback", false);
        this.audioplayer.reset();
    },
    setConsoleTrace: function(onOff) {
        this.consoleTrace = onOff;
        this.audioplayer.setConsoleTrace(onOff);
    },
    debugPrint: function(str) {
        if (this.consoleTrace) {
            console.log("MediaOverlay: " + str);
        }
    }
});
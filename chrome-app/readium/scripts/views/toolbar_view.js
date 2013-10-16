Readium.Views.ToolbarView = Backbone.View.extend({

	el: "#toolbar-el",

	initialize: function() {
		this.model.on("change:toolbar_visible", this.renderBarVisibility, this);
		this.model.on("change:full_screen", this.renderFullScreen, this);
		this.model.on("change:current_theme", this.renderThemeButton, this);
        this.model.on("change:spine_position", this.renderMoButtons, this);
        
        var moController = this.model.get("media_overlay_controller");
        moController.on("change:volume", this.renderVolumeButton, this);
        moController.on("change:rate", this.renderRateButton, this);  
	},

	render: function() {
		this.renderBarVisibility();
		this.renderFullScreen();
		this.renderThemeButton();
		this.renderTitle();
		return this;
	},

	renderBarVisibility: function() {
		var visible = this.model.get("toolbar_visible");
		this.$('#show-toolbar-button').toggle( !visible );
		this.$('#toolbar-title').toggle( !visible );
		this.$('#top-bar').toggle( visible );
		return this;
	},

	renderFullScreen: function() {
		var isFs = this.model.get("full_screen");
		this.$("#go-to-fs-ico").toggle( !isFs );
		this.$("#leave-fs-ico").toggle( isFs );
		$('#fs-toggle-btn').attr('title', isFs ? 'Fullscreen on' : 'Fullscreen off');
		$('#fsOT').html(isFs ? 'Fullscreen on' : 'Fullscreen off');
		return this;
	},

	renderThemeButton: function() {
		var isNight = this.model.get("current_theme") === "night-theme";
		this.$('#night-to-day-ico').toggle(isNight);
		this.$('#day-to-night-ico').toggle(!isNight);
		$('#nightmode-btn').attr('title', isNight ? 'Nightmode on' : 'Nightmode off');
		$('#nmOT').html(isNight ? 'Nightmode on' : 'Nightmode off');
		return this;
	},

	renderTitle: function() {
		var title = this.model.epub.get("title");
		this.$('#toolbar-title').html(title);
		return this;
	},
    
    renderMoButtons: function() {
        if (this.model.getCurrentSection().hasMediaOverlay()) {
            $("#play-mo-btn").show();
            $("#mo-volume-btn-group").show();
            $("#mo-rate-btn-group").show();
            $("#mo-volume-slider-OT").show();
            $("#mo-rate-slider-OT").show();
            this.renderVolumeButton();
            this.renderRateButton();
        }
        else {
            $("#play-mo-btn").hide();
            $("#mo-volume-btn-group").hide();
            $("#mo-rate-btn-group").hide();
            $("#mo-volume-slider-OT").hide();
            $("#mo-rate-slider-OT").hide();
        }
    },
    
    renderVolumeButton: function() {
        var moController = this.model.get("media_overlay_controller");
        var value = moController.get("volume");
        $("#mo-volume-slider").val(value);
        
        var isMuted = moController.get("volume") == 0;
        this.$('#mo-volume-btn').toggle(!isMuted);
    	this.$('#mo-volume-muted-btn').toggle(isMuted);
    },
    
    renderRateButton: function() {
        var moController = this.model.get("media_overlay_controller");
        var value = moController.get("rate");
        $("#mo-rate-slider").val(value);
    },
    
	events: {
		"click #hide-toolbar-button": "hide_toolbar",
		"click #show-toolbar-button": "show_toolbar",
		"click #fs-toggle-btn": "toggle_fs",
		"click #toggle-toc-btn": "toggle_toc",
		"click #nightmode-btn": "toggle_night_mode",
		"click #play-mo-btn": "play_mo",
        "change #mo-volume-slider": "set_mo_volume",
        "click #mo-volume-btn": "mute_mo",
        "click #mo-volume-muted-btn": "mute_mo",
        "change #mo-rate-slider": "set_mo_rate",
        "click #mo-rate-btn": "reset_mo_rate"
	},

	show_toolbar: function(e) {
		e.preventDefault();
		this.model.set("toolbar_visible", true);
	},

	hide_toolbar: function(e) {
		e.preventDefault();
		this.model.set("toolbar_visible", false);
	},

	toggle_fs: function(e) {
		e.preventDefault();
		this.model.toggleFullScreen();
	},

	toggle_toc: function(e) {
		e.preventDefault();
		this.model.toggleToc();
	},

	toggle_night_mode: function() {
		var current_theme = this.model.get("current_theme");
		if(current_theme === "night-theme") {
			this.model.set("current_theme", "default-theme");
		}
		else {
			this.model.set("current_theme", "night-theme");
		}
		this.model.save();
	},

    // toggle play/pause
	play_mo: function() {
        var moController = this.model.get("media_overlay_controller");
		if (moController.get("state") == "playing") {
            moController.pauseMo();
		}
		else {
			moController.playMo(true);
        }
	},
    
    set_mo_volume: function() {
        var slider = $("#mo-volume-slider");
        var value = parseFloat(slider.val()).toFixed(1); 
        var moController = this.model.get("media_overlay_controller");
        moController.set("volume", value);
        slider.attr("aria-valuenow", value);
    },
    
    mute_mo: function() {
        var moController = this.model.get("media_overlay_controller");
        // this function toggles between mute and unmute
        moController.mute();
    },
    
    set_mo_rate: function() {
        var slider = $("#mo-rate-slider");
        var value = parseFloat(slider.val()).toFixed(1); 
        var moController = this.model.get("media_overlay_controller");
        moController.set("rate", value);
        slider.attr("aria-valuenow", value);
    },
    
    reset_mo_rate: function() {
        var moController = this.model.get("media_overlay_controller");
        moController.resetRate();
    }
    
});

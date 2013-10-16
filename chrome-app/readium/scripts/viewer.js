// REFACTORING CANDIDATE: Parts of this model are making calls to the current view through the epubController->paginator->view->etc., 
//   that is a lot of indirection. Perhaps epubController shouldn't be at the centre of this model anymore.

Readium.Views.ViewerApplicationView = Backbone.View.extend({
	el: 'body',

	uiVisible: false,

	initialize: function() {
		
		this.model.on("change:full_screen", this.toggleFullscreen, this);

		this.model.on("change:current_theme", this.renderTheme, this);
		this.model.on("change:toolbar_visible", this.renderPageButtons, this);
		this.model.on("change:toc_visible", this.renderTocVisible, this);

		this.optionsPresenter = new Readium.Models.OptionsPresenter({
			book: this.model
		});
		this.optionsView = new Readium.Views.OptionsView({model: this.optionsPresenter});
		this.optionsView.render();

		// the top bar
		this.toolbar = new Readium.Views.ToolbarView({model: _epubController});
		this.toolbar.render();

		// the table of contents
		this.model.on("change:has_toc", this.init_toc, this);

		this.addGlobalEventHandlers();

$('#bar-logo').attr('aria-pressed', 'false');
$('#readium-info').on('shown', function(){
$('#version-info').focus();
setTimeout(function(){
$('#bar-logo').attr('aria-pressed', 'true');
}, 1);
})
.on('hidden', function(){
setTimeout(function(){
$('#bar-logo').attr('aria-pressed', 'false').focus();
}, 1);
});

Acc.title = this.model.get('title') + ', by ' + this.model.get('author');

	},

	toggleFullscreen: function() {
		if(this.model.get("full_screen")) {
			document.documentElement.webkitRequestFullScreen();	
		}
		else {
			document.webkitCancelFullScreen();				
		}
	},

	addGlobalEventHandlers: function() {
		var book = this.model;
		var that = this;
		window.onresize = function(event) {
			book.trigger("repagination_event");
		}

		$(document).keydown(function(e) {
            // right arrow
            if(e.which == 39) {
				that.model.paginator.v.pages.goRight();
			}
			
            // left arrow	
			if(e.which == 37) {
				that.model.paginator.v.pages.goLeft();
			}
            
            // Control over media overlays rate and volume
            // keyboard shortcuts improve slider accessibility
                        
            // F7
            if (e.which == 118 && !e.shiftKey) {
                that.model.get("media_overlay_controller").increaseVolume();
            }
            
            // Shift + F7
            if (e.which == 118 && e.shiftKey) {
                that.model.get("media_overlay_controller").decreaseVolume();
            }
            
            // F9
            if (e.which == 120 && !e.shiftKey) {
                that.model.get("media_overlay_controller").increaseRate();
            }
            
            // Shift + F9
            if (e.which == 120 && e.shiftKey) {
                that.model.get("media_overlay_controller").decreaseRate();
            }            
		});

		$("#readium-book-view-el").on("swipeleft", function(e) {
			e.preventDefault();
			that.model.paginator.v.pages.goRight();
			
		});

		$("#readium-book-view-el").on("swiperight", function(e) {
			e.preventDefault();
			that.model.paginator.v.pages.goLeft();
		});
	},

	render: function() {
		// right now we dont do anything but 
		// convention is to return this from render
		this.renderTheme();
		this.renderPageButtons();
		this.renderTocVisible();
		return this; 
	},

	renderPageButtons: function() {
		var vis = this.model.get("toolbar_visible");
		this.$("#prev-page-button").toggle(vis);
		this.$("#next-page-button").toggle(vis);
		return this;
	},

	renderTheme: function() {
		var theme = this.model.get("current_theme");
		this.$el.toggleClass("default-theme", "default-theme" === theme);
		this.$el.toggleClass("night-theme", "night-theme" === theme);
		this.$el.toggleClass("parchment-theme", "parchment-theme" === theme);
		this.$el.toggleClass("ballard-theme", "ballard-theme" === theme);
		this.$el.toggleClass("vancouver-theme", "vancouver-theme" === theme);

		this.$("#readium-book-view-el").toggleClass("default-theme", "default-theme" === theme);
		this.$("#readium-book-view-el").toggleClass("night-theme", "night-theme" === theme);
		this.$("#readium-book-view-el").toggleClass("parchment-theme", "parchment-theme" === theme);
		this.$("#readium-book-view-el").toggleClass("ballard-theme", "ballard-theme" === theme);
		this.$("#readium-book-view-el").toggleClass("vancouver-theme", "vancouver-theme" === theme);
	},

	renderTocVisible: function() {
var vis = this.model.get("toc_visible");
$('#toggle-toc-btn').attr('aria-pressed', vis ? 'true' : 'false');
		this.$el.toggleClass("show-readium-toc", vis);
if (vis) setTimeout(function(){
$('#readium-toc').find('h1, h2').first()
.attr('tabindex', '-1').focus();
}, 500);
else $('#toggle-toc-btn').focus();
		return this;
	},

	init_toc: function() {
		if( this.model.get("has_toc") ) {
			var toc_item = this.model.getToc();			
			this.toc = toc_item.TocView();
			toc_item.fetch();

		}
	},	
	
	events: {
		"click #prev-page-button": 	function() { 
			this.model.paginator.v.pages.goLeft();
		},
		"click #next-page-button": 	function() { 
			this.model.paginator.v.pages.goRight();
		}
  	}
});
Readium.Views.NavWidgetView = Backbone.View.extend({

	el: '#settings',

	initialize: function() {
		this.model.on("change:two_up", this.render, this);
		this.model.on("change:can_two_up", this.render, this);
		this.model.on("change:full_screen", this.render, this);
		setTimeout(function() {
			$('#settings').addClass('hover-fade')
		}, 1000);
		
	},

	render: function() {
		var ebook = this.model;
		this.$('#to-fs-icon').toggle( !ebook.get("full_screen") );
		this.$('#from-fs-icon').toggle( ebook.get("full_screen") );
		this.$('#two-up-icon').toggle( !ebook.get("two_up") );
		this.$('#one-up-icon').toggle( ebook.get("two_up") );
	//	this.$('#two-up-button').toggle( ebook.get("can_two_up") );   <= todo restyle
	},

	events: {
    	"click #show-toc-button": 		function() { this.model.toggleToc() },
		"click #increase-font-button": 	function() { this.model.increaseFont() },
		"click #decrease-font-button": 	function() { this.model.decreaseFont() },
		"click #fullscreen-button": 	function() { this.model.toggleFullScreen() },
		"click #two-up-button": 		function() { this.model.toggleTwoUp() },
		"click #page-back-button": 		function() { this.model.prevPage() },
		"click #page-fwd-button": 		function() { this.model.nextPage() }
  	}
});

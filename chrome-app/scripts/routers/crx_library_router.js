Readium.Routers.LibraryRouter = Backbone.Router.extend({

	initialize: function(options) {
		this.picker = options.picker;
	},

	routes: {
		"options": 		"showOptions", 
		"/unpack/*url": 	"beginExtraction"
	},

	showOptions: function() {
		$('#readium-options-modal').modal('show');
	},

	beginExtraction: function(url) {
		var extractor = new Readium.Models.ZipBookExtractor({url: url, src_filename: url});
		this.picker.beginExtraction(extractor);
	}

});
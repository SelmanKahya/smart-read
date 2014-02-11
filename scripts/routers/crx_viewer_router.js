// This router is used in the book view of the chrome extension build of readium
Readium.Routers.ViewerRouter = Backbone.Router.extend({

	routes: {
		"views/viewer.html?book=:key": "openBook",
		"*splat": "splat_handler"
	},

	openBook: function(key) {

		var ePUBViewPrefKey = key + "_epubViewProperties";

		// Get the saved ePUB and the ePUB's view preferences
		Lawnchair(function() {

			// Get saved ePUB
			this.get(key, function(result) {
				
				if(result === null) {
					
					alert('Could not load ePUB, try refeshing your browser.');
					return;
				}

				window._epub = new Readium.Models.EPUB(result);

				// TODO: The structure of this method is potentially problematic: A lawnchair call nested in another.
				//   Investigate changes and asynchronicity. 
				// Get saved ePUB view preferences, if they exist
				this.get(ePUBViewPrefKey, function(result) {
				
					// Instantiate the ePUB controller 
					window._epubController = new Readium.Models.EPUBController(_.extend({epub : window._epub}, result));
					window._applicationView = new Readium.Views.ViewerApplicationView({
								model: window._epubController
							});
					window._applicationView.render();
				});
			});
		});
	},

	splat_handler: function(splat) {
		console.log(splat)
	}
});
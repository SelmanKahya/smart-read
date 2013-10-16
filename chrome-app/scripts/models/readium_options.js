Readium.Models.ReadiumOptions = Backbone.Model.extend({

	initialize: function() {
		this.set("id", "singleton");
	},

	defaults: {
		hijack_epub_urls: false,
		verbose_unpacking: true,
		paginate_everything: true
	},

	sync: Readium.Utils.LocalStorageAdaptor("READIUM_OPTIONS")
}, {
	getInstance: function() {
		var instance = new Readium.Models.ReadiumOptions();
		instance.fetch({
			error: function() {
				localStorage.setItem("READIUM_OPTIONS", "");
				instance.save();
			}
		});
		return instance;
	}
});
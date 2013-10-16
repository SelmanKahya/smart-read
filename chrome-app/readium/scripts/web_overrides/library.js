// todo move this stuff into the proper namespaces
Readium.Models.LibraryItem = Backbone.Model.extend({

	idAttribute: "key",
	
	getViewBookUrl: function(book) {
		return "/viewer.html?book=" + this.get('key');
	},

	openInReader: function() {
		window.location = this.getViewBookUrl();
	}

});

Readium.Collections.LibraryItems = Backbone.Collection.extend({

	model: Readium.Models.LibraryItem,

	url: "/epub_content/metadata.json"
	
});

Readium.Views.LibraryItemView = Backbone.View.extend({

	tagName: 'div',

	className: "book-item clearfix",

	initialize: function() {
		_.bindAll(this, "render");	
		this.template = Handlebars.templates.library_item_template;
Acc.detailed.push('#details-modal-' + this.model.get('key'));
	},

	render: function() {
		var renderedContent = this.template({data: this.model.toJSON()});
		$(this.el).html(renderedContent);
		this.$(".delete").toggle(false);
		return this;
	},

	events: {
		"click .delete": function(e) {
			e.preventDefault();
			var confMessage;
			var selector = "#details-modal-" + this.model.get('key');
			confMessage  = "Are you sure you want to perminantly delete " 
			confMessage += this.model.get('title');
			confMessage += "?";


			if(confirm(confMessage)) {
				$(selector).modal('hide');
				this.model.destroy();
				this.remove();
			}
		},

		"click .read": function(e) {
			this.model.openInReader();
		}
		
	}
});

Readium.Views.LibraryItemsView = Backbone.View.extend({
	tagName: 'div',

	id: "library-items-container",

	className: 'row-view clearfix',

	

	initialize: function() {
		this.template = Handlebars.templates.library_items_template;
		this.collection.bind('reset', this.render, this);
		this.collection.bind('add',   this.addOne, this);
	},

	render: function() {
		var collection = this.collection;
		var $container = $(this.el);
		$container.html(this.template({}));
		this.$('#empty-message').toggle(this.collection.isEmpty());

		collection.each(function(item) {
			var view = new Readium.Views.LibraryItemView({
				model: item,
				collection: collection,
				id: item.get('id')
			});
			$container.append( view.render().el );

		});
		
		// i dunno if this should go here
		$('#library-books-list').html(this.el)
		return this;
	},

	addOne: function(book) {
		var view = new LibraryItemView({
			model: book,
			collection: this.collection,
			id: book.get('id')
		});
		// we are adding so this should always be hidden!
		this.$('#empty-message').toggle(false);
		$(this.el).append( view.render().el );
	},

	events: {
		
	}
});


Readium.Views.ExtractItemView = Backbone.View.extend({
	
	el: $('#progress-container')[0],

	initialize: function() {	
		this.template = Handlebars.templates.extracting_item_template;
		this.model.bind('change', this.render, this);
		this.model.bind("change:error", this.extractionFailed, this);
	},

	render: function() {
		var $el = $(this.el);
		if( this.model.get('extracting') ) {
			$el.html(this.template(this.model.toJSON()));
			$el.show("slow");
		}
		else {
			$el.hide("slow");
		}
		return this;
	},

	extractionFailed: function(msg) {
		alert(this.model.get("error"));
		this.model.set("extracting", false);
	}

});

Readium.Views.ReadiumOptionsView = Backbone.View.extend({
	el: "#readium-options-modal",

	initialize: function() {
		this.model.on("change", this.render, this);
		this.render();
		$(this.el).on('shown', function(){
			$('#options-heading').focus();
			setTimeout( function() {
				$('#options-btn').attr('aria-pressed', 'true');
			}, 1);
		}).on('hidden', function(){
			setTimeout( function(){
				$('#options-btn').attr('aria-pressed', 'false').focus();
			}, 1);
		});
	},

	render: function() {
		var m = this.model;
		this.$('#paginate_everything').prop('checked', m.get("paginate_everything"));
		this.$('#verbose_unpacking').prop('checked', m.get("verbose_unpacking"));
		this.$('#hijack_epub_urls').prop('checked', m.get("hijack_epub_urls"));
	},

	events: {
		"change #verbose_unpacking": "updateSettings",
		"change #hijack_epub_urls": "updateSettings",
		"change #paginate_everything": "updateSettings",
		"click #save-settings-btn": "save"
		},

		updateSettings: function() {
			var hijack = this.$('#hijack_epub_urls').prop('checked')
			var unpack = this.$('#verbose_unpacking').prop('checked')
			var paginate = this.$('#paginate_everything').prop('checked')
			
		this.model.set({"verbose_unpacking": unpack,
						"hijack_epub_urls": hijack,
						"paginate_everything": paginate});
		},

		save: function() {
			this.model.save();
			this.$el.modal("hide");
		}

});

Readium.Routers.ApplicationRouter = Backbone.Router.extend({
	initialize: function(options) {
		this.collection = options.collection;
	},


	routes: {
		"view_book/:id": "openBook",
		"": "showLibrary"
	},

	openBook: function(key) {
		this.showViewer();
		var book_attrs = this.collection.get(key).toJSON();
		if(book_attrs.fixed_layout) {
			console.log('initializing fixed layout book');
			window._book = new Readium.Models.AppleFixedEbook(book_attrs);
		}
		else {
			console.log('initializing reflowable book');
			window._book = new Readium.Models.ReflowableEbook(book_attrs);
		}
		
		window._libraryView = new Readium.Views.ViewerApplicationView({
			model: window._book
		});
		window._libraryView.render();
	},

	showLibrary: function() {
		$("#readium-library-activity").toggle(true);
		$("#readium-viewer-activity").toggle(false);
	},

	showViewer: function() {
		$("#readium-library-activity").toggle(false);
		$("#readium-viewer-activity").toggle(true);
	},

	splat_handler: function(splat) {
		console.log(splat);
	}

}); 

Timer = function() {};
Timer.prototype.start = function() {this.start = new Date()};
Timer.prototype.stop = function() {this.stop = new Date()};
Timer.prototype.report = function() {
	console.log("===================Timer Report======================");
	console.log(this.stop - this.start);
	console.log("===================Timer Report======================");
};

Readium.Models.LibraryItem = Backbone.Model.extend({

	idAttribute: "key",
	
	getViewBookUrl: function(book) {
		return "/views/viewer.html?book=" + this.get('key');
	},

	openInReader: function() {
		window.location = this.getViewBookUrl();
	},

	destroy: function() {
		var key = this.get('key');
		Lawnchair(function() {
			var that = this; // <=== capture Lawnchair scope
			this.get(key, function(book) {
				if(book) {
					Readium.FileSystemApi(function(fs) {
						fs.rmdir(book.key);
						that.remove(key);
					});
				}
			});

			// Remove the viewer preferences as well
			propertiesKey = key + "_epubViewProperties";
			this.get(propertiesKey, function(epubViewProperties) {
				if(epubViewProperties) {
					Readium.FileSystemApi(function(fs) {
						fs.rmdir(epubViewProperties.key);
						that.remove(propertiesKey);
					});
				}
			});
		});
	}
});

Readium.Collections.LibraryItems = Backbone.Collection.extend({

	model: Readium.Models.LibraryItem
	
});

Readium.Views.LibraryItemView = Backbone.View.extend({

	tagName: 'div',

	className: "book-item",

	initialize: function() {
		this.template = Handlebars.templates.library_item_template;
	},

	render: function() {
		var renderedContent = this.template({data: this.model.toJSON()});
		$(this.el).html(renderedContent);
		return this;
	},

	events: {
		"click .delete": function(e) {
			e.preventDefault();
			var confMessage;
			var selector = "#details-modal-" + this.model.get('key');
			confMessage  = chrome.i18n.getMessage("i18n_are_you_sure");
			confMessage += "'";			
			confMessage += this.model.get('title');
			confMessage += "'";	
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

	className: 'row-view',

	initialize: function() {
		this.template = Handlebars.templates.library_items_template;
		this.collection.bind('reset', this.render, this);
		this.collection.bind('add',   this.addOne, this);
	},

	render: function() {
		var collection = this.collection;
		var content = this.template({});
		var $el = this.$el;
		$el.html(content);
		
		this.$('#empty-message').toggle(collection.isEmpty());

		collection.each(function(item) {
			var view = new Readium.Views.LibraryItemView({
				model: item,
				collection: collection,
				id: item.get('id')
			});
			$el.append( view.render().el );

		});
		this.restoreViewType();
		// i dunno if this should go here
		$('#library-books-list').html(this.el);
		return this;
	},

	restoreViewType: function() {
		// restore the setting
		if(Readium.Utils.getCookie("lib_view") === "block") {
			this.$el.addClass("block-view").removeClass("row-view");
		}
	},

	addOne: function(book) {
		var view = new Readium.Views.LibraryItemView({
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
	
	el: '#progress-container',

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

Readium.Views.FilePickerView = Backbone.View.extend({
	el:"#add-book-modal",

	initialize: function() {
		$(this.el).on('shown', function(){
			$('#add-book-heading').focus();
			setTimeout( function() {
				$('#add-book-btn').attr('aria-pressed', 'true');
			}, 1);
		}).on('hidden', function(){
			setTimeout( function(){
				$('#add-book-btn').attr('aria-pressed', 'false').focus();
			}, 1);
		});
	},

	events: {
		"change #files": "handleFileSelect",
		"change #dir_input": "handleDirSelect",
		"click #url-button": "handleUrl"
	},

	show: function() {
		this.$el.modal('show');
	},

	hide: function() {
		this.$el.modal('hide');
	},

	resetForm: function() {
		this.$('input').val("");
	},

	handleUrl: function(evt) {
		var input = document.getElementById('book-url');
		if(input.value === null || input.value.length < 1) {
			alert("invalid url, cannot process");
		}
		else {
			var url = input.value;
			// TODO check src filename
			var extractor = new Readium.Models.ZipBookExtractor({url: url, src_filename: url});
			this.beginExtraction(extractor);
		}
	},

	handleFileSelect: function(evt) {
		var files = evt.target.files; // FileList object
		var extractor = new Readium.Models.ZipBookExtractor({file: files[0], src_filename: files[0].name});
		this.beginExtraction(extractor);
	},

	handleDirSelect: function(evt) {
		var dirpicker = evt.target; // FileList object		
		var extractor = new Readium.Models.UnpackedBookExtractor({dir_picker: dirpicker});
		this.beginExtraction(extractor);
		
	},

	beginExtraction: function(extractor) {
		var that = this;
		var timer = new Timer();
		timer.start();
		window._extract_view = new Readium.Views.ExtractItemView({model: extractor});
		extractor.on("extraction_success", function() {
			var book = extractor.packageDoc.toJSON();
			timer.stop();
			timer.report();
			that.collection.add(new Readium.Models.LibraryItem(book));
			that.resetForm();
			setTimeout(function() {
				chrome.tabs.create({url: "/views/viewer.html?book=" + book.key });
			}, 800);
		});
		extractor.on("change:failure", this.resetForm, this);
		
		extractor.extract();
		this.hide();
	}

});

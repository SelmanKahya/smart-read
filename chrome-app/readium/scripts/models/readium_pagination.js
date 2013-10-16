
Readium.Models.ReadiumPagination = Backbone.Model.extend({ 

	defaults: {
		"num_pages" : 0
	},

	// ------------------------------------------------------------------------------------ //
	//  "PUBLIC" METHODS (THE API)                                                          //
	// ------------------------------------------------------------------------------------ //

	initialize: function () {

		this.epubController = this.get("model");

		// REFACTORING CANDIDATE: This is not ideal as it muddies the difference between the spine index position and 
		//   the page numbers that result from pagination. 
		this.set("current_page", [this.epubController.get("spine_position") + 1]);

		// Instantiate an object responsible for deciding which pages to display
		this.pageNumberDisplayLogic = new Readium.Models.PageNumberDisplayLogic();
		
		// if content reflows and the number of pages in the section changes
		// we need to adjust the the current page
		// Probably a memory leak here, should add a destructor
		this.on("change:num_pages", this.adjustCurrentPage, this);

	},

	// Description: This method determines which page numbers to display when switching
	//   between a single page and side-by-side page views and vice versa.
	toggleTwoUp: function() {

		if (this.epubController.epub.get("can_two_up")) {

			var newPages = this.pageNumberDisplayLogic.getPageNumbersForTwoUp (
				this.epubController.get("two_up"), 
				this.get("current_page"),
				this.epubController.epub.get("page_prog_dir"),
				this.epubController.getCurrentSection().isFixedLayout(),
				this.epubController.getCurrentSection().firstPageOffset()
				);

			this.set({current_page: newPages});
		}	
	},

	// REFACTORING CANDIDATE: This needs to be investigated, but I bet if the prevPage and nextPage methods were 
	//   called directly (goRight and goLeft were removed), the new page number display logic would account for the 
	//   page progression direction and that all this logic could be simplified in both this model and the 
	//   PageNumberDisplayLogic model
	// 
	// Description: turn pages in the rightward direction
	//   ie progression direction is dependent on 
	//   page progression dir
	goRight: function() {
		if (this.epubController.epub.get("page_prog_dir") === "rtl") {
			this.prevPage();
		}
		else {
			this.nextPage();	
		}
	},

	// Description: Turn pages in the leftward direction
	//   ie progression direction is dependent on 
	//   page progression dir
	goLeft: function() {
		if (this.epubController.epub.get("page_prog_dir") === "rtl") {
			this.nextPage();
		}
		else {
			this.prevPage();	
		}
	},

	goToPage: function(gotoPageNumber) {

		var pagesToGoto = this.pageNumberDisplayLogic.getGotoPageNumsToDisplay(
							gotoPageNumber,
							this.epubController.get("two_up"),
							this.epubController.getCurrentSection().isFixedLayout(),
							this.epubController.epub.get("page_prog_dir"),
							this.epubController.getCurrentSection().firstPageOffset()
							);
		this.set("current_page", pagesToGoto);
	},

	// Description: Return true if the pageNum argument is a currently visible 
	//   page. Return false if it is not; which will occur if it cannot be found in 
	//   the array.
	isPageVisible: function(pageNum) {
		return this.get("current_page").indexOf(pageNum) !== -1;
	},

	// REFACTORING CANDIDATE: prevPage and nextPage are public but not sure it should be; it's called from the navwidget and viewer.js.
	//   Additionally the logic in this method, as well as that in nextPage(), could be refactored to more clearly represent that 
	//   multiple different cases involved in switching pages.
	prevPage: function() {

		var curr_pg = this.get("current_page");
		var lastPage = curr_pg[0] - 1;

		// Clear the hash fragment if the user has decided to navigate away from it
		this.epubController.set("hash_fragment", undefined);

		if (curr_pg[0] <= 1) {

			this.epubController.goToPrevSection();
		}
		// REFACTORING CANDIDATE: The pagination/spine position relationship is still muddied. As a result, 
		//   the assumption that a single content document (spine element) is rendered in every scrolling view must be
		//   enforced here with this scrolling view specific check condition. 
		else if (this.epubController.paginator.shouldScroll() &&
			     !this.epubController.getCurrentSection().isFixedLayout()) {

			this.epubController.goToPrevSection();
		}
		// Single page navigation
		else if (!this.epubController.get("two_up")){

			this.set("current_page", [lastPage]);

			// Reset spine position
			if (this.epubController.get("rendered_spine_items").length > 1) {
				var pos = this.epubController.get("rendered_spine_items")[lastPage - 1];
				this.epubController.set("spine_position", pos);
			}
		}
		// Move to previous page with two side-by-side pages
		else {

			var pagesToDisplay = this.pageNumberDisplayLogic.getPrevPageNumsToDisplay(
								lastPage,
								this.epubController.getCurrentSection().isFixedLayout(),
								this.epubController.epub.get("page_prog_dir")
								);
			this.set("current_page", pagesToDisplay);

			// Reset spine position
			if (this.epubController.get("rendered_spine_items").length > 1) {
				var ind = (lastPage > 1 ? lastPage - 2 : 0);
				var pos = this.epubController.get("rendered_spine_items")[ind];
				this.epubController.set("spine_position", pos);
			}
		}
        
        // when we change the page, we have to tell MO about it
        this.epubController.get("media_overlay_controller").userChangedPage();
	},

	nextPage: function() {

		var curr_pg = this.get("current_page");
		var firstPage = curr_pg[curr_pg.length - 1] + 1;

		// Clear the hash fragment if the user has decided to navigate away from it
		this.epubController.set("hash_fragment", undefined);

		if (curr_pg[curr_pg.length - 1] >= this.get("num_pages")) {

			this.epubController.goToNextSection();
		}
		else if (!this.epubController.get("two_up")) {

			this.set("current_page", [firstPage]);

			// Reset the spine position
			if (this.epubController.get("rendered_spine_items").length > 1) {

				var pos = this.epubController.get("rendered_spine_items")[firstPage - 1];
				this.epubController.set("spine_position", pos);
			}
		}
		// Two pages are being displayed
		else {

			var pagesToDisplay = this.pageNumberDisplayLogic.getNextPageNumsToDisplay(
								firstPage,
								this.epubController.getCurrentSection().isFixedLayout(),
								this.epubController.epub.get("page_prog_dir")
								);
			this.set("current_page", pagesToDisplay);

			// Reset the spine position
			if (this.epubController.get("rendered_spine_items").length > 1) {

				var pos = this.epubController.get("rendered_spine_items")[firstPage - 1];
				this.epubController.set("spine_position", pos);
			}
		}
        // when we change the page, we have to tell MO about it
        this.epubController.get("media_overlay_controller").userChangedPage();
	},

	// ------------------------------------------------------------------------------------ //
	//  "PRIVATE" HELPERS                                                                   //
	// ------------------------------------------------------------------------------------ //

	adjustCurrentPage: function() {
		var cp = this.get("current_page");
		var num = this.get("num_pages");

		if (cp[cp.length - 1] > num) {
			this.goToLastPage();
		}

Acc.page = '#' + cp;

	},	

	// REFACTORING CANDIDATE: this is strange in that it does not seem to account for 
	//   possibly crossing over a section boundary
	goToLastPage: function() {
		var page = this.get("num_pages");
		this.goToPage(page);
	}
});
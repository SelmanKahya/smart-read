var ActivityService = new ActivityService();

SMARTREAD = {};

$(document).ready(function(){

    var checkReadiumTimer = setInterval(function(){checkReadium()}, 200);
    var checkReadium = function(){
        // if it is loaded, then bind events to elements inside iframe
        if(window._epubController && window._epub){
            clearInterval(checkReadiumTimer);

            // INIT book configuration
            SMARTREAD.book = {
                id: window._epub.attributes.id,
                key: window._epub.attributes.key,
                name: window._epub.attributes.title,
                numPages: window._epubController.paginator.v.pages.attributes.num_pages,
                status : {
                    currentPage: window._epubController.paginator.v.pages.attributes.current_page,
                    previousPage: null
                }
            }

            var pageChanged = function(model, newPage){
                var oldPage = model._previousAttributes.current_page;
                SMARTREAD.book.status.currentPage = newPage;
                SMARTREAD.book.status.previousPage = oldPage;

                // activity_type_id = 3  --->  page_changed
                ActivityService.newActivity({
                    activity_type_id: '3',
                    activity_content: "{old: '" + oldPage + "', new: '" + newPage + "'}",
                    book_name : '1',
                    user_id : '1'
                }, function(){})
            }

            // attach a function to page change event
            window._epubController.paginator.v.pages.on("change:current_page", pageChanged, this);

            // TELL SERVER that user started reading a book
            ActivityService.newActivity({
                activity_type_id: '1',
                activity_content: '',
                book_name : '1',
                user_id : '1'
            }, function(){})

        }
    }
});

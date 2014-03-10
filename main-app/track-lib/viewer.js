$(document).ready(function(){

    var init = function(){


        // name of the readium iframe
        // it is dynamically added into current window
        // so we need to check when it is completely loaded
        // to attach events
        var iframe = "iframe#readium-flowing-content";

        // checks if the iframe is loaded - current interval is 200ms
        var checkTimer = setInterval(function(){checkIframe()}, 200);
        var checkIframe = function(){
            // if it is loaded, then bind events to elements inside iframe
            if($(iframe).length){
                clearInterval(checkTimer);

                // Sometimes iframe is being loaded later than expected
                // This disables us to attach all the events to iframe elements correctly:
                // because iframe is not there when we attach events to elements.
                // So, we bind onload function to iframe and it is called after iframe is fully loaded
                $(iframe)[0].contentWindow.onload = function() {
                    bindEvents(iframe);
                }

                bindEvents(iframe);
            }
        }

        // iframe is loaded, it is time to bind events to epub reader!
        var bindEvents = function(iframe){
            $(iframe).contents().find("body").unbind( "dblclick" );
            $(iframe).contents().find("body").on('dblclick', viewerWordLookup);
        }
    }

    init();

    // attach a function to page change event
    $( "a" ).click(function() {
        init();
    });

    $( "a" ).click(function() {
        init();
    });

    // init dialog element
    $( "#lookup-dialog" ).dialog({
        autoOpen: false,
        show: {
            effect: "blind",
            duration: 500
        },
        hide: {
            effect: "blind",
            duration: 500
        },
        close: function() {
            $("#keyword-image").html('');
        },
        width: 700,
        height: 350,
        modal: true
    });

    // called when user double clicks on something
    var viewerWordLookup = function(){

        // get the iframe
        var frameWindow = $("iframe#readium-flowing-content")[0].contentWindow.document;

        // get selected word
        var word = frameWindow.getSelection().toString();

        SMARTREAD.services.LookupService.wordLookup(word, function(result){
            showDialog(result);
        });
    }

    // open dialog window after getting the meaning of the double clicked word
    var showDialog = function(result){

        var resultArray;

        try {
            resultArray = eval(result);
        } catch (e) {}

        if(resultArray && resultArray.length > 0){

            var firstResult = resultArray[0];

            // remove previous picture
            $("#keyword-image").html('');

            // dialog elements
            $("#lookup-word").html(firstResult.word);
            $("#lookup-word-type").html(firstResult.partOfSpeech);

            var definitionsString = resultArray.length == 1 ? "<b>Definition:</b> <br/>" :"<b>Definitions:</b><br/>";

            for(var i= 0; i < resultArray.length; i++)
                definitionsString += (i+1) + ". " + resultArray[i].text + "<br/>";

            $("#lookup-definition").html(definitionsString);


            $("#lookup-dialog").dialog( "open" );

            notifyServer(firstResult.word);

            SMARTREAD.services.ImageService.getImage(firstResult.word, function(results){
                if(results.length > 1){

                    // max 3 images
                    for(var i= 0; i < 3; i++) {

                        if(!results[i])
                            break;

                        var result = results[i];
                        var imgClass = 'imgWrapper';
                        var imgTitle = result.titleNoFormatting;
                        var imgSource =  result.tbUrl;
                        $("#keyword-image").append('<div class="' + imgClass + '"><img title="' + imgTitle + '" src="' + imgSource + '"/></div>');
                    }
                }
            });
        }
    }

    var notifyServer = function(keyword){
        if(SMARTREAD.book){

            if(keyword.length > 2){

                var data = {
                    word_lookup_word: keyword,
                    book_name: SMARTREAD.book.name
                };

                SMARTREAD.services.CallService.makeRequest('POST', '/word-lookup/', data, function(result){});
            }
        }
    }
});
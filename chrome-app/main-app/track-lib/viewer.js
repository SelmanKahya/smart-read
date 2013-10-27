var LookupService = new LookupService();
var ImageService = new ImageService();

$(document).ready(function(){

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
                bindEvents();
            }

            bindEvents();
        }
    }

    // iframe is loaded, it is time to bind events to epub reader!
    var bindEvents = function(){
        $(iframe).contents().find("body").on('dblclick', viewerWordLookup);
    }

    // init dialog element
    $( "#lookup-dialog" ).dialog({
        autoOpen: false,
        show: {
            effect: "blind",
            duration: 100
        },
        hide: {
            effect: "blind",
            duration: 100
        },

        width: 700,
        height: 500,
        modal: true,
        close: function() {
            $("#lookup-listen-audio").remove();
        }
    });

    // called when user double clicks on something
    var viewerWordLookup = function(){

        // get the iframe
        var frameWindow = $("iframe#readium-flowing-content")[0].contentWindow.document;

        // get selected word
        var word = frameWindow .getSelection().toString();

        LookupService.wordLookup(word, function(result){
            showDialog(result);
        });
    }

    // open dialog window after getting the meaning of the double clicked word
    var showDialog = function(result){
        if(result.primary_means){

            // remove previous picture
            $("#keyword-image").html('');

            // dialog elements
            $("#lookup-word").html(result.word);
            $("#lookup-word-type").html(result.type);
            $("#lookup-definition").html(result.primary_means[0]);
            $("#lookup-pronunciation").html(result.pronunciation);
            $("#lookup-dialog").dialog( "open" );

            // check if there is a pronunciation
            if(result.pronunciation)
                $("#lookup-pronunciation-area").css("display", "inline");
            else {
                $("#lookup-pronunciation-area").css("display", "none");
            }

            // check if there is a sound of the word
            // IF there is no sound, then don't show listen button
            if(result.sound){
                // create audio element
                $("#lookup-listen").css("display", "inline");
                $("#lookup-listen").append('<audio id="lookup-listen-audio" autoplay="autoplay" src="' + result.sound + '"></audio>');
                $('#lookup-listen').click(function() {$("#lookup-listen-audio").get(0).play();});
            } else{
                $("#lookup-listen").css("display", "none");
            }

            notifyServer(result.word);

            ImageService.getImage(result.word, function(results){
                if(results.length > 1){
                    var result = results[0];
                    var imgClass = 'imgWrapper';
                    var imgTitle = result.titleNoFormatting;
                    var imgSource =  result.tbUrl;

                    $("#keyword-image").append('<div class="' + imgClass + '"><img title="' + imgTitle + '" src="' + imgSource + '"/></div>');
                }
            });
        }
    }

    var notifyServer = function(keyword){
        if(SMARTREAD.book){
            $.ajax({
                type: "POST",
                url: "http://localhost:3000/word-lookup",
                data: {
                    word_lookup_word: keyword,
                    book_name: SMARTREAD.book.name,
                    user_id: '1'
                }
            }).done(function(result) {});
        }
    }
});
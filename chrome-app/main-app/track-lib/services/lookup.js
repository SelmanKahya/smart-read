function LookupService(){};

LookupService.prototype.wordLookup = function(word, callback){

    // Handles AJAX response (google dictionary API request)
    var handleResponse = function(){
        if(ajax.readyState==4 && ajax.status==200){
            var massaged = ajax.responseText.replace(/^[^(]+\(|[^}]+$/g, ''), res;
            try {
                res = JSON.parse( massaged );
            } catch( e ) {
                res = new Function( 'return ' + massaged )();
            }

            var result = process(res);
            callback(result);
        }
    }

    // process the json response, creates result object
    var process = function(json_obj){
        var result = {
            word : json_obj.query,
            type : null,
            sound : null,
            pronunciation : null,
            primary_means : null
        };

        for (var prop in json_obj){
            if(prop=="primaries"){
                var stuff = json_obj["primaries"][0];

                // get pronunciation and sound
                var isa = "";
                var sound = '';
                var wordType = '';
                var pro = stuff["terms"];
                for(var i=0;i<pro.length;i++){
                    if(pro[i]["type"]=="phonetic"){
                        isa+=pro[i]["text"];
                        isa+=" ";
                    }
                    else if(pro[i]["type"]=="sound"){
                        sound = pro[i]["text"];
                    }
                    else if(pro[i]["type"]=="text"){
                        wordType += pro[i]["labels"][0]['text'];
                        wordType += " ";
                    }
                }

                result.sound = sound;
                result.type = wordType;
                result.pronunciation = isa;

                // get meaning array
                var primary_mean = stuff["entries"];
                var primary_mean_list = [];
                var k=0;
                for(var i=0;i<primary_mean.length;i++){
                    if(primary_mean[i]["type"]=="meaning"){
                        primary_mean_list[k]=primary_mean[i]["terms"][0]["text"];
                        k++;
                    }
                }
                result.primary_means = primary_mean_list;
            }
            else
                continue;
        }

        return result;
    }


    // if selected string is empty, do nothing
    if(word == "" || word == " ")    return;

    // now, make a call to google dictionary api, and get the meaning
    var ajax = new XMLHttpRequest();
    ajax.onreadystatechange	= handleResponse;
    ajax.open("GET","http://www.google.com/dictionary/json?callback=process&sl=en&tl=en&restrict=pr,de&client=te&q=" + word,true);
    ajax.send();
};
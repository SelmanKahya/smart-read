requirejs.config(requirejsConfig);

requirejs(['jquery', 'util/messagingClient', 'config'], function($, client, config) {

    // shows start - stop button based on extension's current tracking status
    var hideStatusButtons = function(status){
        if(status){
            $("#status-start").hide();
            $("#status-stop").show();
        }
        else{
            $("#status-start").show();
            $("#status-stop").hide();
        }
    }

    var popupData = {
        appName: config.popup.appName
    };

    client.sendBroadcast({
        cmd: 'GetHtml',
        args: {
            template: 'popup',
            data: popupData
        }
    }, function(result) {
        if (result) {

            $(result).appendTo('body');

            var toggleStatus = function(){
                client.sendBroadcast({ cmd: 'ToggleExtensionStatus' }, function() {
                    client.sendBroadcast({ cmd: 'GetExtensionStatus' }, function(result) {
                        // toggle start stop button
                        hideStatusButtons(result.status);
                        // reload current page, so that extension can start tracking
                        chrome.tabs.reload(function(){});

                        // save username
                        client.sendBroadcast({ cmd: 'SetExtensionUsername', args: { username: $("#username").val()}}, function(result) {});
                    });
                });
            }

            $('#username').on('input', function() {   console.log('y');
                $("#activityLink").attr("href", "http://localhost:3000/activity/user/" + $("#username").val());
            })

            // attach events to start - stop tracking buttons
            client.sendBroadcast({ cmd: 'GetExtensionStatus' }, function(result) {
                $("#status-start").on( "click", toggleStatus);
                $("#status-stop").on( "click", toggleStatus);
                hideStatusButtons(result.status);
            });

            client.sendBroadcast({ cmd: 'GetExtensionUsername' }, function(user) {
                $("#username").val(user.username);
                $("#activityLink").attr("href", "http://localhost:3000/activity/user/" + user.username);
            });

            $("#word").on( "focus", inputFocus($("#word")));
            $("#word").on( "keydown", null);
            $("#btt").on( "click", function(){alert('a'); getMean();});

            function getMean(){
                word =  $("#word").val();
                if(word==""|| word=="Enter a word")
                    return;
                ajax=new XMLHttpRequest();
                ajax.onreadystatechange	= process;
                ajax.open("GET","http://www.google.com/dictionary/json?callback=s&sl=en&tl=en&restrict=pr,de&client=te&q="+word,true);
                ajax.send(null);
            }

            function process(){

                if(ajax.readyState==4 && ajax.status==200){

                    json_con=ajax.responseText;
                    json_con=json_con.substr(2,json_con.length-12);

                    console.log(json_con);
                    json_obj=eval('(' + json_con + ')');
                    document.getElementsByTagName("div")[1].innerHTML="";
                    var flag=false;
                    for (var prop in json_obj){
                        if(prop=="primaries"){
                            flag=true;
                            stuff=json_obj["primaries"];
                            stuff=stuff[0];
                            primary_mean=stuff["entries"];
                            pro=stuff["terms"];
                            isa="";
                            for(var i=0;i<pro.length;i++){
                                if(pro[i]["type"]=="phonetic"){
                                    isa+=pro[i]["text"];
                                    isa+=" ";
                                }
                            }
                            pronounciation=document.createElement("h3");
                            pronounciation.setAttribute("class","heading");
                            text=document.createTextNode("Pronounciation");
                            pronounciation.appendChild(text);
                            document.getElementsByTagName("div")[1].appendChild(pronounciation);
                            temp=document.createElement('p');
                            text=document.createTextNode(isa)
                            temp.appendChild(text);
                            document.getElementsByTagName("div")[1].appendChild(temp);
                            primary_mean_list=[];
                            var k=0;
                            for(var i=0;i<primary_mean.length;i++){
                                if(primary_mean[i]["type"]=="meaning"){
                                    primary_mean_list[k]=primary_mean[i]["terms"][0]["text"];
                                    k++;
                                }
                            }
                            createNode("h3","class","heading","Meaning");
                            for(var i=0;i<primary_mean_list.length;i++){
                                createNode("p","class","meaning",primary_mean_list[i]);
                            }
                        }
                        else if(prop=="webDefinitions"){
                            flag=true;
                            webdef=document.createElement('h4');
                            webdef.setAttribute("class","heading");
                            text=document.createTextNode("WebDefinitions");
                            webdef.appendChild(text);
                            document.getElementsByTagName("div")[1].appendChild(webdef);
                            stuff=json_obj["webDefinitions"];
                            stuff=stuff[0];
                            stuff=stuff["entries"];
                            for(var i=0;i<stuff.length;i++){
                                createNode("p","class","webdef",stuff[i]["terms"][0]["text"]);
                                createLink(stuff[i]["terms"][1]["text"]);
                            }
                        }
                        else
                            continue;
                    }

                    if(!flag){
                        createNode("h3","class","fail","Not Found");

                    }
                }
                else{

                    document.getElementsByTagName("div")[1].innerHTML="<h3 class=\"loading\">Loading</h3>";
                }
            };
            function createNode(type,at,id_,text){
                var node=document.createElement(type);
                text=document.createTextNode(text);
                node.appendChild(text);
                node.setAttribute(at,id_);
                document.getElementsByTagName("div")[1].appendChild(node);
            }
            function createLink(text){
                var node=document.createElement('a');
                node.innerHTML=text;
                document.getElementsByTagName("div")[1].appendChild(node);

            }
            function inputFocus(ip){
                ip.value="";
            }

        }
    });
});

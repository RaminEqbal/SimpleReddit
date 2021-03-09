/**
 * This js-Module includes the main routine for the Reddit Client: Simple Reddit
 */



/**
     * Global Variables
     */
    var lastPost="", //Tracks the ID of the last post loaded by the API
    lock=false, //Locks the trigger of endless loading function, used to prevent multiple API calls
    loadedPosts= new Map(), //Map of the posts loaded by the API
    favSubs = []; //List of favourite subs (by subName e.g. programming, programmerhumor, etc)

    const scrollingOffset = 500; //Trigger Range for Endless Scrolling




/**
 * Executed when HTML-Document is loaded
 */
$(document).ready(function(){
    /**
     * Storage Variables
     * lastSubreddit: Saves the last subreddit that was requested
     * postCount: Saves reference for amount of posts to be loaded
     * style: Saves Stylesheet reference
     */
    const lastSubreddit = localStorage.getItem('subreddit');
    const postCount = localStorage.getItem('postCount');
    loadSubsFromStorage();
    const style = (localStorage.getItem('style') == null ? "css/dark.css" :localStorage.getItem('style'));



    


    /**
     * Set the loaded values from localstorage into the components
     */
    $("#subredditName").val(lastSubreddit);
    $("#postCount").val(postCount);
    $("#themeInput").val(style);
    //Load the Stylesheet
    swapStyleSheet(style);

    //Initial Post Request on Page load
    writeToPosts(getSelectedSubreddit(),getSelectedSortMethod());



     /**
     * Event Handler for closing postRenderView with Q or Escape
     */
    $(document).on("keydown", event => {
        if(event.key !== "Escape") return; // Escape or q
        hidePostView();
        event.preventDefault(); // No need to `return false;`.
    });





    /**
     * Catches enter key in the Elements von input-class (all related input fields for post request)
     */
    $(".inputs").on("keyup", event => {
        if(event.key !== "Enter") return; // Use `.key` instead.
        triggerLoad();
        event.preventDefault(); // No need to `return false;`.
    });

   




    /**
     * Eventhandler for Theme change
     */
    $("#themeInput").change(function(){
        swapStyleSheet($("#themeInput").val());
    })





    /**
     * Endless Loading
     */
    $(window).scroll(function(){
        if ($(window).scrollTop() >= $(document).height() - $(window).height() - scrollingOffset){
            if(lock==false){
                lock=true;
                writeToPosts(getSelectedSubreddit(),getSelectedSortMethod());
            }
        }
    });
});


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * POST LIST BLOCK BEGIN
 */





function triggerLoad() {
    localStorage.setItem('subreddit',getSelectedSubreddit());
        localStorage.setItem('postCount',getCountOfPosts());
        pushSub(getSelectedSubreddit());
        saveSubsToStorage();
        $(".posts").empty();
        lastPost="";
        writeToPosts(getSelectedSubreddit(),getSelectedSortMethod()) // Things you want to do.
}





/**
 * Empties Postlist and fetches Posts according to input params. Prepares used JSON data and uses function appendToPost to render the actual 
 * Post Data
 * @param {String} subreddit 
 * @param {String} sortType 
 */
async function writeToPosts(subreddit, sortType) {
    
    const data = await getJSON("https://www.reddit.com/r/"+subreddit+"/"+getSelectedSortMethod()+".json?limit="+getCountOfPosts()+"&after="+lastPost);
    const children = data['data']['children'];
    console.log(children);
    for(post in children){
        let curPost =children[post]['data'];
        const postData = {
            name: curPost['id'],
            nameid: curPost['name'],
            subreddit: curPost['subreddit'],
            title: curPost['title'],
            permalink: curPost['permalink'],
            updoot: curPost['ups'],
            postType: curPost['post_hint'],
            url: curPost['url'],
            text: curPost['selftext'],
            texthtml: curPost['selftext_html'],
            domain: curPost['domain'],
            media: curPost['media'],
            mediaEmbed: curPost['media_embed']
        }
        lastPost = postData.nameid;
        loadedPosts.set(postData.name, postData);
        if(getScrollCheckBox()){
            document.getElementById("postrules").setAttribute("href", "css/bigpost.css");
            appendToPostScrolling(postData)
        }
        else {
            document.getElementById("postrules").setAttribute("href", "css/smallpost.css");
            appendToPost(postData);
        }  
    }
    lock=false;

    
}



/**
 * Function Component for the rendering of the posts
 * @param {Object} postData 
 */
function appendToPost(postData) {
    console.log("Smallpost");
    let updoots = (getUpDootCheckBox() ? "("+postData.updoot+") " :"");
    let html = `
    <div class='singlePost' id='${postData.name}' onclick='renderPostView(this)'>
        <p>
            <b>${updoots}</b>${postData.title} <small>${postData.domain}</small><br> 
            <a target="_blank" href='https://www.reddit.com${postData.permalink}'>to Reddit</a>
        </p> 
        <p style="display:none">${postData.text}</p>
    </div>`
    $(".posts").append(html)
}





/**
 *  Function for rendering the Postlist in a Social Media Scrolling Format
 * @param {Object} postData 
 */
function appendToPostScrolling(postData) {

    console.log("BigPost");
    let updoots = (getUpDootCheckBox() ? "("+postData.updoot+") " :"");
    /**
     * Component Definition in JSX
     */
      //Load PostData from DataStructure
      let embed = "";
  
  
     
  
  
  
      /**
       * Handle embeds in the Post Render
       * Supported Embeds
       *      i.redd.it
       *      Youtube
       *      v.redd.it
       *      Twitter
       */
      if(postData.domain == "i.redd.it" || postData.domain == "i.imgur.com"){
          embed = "<a target='_blank' href='"+postData.url+"'><img class='center' src='"+postData.url+"'></a>"
      }
      else if(postData.domain.startsWith("youtube")){
          embed = decodeHtml(postData.mediaEmbed['content']);
      }/*
      else if(postData.domain == "twitter.com"){
          const tweetReq = await getJSON("https://publish.twitter.com/oembed?url="+postData.url);
          console.log(tweetReq);
      }*/
      else if(postData.domain == "v.redd.it"){
          embed = `
          
          <iframe width="${postData.media['reddit_video']['width']}" height="${postData.media['reddit_video']['height']}" src="${postData.media['reddit_video']['fallback_url']}" allowfullscreen></iframe>
          
          
          `
      }
      else{
          embed = `<a target="_blank" href='${postData.url}'>to URL</a>`
      }
  
  
      //Decode JSON Data to Displayable HTML
      if(postData != null){
        var texthtml = decodeHtml(postData.texthtml).sliceHTML(0,700);
      }
      else {
          var texthtml = "";
      }
      
  
  
      /**
       * Component Definition in JSX
       */
      let html = `


      <div class='singlePost' id='${postData.name}' >
      <div>
          <h2 onclick='renderPostView(this.parentNode.parentNode)'>${updoots}${postData.title}</h2>
          <small onclick='$("#subredditName").val("${postData.subreddit}");triggerLoad();'>@ ${postData.subreddit}</small> <br>
          <a target="_blank" href='https://www.reddit.com${postData.permalink}'>to Reddit</a>
          <hr>
          ${embed}<br>
          ${texthtml}<br>
          <!-- TEXTHTML END -->
          <button class="commentsButton" onclick='renderPostView(this.parentNode.parentNode)'>Full Post and Comments</button>
      </div>
  </div>`

    $(".posts").append(html)
}








/**
 * POST LIST BLOCK END
 */


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




/**
 * POST VIEW BLOCK BEGIN
 */



/**
 * Functional Component for rendering the PostView element
 * @param {HTMLElement} element 
 */
async function renderPostView(element) {

    //Display PostView Div and clear it
    $(".postView").show();
    $("#postViewContent").empty();

    //Mark Post as visited
    const id=element.getAttribute("id");
    $("#"+id).attr("class","visitedPost")


    //Load PostData from DataStructure
    const postData = loadedPosts.get(id);
    let embed = "";


   



    /**
     * Handle embeds in the Post Render
     * Supported Embeds
     *      i.redd.it
     *      Youtube
     *      v.redd.it
     *      Twitter
     */
    if(postData.domain == "i.redd.it" || postData.domain == "i.imgur.com"){
        embed = "<a target='_blank' href='"+postData.url+"' > <img class='center' src='"+postData.url+"'></a>"
    }
    else if(postData.domain.startsWith("youtube")){
        embed = decodeHtml(postData.mediaEmbed['content']);
    }/*
    else if(postData.domain == "twitter.com"){
        const tweetReq = await getJSON("https://publish.twitter.com/oembed?url="+postData.url);
        console.log(tweetReq);
    }*/
    else if(postData.domain == "v.redd.it"){
        embed = `
        
        <iframe width="${postData.media['reddit_video']['width']}" height="${postData.media['reddit_video']['height']}" src="${postData.media['reddit_video']['fallback_url']}" allowfullscreen></iframe>
        
        
        `
    }
    else{
        embed = `<a target="_blank" href='https://www.reddit.com${postData.permalink}'>to URL</a>`
    }


    //Decode JSON Data to Displayable HTML
    let texthtml = decodeHtml(postData.texthtml);


    /**
     * Component Definition in JSX
     */
    let html = `
    <div>
        <h2>${postData.title}</h2>
        <a target="_blank" href='https://www.reddit.com${postData.permalink}'>to Reddit</a>
        <hr>
        ${embed}<br>
        ${texthtml}
        <hr>
        <div class="renderViewCommentsComponent">
            <h2 id="commentsHeading">Comments [loading]</h3>
        </div>
    </div>
    `;

    //Render the JSX
    $("#postViewContent").append(html);


     /**
     * Load Comments
     */
    let commentsURL = "https://www.reddit.com/r/"+getSelectedSubreddit()+"/comments/"+id+".json?sort=top";
    const commentsData = await getJSON(commentsURL);
    const commentList = commentsData[1].data.children; // Index 1 is the comment list (index 0 is the selfpost)
    //Loop through comments
    recursiveComment(".renderViewCommentsComponent",commentList)

    $("#commentsHeading").text("Comments");
}



/**
 * Writes the comments provided by the Reddit API to the CommentsView, given the hierarchy of the comments, in a recursive manner.
 * @param {HTMLElement} htmlRoot The HTML Elements the next comment should be appended to
 * @param {Array} commentCollection A List of the data collection of the comments provided by the Reddit API
 */
function recursiveComment(htmlRoot,commentCollection) {

    for(comment in commentCollection){
        //Skip Post
        if(commentCollection[comment]['kind'] == "more" ){
            continue;
        }

        //Creating collection of Data
        const curCom = commentCollection[comment]['data'];
        const comData = {
            id: curCom['id'],
            author: curCom['author'],
            score: curCom['score'],
            contentHTML: curCom['body_html'],
            permalink: "https://www.reddit.com"+curCom['permalink'],
            replies: curCom['replies']
        }

        let commentContentHTML = decodeHtml(comData.contentHTML)
        let commentID = "comment_"+comData.id;





        

        //Creating Reply Collection
        var replyCollection;
        if(commentCollection[comment]['data']['replies'] == ""){
            replyCollection=undefined;
        }
        else {
            replyCollection = comData['replies']['data']['children'];
        }


       
        
        

        let chtml = ` 
            <div class="comment" id=${commentID}>
            <div class="innerComment">
                <h4>(${comData.score})[${comData.author}]</h4>
                ${commentContentHTML}
            </div>
            </div>


        `;

        $(htmlRoot).append(chtml);
        if(replyCollection != undefined){
            recursiveComment("#"+commentID,replyCollection);
        }
        
    }
}


/**
 * POST VIEW BLOCK END
 */

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


/**
 * RESPONSIVE ELEMENTS BLOCK BEGIN
 */


/**
 * Used to toggle the text display of posts
 * 
 * @param {HTMLElement} element 
 */
function togglePostText(element){
    let state = element.parentNode.parentNode.getElementsByTagName('p')[1].style.display;
    (state == "none") ? element.parentNode.parentNode.getElementsByTagName('p')[1].style.display = "block" : element.parentNode.parentNode.getElementsByTagName('p')[1].style.display = "none";
}


/**
 * Fetches the parsed object from the JSON request using url
 * @param {URL} url 
 */
async function getJSON(url) {
    return fetch(url)
        .then((response)=>response.json())
        .then((responseJson)=>{return responseJson});
}






/**
 * Helper function for swapping the stylesheet
 * @param {String} sheet 
 */
function swapStyleSheet(sheet) {
    document.getElementById("pagestyle").setAttribute("href", sheet);
    localStorage.setItem('style',getStylesheet())
}


function decodeHtml(html) {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}


function hidePostView() {
    $(".postView").hide();
    $(".postView").scrollTop(0);
    $("#postViewContent").empty();
}



function loadSubs() {
    $("#favorites").empty();
    for(sub in favSubs){
        var toLoad = favSubs[sub];

        let jsx =  ` 
        <div style="display:block;" class="fav-entry">
        <span class="toLoad" onclick='loadSubToInput("${toLoad}")'>${toLoad}</span>
        <span style="margin-left: 4vw;" onclick='deleteSub("${toLoad}")'>X</span>
        </div>
        
        `;
        $("#favorites").append(jsx);

    }
}


/**
 * RESPONSIVE ELEMENTS BLOCK END
 */

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


 /**
 *  FAVORITES BLOCK BEGIN
 */



function saveSub(subName) {
    favSubs = favSubs.filter(item => item !== subName)
    favSubs.unshift(subName);
}


function pushSub(subName) {
    saveSub(subName);
    loadSubs();
}


function deleteSub(subName) {
    favSubs = favSubs.filter(item => item !== subName);
    saveSubsToStorage();
    loadSubs();
}


function loadSubToInput(subName){
    $("#subredditName").val(subName);
    triggerLoad();
}


function saveSubsToStorage() {
    localStorage.setItem("favSubs",JSON.stringify(favSubs));
}

/**
 * Reads the list of favorite Subs from the localStorage by transforming the string into JSON
 */
function loadSubsFromStorage() {
    favSubs = JSON.parse(localStorage.getItem("favSubs"));
    if(favSubs == null){
        favSubs = [];
    }
    saveSubsToStorage();
    loadSubs();
}


 /**
 *  FAVORITES BLOCK END
 */

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


/**
 * GETTER BLOCK START
 */

function getSelectedSubreddit(){
    return $("#subredditName").val();
}
function getSelectedSortMethod(){
    return $("#sortTypeInput").val();
}
function getCountOfPosts(){
    return $("#postCount").val();
}
function getStylesheet(){
    return $("#pagestyle").attr("href");
}


function getUpDootCheckBox() {
    return $("#updootsCheckBox").is(':checked')
}


function getScrollCheckBox() {
    return $("#scrollingCheckBox").is(':checked')
}


/**
 * GETTER BLOCK END
 */



 String.prototype.sliceHTML = function (start,end) {
    var sliced = this.slice(start,end);
    var lastTag="";
    var curIndex=sliced.length;
    if(curIndex==0) return "";
    while(sliced.charAt(curIndex) != "<" && curIndex != 0){
        console.log(curIndex+" "+  sliced.charAt(curIndex)+" != < computes: "+ sliced.charAt(curIndex) != "<");
        curIndex -=1;
    }
    console.log("Terminated")
    lastTag="><\/"+this.slice(curIndex,end).split(" ")[0].slice(1);
    console.log(lastTag);
    if(lastTag.charAt(lastTag.length-1)!=">"){
        lastTag+=">";
    }
    for(var i=1;i<lastTag.length;i++){
        if(lastTag.charAt(i)==">"){
            lastTag = lastTag.slice(0,i+1);
        }
    }
    console.log(lastTag);

    return sliced+"\" "+lastTag+"</div>"+"...";
 };
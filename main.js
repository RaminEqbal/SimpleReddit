$(document).ready(function(){
    /**
     * Storage Variables
     * lastSubreddit: Saves the last subreddit that was requested
     * postCount: Saves reference for amount of posts to be loaded
     * style: Saves Stylesheet reference
     */
    const lastSubreddit = localStorage.getItem('subreddit');
    const postCount = localStorage.getItem('postCount');
    const style = (localStorage.getItem('style') == null ? "css/dark.css" :localStorage.getItem('style')) 

    /**
     * Set the loaded values from localstorage into the components
     */
    $("#subredditName").val(lastSubreddit);
    $("#postCount").val(postCount);
    $("#themeInput").val(style);
    //Load the Stylesheet
    swapStyleSheet(style);

    //Initial Post Request on Page load
    writeToPosts(getSelectedSubreddit(),getSelectedSortMethod())


    /**
     * Catches enter key in the Elements von input-class (all related input fields for post request)
     */
    $(".inputs").on("keyup", event => {
        if(event.key !== "Enter") return; // Use `.key` instead.
        localStorage.setItem('subreddit',getSelectedSubreddit());
        localStorage.setItem('postCount',getCountOfPosts())
        writeToPosts(getSelectedSubreddit(),getSelectedSortMethod()) // Things you want to do.
        event.preventDefault(); // No need to `return false;`.
    });

    /**
     * Eventhandler for Theme change
     */
    $("#themeInput").change(function(){
        swapStyleSheet($("#themeInput").val());
    })
});


/**
 * Empties Postlist and fetches Posts according to input params. Prepares used JSON data and uses function appendToPost to render the actual 
 * Post Data
 * @param {String} subreddit 
 * @param {String} sortType 
 */
async function writeToPosts(subreddit, sortType) {
    $(".posts").empty();
    console.log("Fetching JSON");
    console.log("PostCount: " + getCountOfPosts());
    const data = await getJSON("https://www.reddit.com/r/"+subreddit+"/"+getSelectedSortMethod()+".json?limit="+getCountOfPosts());
    console.log(data);
    console.log("Constructing Child List");
    const children = data['data']['children'];
    console.log(children)
    for(post in children){
        let curPost =children[post]['data'];
        const postData = {
            title: curPost['title'],
            permalink: curPost['permalink'],
            updoot: curPost['ups'],
            postType: curPost['post_hint'],
            url: curPost['url'],
            text: curPost['selftext'],
            domain: curPost['domain']
        }
        appendToPost(postData);
    }

    
}



/**
 * Function Component for the rendering of the posts
 * @param {Object} postData 
 */
function appendToPost(postData) {
    let updoots = (getUpDootCheckBox() ? "("+postData.updoot+") " :"");
    let linkType = (postData.postType=="image") ? "to Image" : "to URL";
    let showText = "";
    let html = `
    <div class='singlePost'>
        <p>
            <b>${updoots}</b>${postData.title} <small>${postData.domain}</small><br> 
            <a href="#this" onClick='togglePostText(this)'>Show Text</a>
            <a href='https://www.reddit.com${postData.permalink}'>to Reddit</a>
            <a target="_blank" href='${postData.url}'>${linkType}</a> 
        </p> 
        <p style="display:none">${postData.text}</p>
    </div>`
    $(".posts").append(html)
}

/**
 * Used to toggle the text display of posts
 * 
 * @param {HTMLElement} element 
 */
function togglePostText(element){
    let state = element.parentNode.parentNode.getElementsByTagName('p')[1].style.display;
    console.log(state);
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


/**
 * Helper function for swapping the stylesheet
 * @param {String} sheet 
 */
function swapStyleSheet(sheet) {
    document.getElementById("pagestyle").setAttribute("href", sheet);
    localStorage.setItem('style',getStylesheet())
}
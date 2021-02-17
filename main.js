$(document).ready(function(){
    writeToPosts(getSelectedSubreddit(),getSelectedSortMethod())
    console.log("Init EventListener")
    $(".inputs").on("keyup", event => {
        if(event.key !== "Enter") return; // Use `.key` instead.
        console.log("Enter caught");
        writeToPosts(getSelectedSubreddit(),getSelectedSortMethod()) // Things you want to do.
        event.preventDefault(); // No need to `return false;`.
    });
});

async function writeToPosts(subreddit, sortType) {
    $(".posts").empty();
    console.log("Fetching JSON");
    console.log("PostCount: " + getCountOfPosts());
    const data = await getJSON("https://www.reddit.com/r/"+subreddit+"/hot.json?limit="+getCountOfPosts());
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
            url: curPost['url']
        }
        appendToPost(postData);
    }

    
}


function appendToPost(postData) {
    let updoots = (getUpDootCheckBox() ? "("+postData.updoot+") " :"");
    let linkType = (postData.postType=="image") ? "to Image" : "to URL";
    let html = `
    <p class='singlePost'>
    ${updoots}${postData.title}<br> 
    <a href='https://www.reddit.com${postData.permalink}'>to Reddit</a>  <a href='${postData.url}'>${linkType}</a> <p> `
    $(".posts").append(html)
}






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

function getUpDootCheckBox() {
    return $("#updootsCheckBox").is(':checked')
}


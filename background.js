chrome.runtime.onInstalled.addListener(function () {
    setUpContextMenus();
    setText();
});


function setUpContextMenus() {
    chrome.contextMenus.create({
        title: 'Ban this shit',
        id: 'BanUser',
        contexts: ['selection']
    });
}


chrome.contextMenus.onClicked.addListener(onClickHandler);


function onClickHandler(info, tab) {
    //get group id
    var groupId = info.pageUrl.match(/(\d+)/g)[0];
    //get user id
    callAjax(info.linkUrl, function (res) {
        var userIdString = res.match(/fb:\/\/profile\/(\d+)/g)[0];
        var userId = userIdString.replace('fb://profile/', '');

        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {action: 'ban', groupId: groupId, userId: userId}, function (response) {

            });
        });
    });
};

function callAjax(url, callback) {
    var xmlhttp;
    // compatible with IE7+, Firefox, Chrome, Opera, Safari
    xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            callback(xmlhttp.responseText);
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

function setText() {
    chrome.storage.sync.get("numBan", function (data) {
        var numBan = data.numBan;
        chrome.browserAction.setBadgeText({text: numBan.toString()});
        chrome.browserAction.setBadgeBackgroundColor({color: [255, 0, 0, 255]});
    });
}

chrome.runtime.onMessage.addListener(
    function (req, sender, sendResponse) {
        if (req.action == 'badgetText') {
            setText();
        }
    });


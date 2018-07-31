function KickMember(idgroup, idUser, fb_dtsg) {
    var Optional = {
        method: "POST",
        credentials: "include",
        mode: 'cors',
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        headers: {
            "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
        },
        body: 'fb_dtsg=' + fb_dtsg + '&confirm=true&ban_user=1&jazoest=1'
    };
    var check = fetch(
        "https://www.facebook.com/ajax/groups/members/remove.php?group_id=" + idgroup + "&user_id=" + idUser + "&is_undo=0&source=profile_browser&dpr=1", Optional)
        .then(function (res) {
            if (res) {
                //remove element
                //all_members_100024665686564 at member page
                if ($('#all_members_' + idUser).length > 0) {
                    $('#all_members_' + idUser).hide();
                }
            }
            return res ? true : false
        });
    return check;
}


var fb_dtsg = document.querySelector('[name="fb_dtsg"]').value;

chrome.runtime.onMessage.addListener(
    function (req, sender, sendResponse) {
        if (req.action == 'ban') {
            var check = KickMember(req.groupId, req.userId, fb_dtsg);
            sendResponse(check ? 1 : 0);
            if (!check) {
                alert('Kick member failed!')
            } else {
                //increase death
                chrome.storage.sync.get("numBan", function (data) {
                    var numBan = data.numBan;
                    if (numBan == undefined || numBan == null) {
                        numBan = 1;
                    } else {
                        numBan++;
                    }
                    chrome.storage.sync.set({numBan: numBan}, function () {
                        console.log("Increased banned user");
                    });
                    chrome.runtime.sendMessage({action: 'badgetText'});
                });


            }
        }
        return true;
    });

//Request URL: https://www.facebook.com/ajax/groups/members/remove.php?group_id=794125374111799&user_id=100025669965969&is_undo=0&source=profile_browser&dpr=2

/*
 fb_dtsg: AQEwCuU3Ap7I:AQGLm5Mb9fBS
 confirm: true
 ban_user: 1
 __user: 100000045292063
 __a: 1
 __dyn: 7AgNe-4amaxx2u6aJGeFxqewRyWzEy4aheC267Uqzob4q2i5U4e2C3-7WUC6UnG2OUG4XzEeWDgdUHzobohx3wDxrDx2UO5UlwQxS58iwBx61zwzwnqxW5o7Cum2S2G262i6rGUpxy5UrwFwgEdoK7Uy5UGdUC2C2GdzE_Wx28wn8OER7x3x69wyQF8my9m4S5oSmiaz9oCmUpzUiVE4W10Gu15h8J2EgUWV8zwEwFypUKU42
 __req: 22
 __be: 1
 __pc: PHASED:DEFAULT
 __rev: 4143791
 jazoest: 26581691196711785516511255735865817176109537798571026683
 __spin_r: 4143791
 __spin_b: trunk
 __spin_t: 1532613540*/

//Ban In Pending page
$(function () {
    banAllPedningWrong();
});

function banAllPedningWrong() {
    if ($('#pagelet_pending_queue .userContentWrapper').length > 0) {
        var banNum = 0;
        //#pagelet_pending_queue .userContentWrapper
        $('#pagelet_pending_queue .userContentWrapper').each(function () {
            var textContent = $(this).text();
            var die = 0;
            if (textContent.indexOf('đã phát trực tiếp') != -1) {
                die = 1;
            }
            if (textContent.indexOf('was live') != -1) {
                die = 1;
            }
            if (textContent.indexOf('is live now') != -1) {
                die = 1;
            }
            if (textContent.indexOf('đang phát trực tiếp') != -1) {
                die = 1;
            }
            if (textContent.indexOf('Đính kèm không khả dụng') != -1) {
                die = 1;
            }
            if (textContent.indexOf('Attachment Unavailable') != -1) {
                die = 1;
            }
            if (die == 1) {
                if ($(this).find('a.profileLink').length > 0) {
                    var ajaxify = $(this).find('.profileLink').attr('ajaxify');
                    var groupId = ajaxify.match(/group_id=(\d+)/gm)[0].replace('group_id=', '');
                    var memberId = ajaxify.match(/member_id=(\d+)/gm)[0].replace('member_id=', '');
                    var check = KickMember(groupId, memberId, fb_dtsg);
                    if (check) {
                        banNum++;
                        //remove element
                        $(this).hide();
                    }
                }
            }
        });
        //numban
        chrome.storage.sync.get("numBan", function (data) {
            var numBan = data.numBan;
            if (numBan == undefined || numBan == null) {
                numBan = 1;
            }
            numBan = numBan + banNum;
            chrome.storage.sync.set({numBan: numBan}, function () {
                console.log("Increased banned user");
            });
            chrome.runtime.sendMessage({action: 'badgetText'});
        });
    }
}
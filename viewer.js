let token = '';
let tuid = '';

const twitch = window.Twitch.ext;

// create the request options for our Twitch API calls

twitch.onContext(function(context) {
    twitch.rig.log(context);
});

twitch.onAuthorized(function(auth) {
    // save our credentials
    token = auth.token;
    tuid = auth.userId;
    updateLeaderboard();
    setInterval(function() {
        //code goes here that will be run every 5 seconds.
        updateLeaderboard();
    }, 3000);
});

function updateLeaderboard() {
    getLeadingUsers(function(users) {
            for (i = 0; i < 10; i++) {
                var pic = document.getElementById("pic" + (i + 1));
                var name = document.getElementById("name" + (i + 1));
                var score = document.getElementById("score" + (i + 1));
                if (i <= users.length - 1) {
                    let user = users[i];
                    pic.style = "background-image: url(" + user["logo"] + "); background-color:white;";
                    score.innerHTML = numberWithCommas(user["totalEarned"]);
                    name.innerHTML = user["display_name"];
                } else {
                    if (pic != null) {
                        pic.style = "background-image: none; box-shadow:none";
                    }
                    if (score != null) {
                        score.innerHTML = "";
                    }
                    if (name != null) {
                        name.innerHTML = "";
                    }
                }
            }
        });
}

function logError(_, error, status) {
    twitch.rig.log('EBS request returned ' + status + ' (' + error + ')');
}

function logSuccess(hex, status) {
    twitch.rig.log('EBS request returned ' + hex + ' (' + status + ')');
}

function getLeadingUsers(completion) {
    $.ajax({
        url: `https://cors-anywhere.herokuapp.com/https://allcapssoftwareinc.com/madikays/madikaysLeaderboard.php?randomString=${makeid(15)}`,
        success: function(result) {
            var users = JSON.parse(result);
            var responsesRemaining = 9;
            users.forEach(function(user, i) {
                getUserFrom(user["id"], function(response) {
                    users[i]["display_name"] = response["display_name"];
                    users[i]["logo"] = response.logo;
                    responsesRemaining--;
                    if (responsesRemaining <= 0) {
                        // all data is here now
                        completion(users)
                    }
                });
            });
        }
    });
}

//Returns a username from a passed user id
function getUserFrom(uid, completion) {

    $.ajax({
        url: 'https://api.twitch.tv/kraken/users?id=' + uid,
        headers: {
            'Client-ID': '72clf2db4gvl8g4jpg1qd75ly6edpd',
            'Accept': 'application/vnd.twitchtv.v5+json'
        },
        success: function(result) {
            completion(result["users"][0]);
        }
    });
}
//Converts an integer into a string representing that integer formatted with commas.
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
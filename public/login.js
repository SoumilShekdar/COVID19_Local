var user_name;
var user;
//var database;
var app;

document.addEventListener("DOMContentLoaded", event => {
    app = firebase.app();
    //database = firebase.firestore();
});

function googleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider();

    firebase.auth().signInWithPopup(provider)
        .then(result => {
            user = result.user;
            user_login = true;
            user_name = user.displayName;
            //console.log(user_name);
            //document.write(`Hello ${user.displayName}`);
            //console.log(user);
            console.log(user.uid)
            enableAddMarker();
        })
        .catch(console.log)
}

// * Here is is the code snippet to initialize Firebase Messaging in the Service
// * Worker when your app is not hosted on Firebase Hosting.
// [START initialize_firebase_in_sw]
// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js');

firebase.initializeApp = {
    apiKey: "AIzaSyBJypvqr07TVz57mT3ANp7FHdYo9LkS1MQ",
    authDomain: "martinrevertcomar.firebaseapp.com",
    projectId: "martinrevertcomar",
    storageBucket: "martinrevertcomar.appspot.com",
    messagingSenderId: "15068810980",
    appId: "1:15068810980:web:8a75b8b4ed82f6f028e6f1",
    measurementId: "G-908FHNE0CR"
};

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
//const messaging = firebase.messaging();
// [END initialize_firebase_in_sw]
//**/
const messaging = firebase.messaging();

MsgElem = document.getElementById("msg");
TokenElem = document.getElementById("token");
NotisElem = document.getElementById("notis");
ErrElem = document.getElementById("err");

messaging
    .requestPermission()
    .then(function () {
        MsgElem.innerHTML = "Notification permission granted." 
        console.log("Notification permission granted.");

        // get the token in the form of promise
        return messaging.getToken()
    })
    .then(function(token) {
        TokenElem.innerHTML = "token is : " + token
        console.log(token);
    })
    .catch(function (err) {
        ErrElem.innerHTML =  ErrElem.innerHTML + "; " + err
        console.log("Unable to get permission to notify.", err);
    });


// If you would like to customize notifications that are received in the
// background (Web app is closed or not in browser focus) then you should
// implement this optional method.
// [START on_background_message]
messaging.onBackgroundMessage(function (payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    // Customize notification here
    const notificationTitle = 'Background Message Title';
    const notificationOptions = {
        body: 'Background Message body.',
        icon: '/firebase-logo.png'
    };

    self.registration.showNotification(notificationTitle,
        notificationOptions);
});
// [END on_background_message]
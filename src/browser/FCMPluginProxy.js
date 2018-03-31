var FCMPluginProxy = (function () {
    function FCMPluginProxy() {
        var root = document.getElementsByTagName("body")[0];
        if (!window.firebase) {
            var mainScript = document.createElement("script");
            mainScript.async = true;
            mainScript.src =
                document.location.protocol +
                    "//www.gstatic.com/firebasejs/4.12.0/firebase.js";
            mainScript.onload = this.loadLocalSDK;
            mainScript.onerror = function () {
                throw new Error("Could not load Firebase SDK");
            };
            root.appendChild(mainScript);
        }
    }
    FCMPluginProxy.prototype.subscribeToTopic = function (success, error, opts) { };
    FCMPluginProxy.prototype.registerNotification = function (success, error, opts) {
        var messaging = firebase.messaging();
        messaging.onMessage(function (payload) {
            opts[0](payload);
        });
        success();
    };
    FCMPluginProxy.prototype.getToken = function (success, error, opts) {
        var messaging = firebase.messaging();
        messaging
            .getToken()
            .then(function (currentToken) {
            if (currentToken) {
                success(currentToken);
            }
            else {
                // show permission request.
                console.log("No Instance ID token available. Request permission to generate one.");
                error();
            }
        })
            .catch(function (err) {
            console.log("An error occurred while retrieving token. ", err);
            error();
        });
    };
    FCMPluginProxy.prototype.onTokenRefresh = function (success, error, opts) {
        if (opts && opts.length) {
            var messaging = firebase.messaging();
            messaging.onTokenRefresh(function () {
                opts[0]();
            });
            success();
        }
        error();
    };
    FCMPluginProxy.prototype.loadLocalSDK = function () {
        var config = {
            messagingSenderId: "953120264638"
        };
        firebase.initializeApp(config);
        var messaging = firebase.messaging();
        messaging
            .requestPermission()
            .then(function () {
            console.log("Notification permission granted.");
        })
            .catch(function (err) {
            console.log("Unable to get permission to notify.", err);
        });
    };
    return FCMPluginProxy;
}());
var proxy = new FCMPluginProxy();
module.exports = proxy;
require("cordova/exec/proxy").add("FCMPlugin", proxy);

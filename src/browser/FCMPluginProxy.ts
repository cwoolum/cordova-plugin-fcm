interface Window {
  firebase: any;
}

declare var firebase: any;

class FCMPluginProxy {
  constructor() {
    var root: HTMLBodyElement = document.getElementsByTagName("body")[0];

    if (!window.firebase) {
      var mainScript = document.createElement("script");
      mainScript.async = true;
      mainScript.src =
        document.location.protocol +
        "//www.gstatic.com/firebasejs/4.12.0/firebase.js";
      mainScript.onload = this.loadLocalSDK;
      mainScript.onerror = () => {
        throw new Error("Could not load Firebase SDK");
      };

      root.appendChild(mainScript);
    }
  }

  subscribeToTopic(success: any, error: any, opts: any): void {}

  registerNotification(success: any, error: any, opts: any): void {
    const messaging = firebase.messaging();

    messaging.onMessage((payload: any) => {
      opts[0](payload);
    });

    success();
  }

  getToken(success: any, error: any, opts: any): void {
    const messaging = firebase.messaging();

    messaging
      .getToken()
      .then((currentToken: string) => {
        if (currentToken) {
          success(currentToken);
        } else {
          // show permission request.
          console.log(
            "No Instance ID token available. Request permission to generate one."
          );
          error();
        }
      })
      .catch((err: any) => {
        console.log("An error occurred while retrieving token. ", err);
        error();
      });
  }

  onTokenRefresh(success: any, error: any, opts: any): void {
    if (opts && opts.length) {
      const messaging = firebase.messaging();

      messaging.onTokenRefresh(() => {
        opts[0]();
      });

      success();
    }

    error();
  }

  private loadLocalSDK(): void {
    var config = {
      messagingSenderId: "SENDER_ID"
    };
    firebase.initializeApp(config);

    const messaging = firebase.messaging();

    messaging
      .requestPermission()
      .then(() => {
        console.log("Notification permission granted.");
      })
      .catch((err: any) => {
        console.log("Unable to get permission to notify.", err);
      });
  }
}

var proxy = new FCMPluginProxy();
module.exports = proxy;
require("cordova/exec/proxy").add("FCMPlugin", proxy);

if (typeof window !== "undefined" && typeof window.Notification === "undefined") {
  function NotificationStub(title, options) {
    if (typeof console !== "undefined" && console.log) {
      console.log("[Notification stub]", title, options);
    }
  }
  NotificationStub.permission = "denied";
  NotificationStub.requestPermission = function () {
    return Promise.resolve("denied");
  };
  window.Notification = NotificationStub;
}

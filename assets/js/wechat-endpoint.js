{/* <script src="https://res.wx.qq.com/open/js/jweixin-1.6.0.js"></script> */}
function loadWeChatSDK(callback) {
  if (window.wx) {
    callback();
    return;
  }
  var script = document.createElement('script');
  script.src = "https://res.wx.qq.com/open/js/jweixin-1.6.0.js";
  script.onload = callback;
  document.head.appendChild(script);
}

async function setupWeChat() {
  try {

    const description_meta_tag = document.querySelector('meta[name="description"]');
    const description = description_meta_tag ? description_meta_tag.content : ''; 

    const currentUrl = window.location.href;
    const resp = await fetch(
      `https://wechat-signature-server.onrender.com/wechat-signature?url=${encodeURIComponent(
        currentUrl
      )}`
    );
    const config = await resp.json();

    wx.config({
      debug: false,
      appId: config.appId,
      timestamp: config.timestamp,
      nonceStr: config.nonceStr,
      signature: config.signature,
      jsApiList: [
        "updateAppMessageShareData",
        "updateTimelineShareData",
      ],
    });

    wx.ready(() => {
      const shareData = {
        title: window.WECHAT_SHARE_TITLE || document.title,
        desc: window.WECHAT_SHARE_DESC || description,
        link: window.WECHAT_SHARE_LINK || currentUrl,
        imgUrl: window.WECHAT_SHARE_IMG || "https://codingmind.com/assets/img/no-text-logo.png",
      };

      wx.updateAppMessageShareData(shareData); // share to friends
      wx.updateTimelineShareData(shareData); // share to timeline
    });

    wx.error((err) => {
      console.error("WeChat config error:", err);
    });
  } catch (error) {
    console.error("WeChat config error:", error);
  }
}

loadWeChatSDK(setupWeChat);
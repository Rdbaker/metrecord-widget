let ResourcesConstants;

if (ENVIRONMENT === "production") {
  ResourcesConstants = {
    API_URL: "https://api.metrecord.com",
    APP_URL: "https://app.metrecord.com",
    IFRAME_URL: "https://js.metrecord.com/widget/index.html",
    WS_URL: "wss://api.metrecord.com",
    WWW_URL: "https://www.metrecord.com",
  };
} else {
  ResourcesConstants = {
    API_URL: "http://localhost:4050",
    APP_URL: "http://localhost:3000",
    IFRAME_URL: "http://localhost:9001/index-embed.html",
    WS_URL: "ws://localhost:4050",
    WWW_URL: "https://localhost:4050",
  };
}

export const DEBUG = ENVIRONMENT !== "production";
export const API_URL = ResourcesConstants.API_URL;
export const IFRAME_URL = ResourcesConstants.IFRAME_URL;
export const APP_URL = ResourcesConstants.APP_URL;
export const WWW_URL = ResourcesConstants.WWW_URL;
export const WS_URL = ResourcesConstants.WS_URL;

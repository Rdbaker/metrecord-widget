let ResourcesConstants;
let ENVIRONMENT = "";

if (ENVIRONMENT === "production") {
  ResourcesConstants = {
    API_URL: "https://snapperapi.herokuapp.com",
    APP_URL: "https://app.agorachat.org",
    IFRAME_URL: "https://js.snapper.org/embed/index.html",
    WS_URL: "wss://snapperapi.herokuapp.com",
    WWW_URL: "https://www.agorachat.org",
  };
} else {
  ResourcesConstants = {
    API_URL: "http://localhost:4000",
    APP_URL: "http://localhost:3000",
    IFRAME_URL: "http://localhost:9001/index-embed.html",
    WS_URL: "ws://localhost:4000",
    WWW_URL: "https://localhost:4000",
  };
}

export const DEBUG = ENVIRONMENT !== "production";
export const API_URL = ResourcesConstants.API_URL;
export const IFRAME_URL = ResourcesConstants.IFRAME_URL;
export const APP_URL = ResourcesConstants.APP_URL;
export const WWW_URL = ResourcesConstants.WWW_URL;
export const WS_URL = ResourcesConstants.WS_URL;

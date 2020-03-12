import getContext from "shared/context";
import {
  DomainVerificationError,
  UnmountedError,
} from "shared/errors";
import * as EventTypes from "shared/eventTypes";
import { IFRAME_URL } from "shared/resources";
import uuid from "shared/uuid";

import './style.css';

const METRECORD_WRAPPER_ID = "metrecord-container";
const IFRAME_ID = "metrecord-iframe-element";

class Metrecord {

  private debugMode: boolean = false;
  private domainAllowed: boolean = true;
  private onloadFunc: () => undefined;
  private clientId: string;
  private iframe: any;
  private appName: string;

  constructor(onloadFunc = (): undefined => (void(0))) {
    this.onloadFunc = onloadFunc;
  }

  public init = (clientId: string, appName?: string) => {
    this.clientId = clientId;
    this.appName = appName;
    this.initializeIframe();
    this.mountIframe();
  }

  public debug = () => {
    this.ensureAllowed();
    this.debugMode = !this.debugMode;
    console.info(`[Metrecord] debug mode ${this.debugMode ? "enabled" : "disabled"}`);
    this.iframe.contentWindow.postMessage({type: EventTypes.SET_DEBUG_MODE, value: this.debugMode}, "*");
  }

  public open = () => {
    this.ensureMounted();
    this.ensureAllowed();
    this.iframe.contentWindow.postMessage({type: EventTypes.START_FEEDBACK_FLOW, value: undefined}, "*");
  }

  public submit = () => {
    this.ensureMounted();
    this.ensureAllowed();
    // TODO: submit some feedback
  }

  private getUserId = () => {
    try {
      const userId = localStorage.getItem("metrecord_user_id");
      if (!userId) {
        const newUserId = uuid();
        localStorage.setItem("metrecord_user_id", newUserId);
        return newUserId;
      } else {
        return userId;
      }
    } catch (e) {
      return uuid();
    }
  }

  private ensureMounted = () => {
    if (!document.getElementById(IFRAME_ID)) {
      throw new UnmountedError("metrecord.init needs to be called first");
    }
  }

  private ensureAllowed = () => {
    if (!this.domainAllowed) {
      throw new DomainVerificationError(`${window.location.host} is not permitted to use client ID ${this.clientId}`);
    }
  }

  private onChangeContainerClass = (classnames: string) => {
    this.iframe.className = classnames;
    if (classnames) {
      this.iframe.contentWindow.postMessage({ type: EventTypes.CHANGE_CONTAINER_CLASS_DONE, value: null }, '*');
    }
  }


  private receiveMessage = (event: MessageEvent) => {
    if (!!event && !!event.data && !!event.data.type) {
      switch (event.data.type) {
        case EventTypes.CHANGE_CONTAINER_CLASS:
          this.onChangeContainerClass(event.data.value);
          break;
        case EventTypes.DOMAIN_NOT_ALLOWED:
          this.handleDomainNotAllowed();
          break;
        case EventTypes.BOOTSTRAP_DONE:
          this.handleBootstrapDone();
          break;
      }
    }
  }

  private handleBootstrapDone = () => {
    const metrecordApi = (window as any).metrecord;
    metrecordApi.open = this.open;
    metrecordApi.submit = this.submit;
    metrecordApi.debug = this.debug;
    metrecordApi._c = (window as any).metrecord._c;

    this.runPriorCalls();
    (window as any).metrecord = metrecordApi;
  }

  private handleDomainNotAllowed = () => {
    this.domainAllowed = false;
  }

  private initializeIframe = () => {
    if (!document.getElementById(IFRAME_ID)) {
      const iframe: any = document.createElement("iframe");
      iframe.onload = () => {
        this.iframe.contentWindow.postMessage({ type: EventTypes.INIT_IFRAME, value: {
          clientId: this.clientId,
          context: getContext(),
          user: this.getUserId(),
          appName: this.appName,
        }}, "*");
      };
      iframe.src = IFRAME_URL;
      iframe.id = IFRAME_ID;
      iframe.crossorigin = "anonymous";
      this.iframe = iframe;
    }
  }

  private runPriorCalls = () => {
    const allowedCalls = ["open", "debug", "submit"];
    const priorCalls = ((window as any).metrecord && (window as any).metrecord._c && typeof (window as any).metrecord._c === "object") ? (window as any).metrecord._c : [];
    priorCalls.forEach((call: string[]) => {
      const method = call[0];
      const args = call[1];
      if (allowedCalls.includes(method)) {
        (this as any)[method].apply(this, args);
      }
    });
    this.onloadFunc.call((window as any).metrecord, (window as any).metrecord);
  }

  private mountIframe = () => {
    if (!document.getElementById(IFRAME_ID)) {
      window.addEventListener("message", this.receiveMessage, false);
      const wrapper: any = document.createElement("div");
      wrapper.id = METRECORD_WRAPPER_ID;
      wrapper.style = `z-index: ${Number.MAX_SAFE_INTEGER}; width: 0; height: 0; position: relative;`;
      wrapper.appendChild(this.iframe);
      document.body.appendChild(wrapper);
    }
  }
}

export default ((window) => {
  const onloadFunc: () => undefined = (
    window.metrecord &&
    window.metrecord.onload &&
    typeof window.metrecord.onload === "function") ? window.metrecord.onload : () => undefined;
  const initCall = window.metrecord._c.filter((call: string[]) => call[0] === "init")[0];
  const metrecordApi: () => undefined = () => undefined;
  const metrecord: Metrecord = new Metrecord(onloadFunc);

  (metrecordApi as any).init = metrecord.init;

  if (initCall) {
    (metrecordApi as any)[initCall[0]].apply(metrecordApi, initCall[1]);
  }

})(window as any);

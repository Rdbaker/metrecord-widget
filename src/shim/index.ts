import getContext from "shared/context";
import {
  DomainVerificationError,
  UnmountedError,
} from "shared/errors";
import * as EventTypes from "shared/eventTypes";
import { IFRAME_URL } from "shared/resources";
import uuid from "shared/uuid";

const SNAPPER_WRAPPER_ID = "snapper-container";
const IFRAME_ID = "snapper-iframe-element";

class Snapper {

  private debugMode: boolean = false;
  private domainAllowed: boolean = true;
  private onloadFunc: () => undefined;
  private clientId: string;
  private iframe: any;
  private timerMap: any = {};

  constructor(onloadFunc = (): undefined => (void(0))) {
    this.onloadFunc = onloadFunc;
  }

  public init = (clientId: string) => {
    this.clientId = clientId;
    this.initializeIframe();
    this.mountIframe();
  }

  public snap = () => {
    this.ensureAllowed();
    this.ensureMounted();
    this.iframe.contentWindow.postMessage({
      type: EventTypes.RECORD_SNAPSHOT,
      value: { context: getContext(), user: this.getUserId() },
    }, "*");
  }

  public time = (metric: string) => {
    const time = performance.now();
    this.ensureAllowed();
    this.ensureMounted();
    if (!this.timerMap.hasOwnProperty(metric)) {
      this.timerMap[metric] = time;
    } else {
      const diff = time - this.timerMap[metric];
      delete this.timerMap[metric];
      this.iframe.contentWindow.postMessage({
        type: EventTypes.TIME,
        value: { time_ms: diff, metric },
      }, "*");
    }
  }

  public increment = (metric: string, amount: number = 1) => {
    this.ensureAllowed();
    this.ensureMounted();
    this.iframe.contentWindow.postMessage({
      type: EventTypes.INCREMENT_COUNT,
      value: { metric, amount },
    }, "*");
  }

  public debug = () => {
    this.ensureAllowed();
    this.debugMode = !this.debugMode;
    console.info(`[Snapper] debug mode ${this.debugMode ? "enabled" : "disabled"}`);
    this.iframe.contentWindow.postMessage({type: EventTypes.SET_DEBUG_MODE, value: this.debugMode}, "*");
  }

  private getUserId = () => {
    try {
      const userId = localStorage.getItem("snapper_user_id");
      if (!userId) {
        const newUserId = uuid();
        localStorage.setItem("snapper_user_id", newUserId);
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
      throw new UnmountedError("snapper.init needs to be called first");
    }
  }

  private ensureAllowed = () => {
    if (!this.domainAllowed) {
      throw new DomainVerificationError(`${window.location.host} is not permitted to use client ID ${this.clientId}`);
    }
  }

  private receiveMessage = (event: MessageEvent) => {
    if (!!event && !!event.data && !!event.data.type) {
      switch (event.data.type) {
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
    const snapperApi = (window as any).snapper;
    snapperApi.snap = this.snap;
    snapperApi.time = this.time;
    snapperApi.debug = this.debug;
    snapperApi.increment = this.increment;
    snapperApi._c = (window as any).snapper._c;

    this.runPriorCalls();
    (window as any).snapper = snapperApi;
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
        }}, "*");
      };
      iframe.src = IFRAME_URL;
      iframe.id = IFRAME_ID;
      iframe.crossorigin = "anonymous";
      iframe.style = "width: 0; height: 0; z-index: -1; visibility: hidden; display: none;";
      this.iframe = iframe;
    }
  }

  private runPriorCalls = () => {
    const allowedCalls = ["snap", "debug", "time"];
    const priorCalls = ((window as any).snapper && (window as any).snapper._c && typeof (window as any).snapper._c === "object") ? (window as any).snapper._c : [];
    priorCalls.forEach((call: string[]) => {
      const method = call[0];
      const args = call[1];
      if (allowedCalls.includes(method)) {
        (this as any)[method].apply(this, args);
      }
    });
    this.onloadFunc.call((window as any).agora, (window as any).agora);
  }

  private mountIframe = () => {
    if (!document.getElementById(IFRAME_ID)) {
      window.addEventListener("message", this.receiveMessage, false);
      const wrapper: any = document.createElement("div");
      wrapper.id = SNAPPER_WRAPPER_ID;
      wrapper.style = `z-index: ${Number.MAX_SAFE_INTEGER}; width: 0; height: 0; position: relative;`;
      wrapper.appendChild(this.iframe);
      document.body.appendChild(wrapper);
    }
  }
}

export default ((window) => {
  const onloadFunc: () => undefined = (
    window.snapper &&
    window.snapper.onload &&
    typeof window.snapper.onload === "function") ? window.snapper.onload : () => undefined;
  const initCall = window.snapper._c.filter((call: string[]) => call[0] === "init")[0];
  const snapperApi: () => undefined = () => undefined;
  const snapper: Snapper = new Snapper(onloadFunc);

  (snapperApi as any).init = snapper.init;

  if (initCall) {
    (snapperApi as any)[initCall[0]].apply(snapperApi, initCall[1]);
  }

})(window as any);

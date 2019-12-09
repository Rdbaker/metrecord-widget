import getContext from "shared/context";
import {
  DomainVerificationError,
  UnmountedError,
} from "shared/errors";
import * as EventTypes from "shared/eventTypes";
import { IFRAME_URL } from "shared/resources";
import uuid from "shared/uuid";
import { SizeLimitedStack } from "shared/sizeLimitedStack";
import { IClickTrack, IPerformanceTrack } from "shared/interfaces";
import { CPURecorder } from "shared/recordCpu";

const METRECORD_WRAPPER_ID = "metrecord-container";
const IFRAME_ID = "metrecord-iframe-element";

class Metrecord {

  private debugMode: boolean = false;
  private domainAllowed: boolean = true;
  private alreadySnapped: boolean = false;
  private onloadFunc: () => undefined;
  private clientId: string;
  private iframe: any;
  private clickStack: SizeLimitedStack<IClickTrack> = new SizeLimitedStack(500);
  private cpuRecorder: CPURecorder;
  private appName: string;

  constructor(onloadFunc = (): undefined => (void(0))) {
    this.onloadFunc = onloadFunc;
    this.cpuRecorder = new CPURecorder(this.handleHighCPU.bind(this), 0.8);
  }

  public init = (clientId: string, appName?: string) => {
    this.clientId = clientId;
    this.appName = appName;
    this.registerEventHandlers();
    this.initializeIframe();
    this.mountIframe();
    // if (!document.hidden) {
    //   this.cpuRecorder.start();
    // }
  }

  public registerEventHandlers = () => {
    window.document.onclick = this.onDocumentClick;
    window.onerror = this.onWindowError;
    window.onunhandledrejection = this.onWindowUnhandledRejection;
    window.onblur = this.onWindowBlur;
    window.onfocus = this.onWindowFocus;
  }

  public snap = () => {
    this.ensureAllowed();
    this.ensureMounted();
    if (!this.alreadySnapped) {
      this.alreadySnapped = true;
      this.iframe.contentWindow.postMessage({
        type: EventTypes.RECORD_SNAPSHOT,
        value: { context: getContext(), user: this.getUserId() },
      }, "*");
    }
  }

  public track = (metric: string, value: number = 1) => {
    this.ensureAllowed();
    this.ensureMounted();
    this.iframe.contentWindow.postMessage({
      type: EventTypes.TRACK,
      value: { value, metric },
    }, "*");
  }

  public debug = () => {
    this.ensureAllowed();
    this.debugMode = !this.debugMode;
    console.info(`[Metrecord] debug mode ${this.debugMode ? "enabled" : "disabled"}`);
    this.iframe.contentWindow.postMessage({type: EventTypes.SET_DEBUG_MODE, value: this.debugMode}, "*");
  }

  private onDocumentClick = (e: any) => {
    this.clickStack.push({
      clickTarget: e.target,
      clientTimestamp: Date.now(),
    });
  }

  private onWindowBlur = () => {
    this.cpuRecorder.stop();
  }

  private onWindowFocus = () => {
    // this.cpuRecorder.start();
  }

  private handleHighCPU = (perf: IPerformanceTrack) => {
    const highCPUData = {
      cpuPctUtilization: perf.cpuApprox,
      clicks: this.clickStack.map(evt => ({
        elt: evt.clickTarget.outerHTML,
        clientTimestamp: evt.clientTimestamp
      })),
      context: getContext(),
    };

    this.iframe.contentWindow.postMessage({
      type: EventTypes.HIGH_CPU,
      value: highCPUData,
    }, "*");
  }

  private onWindowUnhandledRejection = (e: any) => {
    const errorData = {
      message: e.reason.message,
      fileName: e.reason.fileName,
      lineNumber: e.reason.lineNumber,
      columnNumber: e.reason.columnNumber,
      name: e.reason.name,
      clientTimestamp: Date.now(),
      context: getContext(),
      clicks: this.clickStack.map(evt => ({
        elt: evt.clickTarget.outerHTML,
        clientTimestamp: evt.clientTimestamp,
      }))
    };
    this.iframe.contentWindow.postMessage({
      type: EventTypes.ERROR,
      value: errorData,
    }, "*");
  }

  private onWindowError = (message: string, fileName: string, lineNumber: number, columnNumber: number, error: Error) => {
    const errorData = {
      message,
      fileName,
      lineNumber,
      columnNumber,
      stack: error.stack,
      name: error.name,
      clientTimestamp: Date.now(),
      context: getContext(),
      clicks: this.clickStack.map(evt => ({
        elt: evt.clickTarget.outerHTML,
        clientTimestamp: evt.clientTimestamp,
      }))
    };
    this.iframe.contentWindow.postMessage({
      type: EventTypes.ERROR,
      value: errorData,
    }, "*");
    return false;
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
    const metrecordApi = (window as any).metrecord;
    metrecordApi.snap = this.snap;
    metrecordApi.track = this.track;
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
    const allowedCalls = ["snap", "debug", "track"];
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

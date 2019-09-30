interface IConnectionInfo {
  downlink: number;
  effectiveType: string;
  rtt: number;
  type: string;
  saveData: boolean;
  downlinkMax: number;
}

interface ILocationContext {
  hash: string;
  host: string;
  hostname: string;
  href: string;
  origin: string;
  pathname: string;
  port: string;
  protocol: string;
  search: string;
}

interface IDocumentContext {
  referrer: string;
  title: string;
  linkTextCssCount: number;
  scriptCount: number;
}

export interface IPerformanceContext {
  userAgent: string;
  languages: readonly string[];
  preferredLanguage: string;
  connection: IConnectionInfo;
  platform: string;
  memoryInGb: number;
  performance: Performance;
  location: ILocationContext;
  document: IDocumentContext;
}

const getPerformance = (): Performance => {
  try {
    return window.performance.toJSON();
  } catch (e) {
    return null;
  }
}

const getUserAgent = (): String => window.navigator.userAgent;
const getLanguages = (): readonly String[] => window.navigator.languages;
const getPreferredLanguage = (): String => window.navigator.language;
const getConnection = (): IConnectionInfo => {
  const conn: any = (window.navigator as any).connection || {};
  return {
    downlink: conn.downlink,
    effectiveType: conn.effectiveType,
    rtt: conn.rtt,
    saveData: conn.saveData,
    downlinkMax: conn.downlinkMax,
    type: conn.type,
  };
};
const getPlatform = (): String => window.navigator.platform;
const getGBMemory = (): Number => (window.navigator as any).deviceMemory;
const getLocation = (): ILocationContext => {
  const loc = window.location;
  return {
    hash: loc.hash,
    host: loc.host,
    hostname: loc.hostname,
    href: loc.href,
    origin: loc.origin,
    pathname: loc.pathname,
    port: loc.port,
    protocol: loc.protocol,
    search: loc.search,
  };
}
const getDocument = (): IDocumentContext => {
  return {
    referrer: document.referrer,
    title: document.title,
    linkTextCssCount: document.querySelectorAll('link[type="text/css"]').length,
    scriptCount: document.querySelectorAll('script').length,
  };
}

export default (): IPerformanceContext => ({
  userAgent: getUserAgent(),
  languages: getLanguages(),
  preferredLanguage: getPreferredLanguage(),
  connection: getConnection(),
  platform: getPlatform(),
  memoryInGb: getGBMemory(),
  performance: getPerformance(),
  location: getLocation(),
  document: getDocument(),
});

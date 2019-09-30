const padLeft = (str, width = 4, pad = "0") => {
  while (str.length < width) {
    str = pad + str;
  }
  return str;
};

const s4 = (num: number) => {
  return padLeft(num.toString(16), 4, "0");
};

const cryptoUuid = (crypto) => {
  const buffer = new Uint16Array(8);
  crypto.getRandomValues(buffer);

  // set 4 in byte 7
  buffer[3] = buffer[3] & 0xFFF | 0x4000;
  // set 2 most significant bits of byte 9 to '10'
  buffer[4] = buffer[4] & 0x3FFF | 0x8000;

  return [
    s4(buffer[0]) + s4(buffer[1]),
    s4(buffer[2]),
    s4(buffer[3]),
    s4(buffer[4]),
    s4(buffer[5]) + s4(buffer[6]) + s4(buffer[7]),
  ].join("-");
};

const randomUuid = (): string => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === "x" ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const uuid = (): string => {
  const crypto = window.crypto || (window as any).msCrypto;
  if (crypto && crypto.getRandomValues) {
    try {
      return cryptoUuid(crypto);
    } catch (e) {
      console.warn('could not generate uuid', e);
    }
  }

  return randomUuid();
};

export default uuid;

import "babel-polyfill";

export const checkStatus = async (res: Response) => {
  if (!res.ok) {
    try {
      throw await res.json();
    } catch {
      throw res;
    }
  }

  return res;
};

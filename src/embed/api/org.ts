import { API_URL } from "shared/resources";

export const OrgAPI = {
  fetchPublicOrg(clientId: string) {
    return fetch(`${API_URL}/widget/orgs/me`, {
      headers: {
        "Content-Type": "application/json",
        "X-Metrecord-Client-Id": clientId,
      },
      method: "GET",
    });
  },
};

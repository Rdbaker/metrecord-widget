import { API_URL } from "shared/resources";

export const OrgAPI = {
  fetchPublicOrg(clientId: string) {
    return fetch(`${API_URL}/widget/orgs/${clientId}`, {
      headers: {
        "Content-Type": "application/json",
        "X-Snapper-Client-Id": clientId,
      },
      method: "GET",
    });
  },
};

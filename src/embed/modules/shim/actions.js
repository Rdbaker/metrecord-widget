import { ActionTypes as ShimActionTypes } from './constants';


export const receivePublicOrg = ({ org, properties }) => ({
  type: ShimActionTypes.receivePublicOrg,
  payload: { org, properties },
});
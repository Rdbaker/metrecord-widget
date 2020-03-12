import { merge, map, indexBy, prop, groupBy } from 'ramda';

import { ActionTypes as ShimActionTypes, OrgPropertyNamespaces } from 'modules/shim/constants';


const defaultState = {
  org: {},
  orgProps: {},
};

const handleReceivePublicOrg = (state, { org, properties }) => {
  const groupedAndIndexedProperties = map(
    (namespacedProperties) => map(
      property => property.value,
      indexBy(
        prop('name'),
        map(
          property => ({ name: property.name, value: property.value }),
          namespacedProperties
        )
      ),
    ),
    groupBy((prop) => OrgPropertyNamespaces[prop.namespace], properties)
  )
  return merge(state,
    {
      orgProps: groupedAndIndexedProperties,
      org,
    }
  );
}


export default (state = defaultState, action) => {
  switch (action.type) {
    case ShimActionTypes.receivePublicOrg:
      return handleReceivePublicOrg(state, action.payload);
    default:
      return state;
  }
};
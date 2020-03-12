const root = state => state.ui;

export const isHidden = state => root(state).hidden;
export const uiViewAndType = state => {
  const ui = root(state);
  return {
    view: ui.view,
    type: ui.type
  };
}
export const uiType = state => root(state).type;
export const uiView = state => root(state).view;
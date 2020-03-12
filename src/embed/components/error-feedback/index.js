import React from 'react';
import { connect } from 'react-redux';

import { uiType } from 'modules/ui/selectors';

import InitialErrorView from './initial';
import './style.css';


const ErrorFeedback = ({
  uiType,
}) => {
  let component = null;

  switch(uiType) {
    case 'ERROR.INITIAL_SHOW':
      component = <InitialErrorView />
      break;
    default:
      component = null;
      break;
  }


  return component;
}


const mapStateToProps = state => ({
  uiType: uiType(state),
})


export default connect(mapStateToProps)(ErrorFeedback);
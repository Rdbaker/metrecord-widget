import React, { Component } from 'react';
import { connect } from 'react-redux';

import { isHidden, uiView } from 'modules/ui/selectors';
import ErrorFeedback from 'components/error-feedback';
import FeedbackForm from 'components/feedback-form';

import './Widget.css';


class Widget extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    if (this.props.isHidden) {
      return null;
    }

    let component = null

    switch(this.props.uiView) {
      case 'FEEDBACK_VIEW':
        component = <FeedbackForm />;
        break;
      case 'ERROR_ALERT':
        component = <ErrorFeedback />;
        break;
      default:
        component = null;
        break;
    }

    return component;
  }
}

const mapStateToProps = state => ({
  hidden: isHidden(state),
  uiView: uiView(state),
})


export default connect(mapStateToProps)(Widget);
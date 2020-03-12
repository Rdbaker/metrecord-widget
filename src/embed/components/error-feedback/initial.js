import React, { useState, useEffect } from 'react';
import { CSSTransition } from 'react-transition-group';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/pro-solid-svg-icons';

import { changeContainerClass } from 'modules/ui/actions';

import './style.css';
import { IframeViews, IframeViewTypes } from '../../modules/ui/constants';


const InitialErrorView = ({
  setViewAndType,
  changeContainerClass,
}) => {
  const [clicked, setClicked] = useState(true);
  useEffect(() => {
    setTimeout(() => {
      setClicked(false)
    }, 100)
  }, [])

  const dismiss = () => {
    setTimeout(() => {
      changeContainerClass('')
      setViewAndType(IframeViews.NONE, IframeViewTypes.NONE);
    }, 200)
    setClicked(true);
  }

  const accept = () => {
    setTimeout(() => {
      changeContainerClass('')
      setViewAndType(IframeViews.ERROR_ALERT, IframeViewTypes.ERROR_FORM)
    }, 200)
    setClicked(true);
  }

  return (
    <CSSTransition
      in={!clicked}
      timeout={0}
      classNames="error-feedback-initial-transition"
    >
      <div className="error-feedback-initial--container">
        <div onClick={dismiss} className="error-feedback-initial--dismiss">
          <FontAwesomeIcon icon={faTimes} size="lg" />
        </div>
        <div className="error-feedback-initial--prompt">
          Oops! Looks like there was an error on this page. Do you want to <span onClick={accept}>give feedback?</span>
        </div>
      </div>
    </CSSTransition>
  )
}

const mapStateToProps = () => ({});

const mapDispatchToProps = dispatch => ({
  setViewAndType: (view, type) => dispatch(setViewAndType({ view, type })),
  changeContainerClass: (classname) => dispatch(changeContainerClass(classname)),
})

export default connect(mapStateToProps, mapDispatchToProps)(InitialErrorView);
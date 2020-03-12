import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { CSSTransition } from 'react-transition-group';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCommentAltEdit } from '@fortawesome/pro-duotone-svg-icons';

// import Button from 'components/shared/Button';
// import LoadingDots from 'components/shared/LoadingDots';
import { WWW_URL } from 'shared/resources';
import { changeContainerClass, setViewAndType, hideUI } from 'modules/ui/actions';
import { IframeViews, IframeViewTypes } from 'modules/ui/constants';

import './style.css';


const FeedbackForm = ({
  setViewAndType,
  changeContainerClass,
  hideUI,
}) => {
  const [clicked, setClicked] = useState(true);
  useEffect(() => {
    setTimeout(() => {
      setClicked(false)
    }, 100)
  }, [])

  const close = () => {
    setClicked(true);
    setTimeout(() => {
      changeContainerClass('')
      setViewAndType(IframeViews.NONE, IframeViewTypes.NONE);
    }, 200)
  }

  return (
    <CSSTransition
      in={!clicked}
      timeout={0}
      classNames="feedback-form-transition"
    >
      <div className="feedback-modal-container">
        <div className="feedback-modal-overlay-mask" onClick={close} />
        <div className={'feedback-modal-content'}>
          whats poppin lil mama?
          <a href={WWW_URL} className="metrecord-poweredby-container" target="_blank" rel="noopener nofollower">
            <FontAwesomeIcon icon={faCommentAltEdit} color="#647897" /> by <span className="metrecord-poweredby-link">Metrecord</span>
          </a>
        </div>
      </div>
    </CSSTransition>
  );
}

const mapStateToProps = () => ({});

const mapDispatchToProps = dispatch => ({
  hideUI: () => dispatch(hideUI()),
  setViewAndType: (view, type) => dispatch(setViewAndType({ view, type })),
  changeContainerClass: (classname) => dispatch(changeContainerClass(classname)),
})

export default connect(mapStateToProps, mapDispatchToProps)(FeedbackForm);
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import QrReader from 'react-qr-reader';

class QrReaderWarper extends Component {
  static propTypes = {
    onError: PropTypes.func.isRequired,
    onScan: PropTypes.func.isRequired,
    delay: PropTypes.number.isRequired
  };

  constructor(props) {
    super(props);
    this.state = { delay: (props.delay > 0) ? props.delay : false };
  }

  componentDidUpdate(prevProps) {
    const {
      delay
    } = this.props;

    if (delay !== prevProps.delay) {
      this.setState({ delay: (delay > 0) ? delay : false });
    }
  }

  render() {
    const { delay } = this.state;
    const { onError, onScan } = this.props;

    return (<QrReader delay={delay} onError={onError} onScan={onScan} />);
  }
}

export default QrReaderWarper;

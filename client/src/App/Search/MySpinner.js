import React from 'react';
import { css } from '@emotion/core';
import { ClipLoader } from 'react-spinners';
import {
  Row,
  Col,
  } from 'reactstrap';
 
class MySpinner extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true
    }
  }
  render() {
    return (
      <div className='sweet-loading'>
      	<Row className="justify-content-center">
				<ClipLoader
					className="align-self-center"
				  	css={`
						display: block;
						margin: 0 auto;
						border-color: red;
					`}
					sizeUnit={"px"}
					size={150}
					color={'#123abc'}
					loading={this.state.loading}
				/>
		</Row>
      </div> 
    )
  }
}
export default MySpinner;
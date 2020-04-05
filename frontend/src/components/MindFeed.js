import React, {Component} from 'react';
import * as apiCalls from '../api/apiCalls';

class MindFeed extends Component {

    componentDidMount() {
        apiCalls.loadMinds(this.props.user);
    }

    render() {
        return (
            <div className="card card-header text-center">
                There are no minds
            </div>
        );
    }
}

export default MindFeed;
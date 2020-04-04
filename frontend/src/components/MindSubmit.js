import React, {Component} from 'react';
import ProfileImageWithDefault from "./ProfileImageWithDefault";
import {connect} from 'react-redux';
import * as apiCalls from '../api/apiCalls';
import ButtonWithProgress from "./ButtonWithProgress";

class MindSubmit extends Component {
    state = {
        focused: false,
        content: undefined,
        pendingApiCall: false
    };

    onChangeContent = (event) => {
        const value = event.target.value;
        this.setState({content: value});
    };

    onFocus = () => {
        this.setState({focused: true});
    };

    onClickCancel = () => {
        this.setState({
            focused: false,
            content: ''
        });
    };

    onClickSend = () => {
        const body ={
            content: this.state.content
        };
        this.setState({pendingApiCall: true});
        apiCalls.postMind(body)
            .then(response => {
                this.setState({
                    focused: false,
                    content: '',
                    pendingApiCall: false
                })
            }).catch(reason => {
                this.setState({pendingApiCall: false})
        });
    };

    render() {
        return (
            <div className="card d-flex flex-row p-1">
                <ProfileImageWithDefault
                    className="rounded-circle m-1"
                    width="32"
                    height="32"
                    image={this.props.loggedInUser.image}
                />
                <div className="flex-fill">
                    <textarea
                        className="form-control w=100"
                        rows={this.state.focused ? 3 : 1}
                        onFocus={this.onFocus}
                        value={this.state.content}
                        onChange={this.onChangeContent}
                    />
                    {this.state.focused && (
                        <div className="text-right mt-1">
                            <ButtonWithProgress
                                className="btn btn-success"
                                onClick={this.onClickSend}
                                disabled={this.state.pendingApiCall}
                                pendingApiCall={this.state.pendingApiCall}
                                text="Send"
                            />
                            <button
                                className="btn btn-light ml-1"
                                onClick={this.onClickCancel}
                                disabled={this.state.pendingApiCall}
                            >
                                <i className="fas fa-times"/>
                                Cancel
                            </button>
                        </div>)}
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        loggedInUser: state
    }
};

export default connect(mapStateToProps)(MindSubmit);
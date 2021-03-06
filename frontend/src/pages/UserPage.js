import React from "react";
import * as apiCalls from '../api/apiCalls';
import ProfileCard from "../components/ProfileCard";
import {connect} from 'react-redux';
import MindFeed from "../components/MindFeed";
import Spinner from "../components/Spinner";

export class UserPage extends React.Component {

    state = {
        user: undefined,
        userNotFound: false,
        isLoadingUser: false,
        inEditMode: false,
        originalDisplayName: undefined,
        pendingUpdateCall: false,
        image: undefined,
        errors: {}
    };

    componentDidMount() {
        this.loadUser();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.match.params.username !== this.props.match.params.username) {
            this.loadUser();
        }
    }

    loadUser() {
        const username = this.props.match.params.username;
        if (!username) {
            return;
        }
        this.setState({userNotFound: false, isLoadingUser: true});
        apiCalls.getUser(username)
            .then(response =>
                this.setState({user: response.data, isLoadingUser: false})
            ).catch(error => {
            this.setState({userNotFound: true, isLoadingUser: false})
        });
    }

    onCLickEdit = () => {
        this.setState({inEditMode: true})
    };

    onCLickCancel = () => {
        const user = {...this.state.user};
        if (this.state.originalDisplayName !== undefined) {
            user.displayName = this.state.originalDisplayName;

        }
        this.setState({
            user,
            originalDisplayName: undefined,
            inEditMode: false,
            image: undefined,
            errors: {}
        })
    };

    onCLickSave = () => {
        const userId = this.props.loggedInUser.id;
        const userUpdate = {
            displayName: this.state.user.displayName,
            image: this.state.image && this.state.image.split(',')[1]
        };
        this.setState({pendingUpdateCall: true});
        apiCalls.updateUser(userId, userUpdate)
            .then(response => {
                const user = {...this.state.user};
                user.image = response.data.image;
                this.setState({
                    originalDisplayName: undefined,
                    inEditMode: false,
                    pendingUpdateCall: false,
                    user,
                    image: undefined
                }, () => {
                    const action = {
                        type: 'UPDATE-SUCCESS',
                        payload: user
                    };
                    this.props.dispatch(action);
                });
            }).catch((error) => {
            let errors = {};
            if (error.response.data.validationErrors) {
                errors = error.response.data.validationErrors;
            }
            this.setState({
                pendingUpdateCall: false,
                errors
            });
        });
    };

    onChangeDisplayName = (event) => {
        const user = {...this.state.user};
        let originalDisplayName = this.state.originalDisplayName;
        if (originalDisplayName === undefined) {
            originalDisplayName = user.displayName;
        }
        user.displayName = event.target.value;
        const errors = {...this.state.errors};
        errors.displayName = undefined;
        this.setState({user, originalDisplayName, errors});
    };

    onFileSelect = (event) => {
        if (event.target.files.length === 0) {
            return;
        }
        const errors = {...this.state.errors};
        errors.image = undefined;
        const file = event.target.files[0];
        let reader = new FileReader();
        reader.onloadend = () => {
            this.setState({
                image: reader.result,
                errors
            })
        };
        reader.readAsDataURL(file);
    };

    render() {
        let pageContent;
        if (this.state.isLoadingUser) {
            pageContent = <Spinner />
        } else if (this.state.userNotFound) {
            pageContent = (
                <div className="alert alert-danger text-center">
                    <div className="alert-heading">
                        <i className="fas fa-exclamation-triangle fa-3x"/>
                    </div>
                    <h5>User not found</h5>
                </div>
            )
        } else {
            const isEditable = this.props.loggedInUser.username === this.props.match.params.username;
            pageContent = this.state.user && <ProfileCard
                user={this.state.user}
                isEditable={isEditable}
                inEditMode={this.state.inEditMode}
                onCLickEdit={this.onCLickEdit}
                onCLickCancel={this.onCLickCancel}
                onCLickSave={this.onCLickSave}
                onChangeDisplayName={this.onChangeDisplayName}
                pendingUpdateCall={this.state.pendingUpdateCall}
                loadedImage={this.state.image}
                onFileSelect={this.onFileSelect}
                errors={this.state.errors}
            />
        }
        return (
            <div data-testid="userpage">
                <div className="row">
                    <div className="col">
                        {pageContent}
                    </div>
                    <div className="col">
                        <MindFeed user={this.props.match.params.username} />
                    </div>
                </div>
            </div>
        )
    }Hom
}

UserPage.defaultProps = {
    match: {
        params: {}
    }
};

const mapStateToProps = (state) => {
    return {
        loggedInUser: state
    }
};

export default connect(mapStateToProps)(UserPage);
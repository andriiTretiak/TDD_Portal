import React from "react";
import UserList from "../components/UserList";
import MindSubmit from "../components/MindSubmit";
import {connect} from 'react-redux';

export class HomePage extends React.Component {
    render() {
        return (
            <div data-testid="homepage">
                <div className="row">
                    <div className="col-8">
                        {this.props.loggedInUser.isLoggedIn && <MindSubmit/>}
                    </div>
                    <div className="col-4">
                        <UserList/>
                    </div>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        loggedInUser: state
    }
};

export default connect(mapStateToProps)(HomePage);
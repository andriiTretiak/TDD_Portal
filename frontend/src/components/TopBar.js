import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import {connect} from 'react-redux';

import logo from '../assets/portal-logo.png';

export class TopBar extends Component {
    onClickLogout = () => {
        const action = {
            type: 'LOGOUT_SUCCESS',
        };
        this.props.dispatch(action);
        localStorage.removeItem('portal-auth');
    };

    render() {
        const { user } = this.props;
        const { username, isLoggedIn } = user;

        let links = (
            <ul className="nav navbar-nav ml-auto">
                <li className="nav-item">
                    <Link to="/signup" className="nav-link">
                        Sign up
                    </Link>
                </li>
                <li className="nav-item">
                    <Link to="/login" className="nav-link">
                        Login
                    </Link>
                </li>
            </ul>
        );
        if (isLoggedIn) {
            links = (
                <ul className="nav navbar-nav ml-auto">
                    <li className="nav-item">
                        <Link to={`/${username}`} className="nav-link">
                            Profile
                        </Link>
                    </li>
                    <li className="nav-item nav-link" onClick={this.onClickLogout} style={{cursor: 'pointer'}}>
                        Logout
                    </li>
                </ul>
            );
        }
        return (
            <div className="bg-white shadow-sm mb-2">
                <div className="wontainer">
                    <nav className="navbar navbar-light navbar-expand">
                        <Link to="/" className="navbar-brand">
                            <img src={logo} width="60" alt="Portal" /> Inner Portal
                        </Link>
                        {links}
                    </nav>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        user: state,
    };
};

export default connect(mapStateToProps)(TopBar);
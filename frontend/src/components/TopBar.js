import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import {connect} from 'react-redux';

import logo from '../assets/portal-logo.png';
import ProfileImageWithDefault from "./ProfileImageWithDefault";

export class TopBar extends Component {
    onClickLogout = () => {
        const action = {
            type: 'LOGOUT_SUCCESS',
        };
        this.props.dispatch(action);
        localStorage.removeItem('portal-auth');
    };

    render() {
        const {user} = this.props;
        const {username, isLoggedIn} = user;

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
                    <li className="nav-item dropdown">
                        <div className="d-flex" style={{cursor: 'pointer'}}>
                            <ProfileImageWithDefault
                                className="rounded-circle m-auto"
                                width="32"
                                height="32"
                                image={this.props.user.image}
                            />
                            <span className="nav-link dropdown-toggle">{this.props.user.displayName}</span>
                        </div>
                        <div className="p-0 shadow dropdown-menu">
                            <Link to={`/${username}`} className="dropdown-item">
                                <i className="fas fa-user text-info"/>Profile
                            </Link>
                            <span className="dropdown-item" onClick={this.onClickLogout} style={{cursor: 'pointer'}}>
                                <i className="fas fa-sign-out-alt text-danger"/>Logout
                            </span>
                        </div>
                    </li>
                </ul>
            );
        }
        return (
            <div className="bg-white shadow-sm mb-2">
                <div className="wontainer">
                    <nav className="navbar navbar-light navbar-expand">
                        <Link to="/" className="navbar-brand">
                            <img src={logo} width="60" alt="Portal"/> Inner Portal
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
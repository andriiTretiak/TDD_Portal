import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import {connect} from 'react-redux';

import logo from '../assets/portal-logo.png';
import ProfileImageWithDefault from "./ProfileImageWithDefault";

export class TopBar extends Component {
    onClickLogout = () => {
        this.setState({
            dropdownVisible: false
        });
        const action = {
            type: 'LOGOUT_SUCCESS',
        };
        this.props.dispatch(action);
    };

    state = {
        dropdownVisible: false
    };

    componentDidMount() {
        document.addEventListener('click', this.onClickTracker);
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.onClickTracker);
    }

    onClickTracker = (event) => {
        if (this.actionArea && !this.actionArea.contains(event.target)) {
            this.setState({
                dropdownVisible: false
            });
        }
    };

    onClickDisplayName = () => {
        this.setState({dropdownVisible: true});
    };

    onClickProfile =()=>{
        this.setState({dropdownVisible: false});
    };

    assignActionArea = (area) => {
        this.actionArea = area;
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
            let dropdownClass = "p-0 shadow dropdown-menu";
            if (this.state.dropdownVisible) {
                dropdownClass += ' show';
            }
            links = (
                <ul className="nav navbar-nav ml-auto" ref={this.assignActionArea}>
                    <li className="nav-item dropdown">
                        <div
                            className="d-flex"
                            style={{cursor: 'pointer'}}
                            onClick={this.onClickDisplayName}
                        >
                            <ProfileImageWithDefault
                                className="rounded-circle m-auto"
                                width="32"
                                height="32"
                                image={this.props.user.image}
                            />
                            <span className="nav-link dropdown-toggle">{this.props.user.displayName}</span>
                        </div>
                        <div
                            className={dropdownClass}
                            data-testid="drop-down-menu"
                        >
                            <Link
                                to={`/${username}`}
                                className="dropdown-item"
                                onClick={this.onClickProfile}
                            >
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
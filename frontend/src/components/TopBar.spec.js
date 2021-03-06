import React from "react";
import {fireEvent, render} from "@testing-library/react";
import TopBar from './TopBar';
import {MemoryRouter} from 'react-router-dom';
import {Provider} from 'react-redux';
import {createStore} from 'redux';
import authReducer from '../redux/authReducer';
import * as authActions from '../redux/authActions';

const loggedInState = {
    id: 1,
    username: 'user1',
    displayName: 'display1',
    image: 'image1',
    password: 'P4ssword',
    isLoggedIn: true,
};

const defaultState = {
    id: 0,
    username: '',
    displayName: '',
    image: '',
    password: '',
    isLoggedIn: false,
};

let store;

const setup = (state = defaultState) => {
    store = createStore(authReducer, state);
    return render(
        <Provider store={store}>
            <MemoryRouter>
                <TopBar />
            </MemoryRouter>
        </Provider>
    );
};

describe('TopBar', () => {
    describe('Layout', () => {
        it('has application logo', () => {
            const { container } = setup();
            const logo = container.querySelector('img');
            expect(logo.src).toContain('portal-logo.png');
        });
        it('has link to home from logo', () => {
            const { container } = setup();
            const logo = container.querySelector('img');
            expect(logo.parentElement.getAttribute('href')).toBe('/');
        });
        it('has link to signup', () => {
            const { queryByText } = setup();
            const signupLink = queryByText("Sign up");
            expect(signupLink.getAttribute('href')).toBe('/signup');
        });
        it('has link for login', () => {
            const { queryByText } = setup();
            const loginLink = queryByText("Login");
            expect(loginLink.getAttribute("href")).toBe('/login');
        });
        it('has link to logout when user logged in', () => {
            const { queryByText } = setup(loggedInState);
            const logoutLink = queryByText('Logout');
            expect(logoutLink).toBeInTheDocument();
        });
        it('has link to usr profile when user logged in', () => {
            const { queryByText } = setup(loggedInState);
            const profileLink = queryByText('Profile');
            expect(profileLink.getAttribute('href')).toBe('/user1');
        });
        it('displays the displayName when user logged in', () => {
            const { queryByText } = setup(loggedInState);
            const displayName = queryByText('display1');
            expect(displayName).toBeInTheDocument();
        });
        it('displays user image when user logged in', () => {
            const { container } = setup(loggedInState);
            const images = container.querySelectorAll('img');
            const userImage = images[1];
            expect(userImage.src).toContain('/images/profile/' + loggedInState.image);
        });
    });
    describe('Interactions', () => {
        it('displays login and signup links when user clicks logout', () => {
            const { queryByText } = setup(loggedInState);
            const logoutLink = queryByText('Logout');
            fireEvent.click(logoutLink);
            const loginLink = queryByText('Login');
            expect(loginLink).toBeInTheDocument();
        });
        it('removes show class to drop down menu when clicking app logo', () => {
            const { queryByText, queryByTestId, container } = setup(loggedInState);
            const displayName = queryByText('display1');
            fireEvent.click(displayName);

            const logo = container.querySelector('img');
            fireEvent.click(logo);

            const dropdownMenu = queryByTestId('drop-down-menu');
            expect(dropdownMenu).not.toHaveClass('show');
        });
        it('removes show class to drop down menu when clicking logout', () => {
            const { queryByText, queryByTestId } = setup(loggedInState);
            const displayName = queryByText('display1');
            fireEvent.click(displayName);

            fireEvent.click(queryByText('Logout'));

            store.dispatch(authActions.loginSuccess(loggedInState));

            const dropdownMenu = queryByTestId('drop-down-menu');
            expect(dropdownMenu).not.toHaveClass('show');
        });
        it('removes show class to drop down menu when clicking profile', () => {
            const { queryByText, queryByTestId } = setup(loggedInState);
            const displayName = queryByText('display1');
            fireEvent.click(displayName);

            fireEvent.click(queryByText('Profile'));

            const dropdownMenu = queryByTestId('drop-down-menu');
            expect(dropdownMenu).not.toHaveClass('show');
        });
    });
});
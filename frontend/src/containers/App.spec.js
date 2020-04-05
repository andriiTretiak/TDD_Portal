import React from 'react';
import {fireEvent, render, waitForElement} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import {Provider} from 'react-redux';
import configureStore from '../redux/configureStore';
import axios from 'axios';
import App from './App';
import * as apiCalls from '../api/apiCalls';

apiCalls.listUsers = jest.fn().mockResolvedValue({
    data: {
        content: [],
        number: 0,
        size:3
    }
});


apiCalls.loadMinds = jest.fn().mockResolvedValue({
    data: {
        content: [],
        number: 0,
        size:3
    }
});

apiCalls.getUser = jest.fn().mockResolvedValue({
    data: {
        id: 1,
        username: 'user1',
        displayName: 'display1',
        image: 'profile1.png'
    }
});

const mockSuccessGetUser1 = {
    data: {
        id: 1,
        username: 'user1',
        displayName: 'display1',
        image: 'profile1.png'
    }
};

const mockSuccessGetUser2 = {
    data: {
        id: 2,
        username: 'user2',
        displayName: 'display2',
        image: 'profile2.png'
    }
};

const mockFailGetUser = {
    response: {
        data: {
            message: 'User not found'
        }
    }
};

const setUserOneLoggedInStorage = () => {
    localStorage.setItem(
        'portal-auth',
        JSON.stringify({
            id: 1,
            username: 'user1',
            displayName: 'display1',
            image: 'profile1.png',
            password: 'P4ssword',
            isLoggedIn: true
        })
    );
};

beforeEach(() => {
    localStorage.clear();
    delete axios.defaults.headers.common['Authorization'];
});

const setup = path => {
    const store = configureStore(false);
    return render(
        <Provider store={store}>
            <MemoryRouter initialEntries={[path]}>
                <App />
            </MemoryRouter>
        </Provider>
    );
};
const changeEvent = content => ({
    target: {
        value: content,
    }
});

describe('App', () => {
    it('displays HomePage when url is /', () => {
        const { queryByTestId } = setup('/');
        expect(queryByTestId('homepage')).toBeInTheDocument();
    });
    it('displays LoginPage when url is /login', () => {
        const { container } = setup('/login');
        expect(container.querySelector('h1')).toHaveTextContent('Login');
    });
    it('displays only LoginPage when url is /login', () => {
        const { queryByTestId } = setup('/login');
        const homepageDiv = queryByTestId('homepage');
        expect(homepageDiv).not.toBeInTheDocument();
    });
    it('displays UserSignupPage when url is /signup', () => {
        const { container } = setup('/signup');
        expect(container.querySelector('h1')).toHaveTextContent('Sign Up');
    });
    it('displays userpage when path is other than /, /login or /signup', () => {
        const { queryByTestId } = setup('/user1');
        expect(queryByTestId('userpage')).toBeInTheDocument();
    });
    it('displays topBar when url is /', () => {
        const { container } = setup('/');
        const navigation = container.querySelector('nav');
        expect(navigation).toBeInTheDocument();
    });
    it('displays topBar when url is /login', () => {
        const { container } = setup('/login');
        const navigation = container.querySelector('nav');
        expect(navigation).toBeInTheDocument();
    });
    it('displays topBar when url is /signup', () => {
        const { container } = setup('/signup');
        const navigation = container.querySelector('nav');
        expect(navigation).toBeInTheDocument();
    });
    it('displays topBar when path is other than /, /login or /signup', () => {
        const { container } = setup('/user1');
        const navigation = container.querySelector('nav');
        expect(navigation).toBeInTheDocument();
    });
    it('shows UserSignupPage when clicking signup', () => {
        const { container, queryByText } = setup('/');
        const signupLink = queryByText('Sign up');
        fireEvent.click(signupLink);
        const header = container.querySelector('h1');
        expect(header).toHaveTextContent('Sign Up');
    });
    it('show LoginPage when clicking login', () => {
        const { container, queryByText } = setup('/');
        const loginLink = queryByText('Login');
        fireEvent.click(loginLink);
        const header = container.querySelector('h1');
        expect(header).toHaveTextContent('Login');
    });
    it('show HomePage when clicking the logo', () => {
        const { container, queryByTestId } = setup('/login');
        const logo = container.querySelector('img');
        fireEvent.click(logo);
        expect(queryByTestId('homepage')).toBeInTheDocument();
    });
    it('displays my profile on topbar after login success', async () => {
        const { queryByPlaceholderText, container, queryByText } = setup('/login');
        const userNameInput = queryByPlaceholderText('Your username');
        const passwordInput = queryByPlaceholderText('Your password');
        fireEvent.change(userNameInput, changeEvent('user1'));
        fireEvent.change(passwordInput, changeEvent('P4ssword'));
        const button = container.querySelector('button');
        axios.post = jest.fn().mockResolvedValue({
            data: {
                id: 1,
                username: 'user1',
                displayName: 'display1',
                image: 'profile1.png',
            }
        });
        fireEvent.click(button);
        const myProfileLink = await waitForElement(() => queryByText('Profile'));
        expect(myProfileLink).toBeInTheDocument();
    });
    it('displays profile on topbar after signup success', async () => {
        const { queryByPlaceholderText, container, queryByText } = setup('/signup');

        const displayNameInput = queryByPlaceholderText('Your display name');
        const usernameInput = queryByPlaceholderText('Your username');
        const passwordInput = queryByPlaceholderText('Your password');
        const passwordRepeatInput = queryByPlaceholderText('Repeat your password');

        fireEvent.change(displayNameInput, changeEvent('my-display-name'));
        fireEvent.change(usernameInput, changeEvent('my-username'));
        fireEvent.change(passwordInput, changeEvent('P4ssword'));
        fireEvent.change(passwordRepeatInput, changeEvent('P4ssword'));

        const button = container.querySelector('button');
        axios.post = jest.fn().mockResolvedValueOnce({
            data: {
                message: "User saved",
            },
        }).mockResolvedValueOnce({
            data: {
                id: 1,
                username: 'user1',
                displayName: 'display1',
                image: 'profile1.png',
            }
        });
        fireEvent.click(button);
        const myProfileLink = await waitForElement(() => queryByText('Profile'));
        expect(myProfileLink).toBeInTheDocument();
    });
    it('saves logged in user data to localStorage after login success', async () => {
        const { queryByPlaceholderText, container, queryByText } = setup('/login');
        const userNameInput = queryByPlaceholderText('Your username');
        const passwordInput = queryByPlaceholderText('Your password');
        fireEvent.change(userNameInput, changeEvent('user1'));
        fireEvent.change(passwordInput, changeEvent('P4ssword'));
        const button = container.querySelector('button');
        axios.post = jest.fn().mockResolvedValue({
            data: {
                id: 1,
                username: 'user1',
                displayName: 'display1',
                image: 'profile1.png',
            }
        });
        fireEvent.click(button);
        await waitForElement(() => queryByText('Profile'));
        const dataInStore = JSON.parse(localStorage.getItem('portal-auth'));
        expect(dataInStore).toEqual({
            id:1,
            username: 'user1',
            displayName: 'display1',
            image: 'profile1.png',
            password: 'P4ssword',
            isLoggedIn: true
        });
    });
    it('displays logged in tapBar when storage has logged in user data', () => {
        setUserOneLoggedInStorage();
        const {queryByText} = setup('/');
        const myProfileLink = queryByText('Profile');
        expect(myProfileLink).toBeInTheDocument();
    });
    it('sets axios authorization with base64 encoded user credentials after login success', async () => {
        const { queryByPlaceholderText, container, queryByText } = setup('/login');
        const userNameInput = queryByPlaceholderText('Your username');
        const passwordInput = queryByPlaceholderText('Your password');
        fireEvent.change(userNameInput, changeEvent('user1'));
        fireEvent.change(passwordInput, changeEvent('P4ssword'));
        const button = container.querySelector('button');
        axios.post = jest.fn().mockResolvedValue({
            data: {
                id: 1,
                username: 'user1',
                displayName: 'display1',
                image: 'profile1.png',
            }
        });
        fireEvent.click(button);
        await waitForElement(() => queryByText('Profile'));
        const axiosAuthorization = axios.defaults.headers.common['Authorization'];
        const encoded = btoa('user1:P4ssword');
        const expectedAuthorization = `Basic ${encoded}`;
        expect(axiosAuthorization).toBe(expectedAuthorization);
    });
    it('updates user page after clicking my profile when another user page was opened', async () => {
        apiCalls.getUser = jest.fn()
            .mockResolvedValueOnce(mockSuccessGetUser2)
            .mockResolvedValueOnce(mockSuccessGetUser1);
        setUserOneLoggedInStorage();
        const { queryByText } = setup('/user2');
        await waitForElement(() => queryByText('display2@user2'));
        const profileLink = queryByText('Profile');
        fireEvent.click(profileLink);
        const user1Info = await waitForElement(() => queryByText('display1@user1'));
        expect(user1Info).toBeInTheDocument();
    });
    it('updates user page after clicking my profile when another non existing user page was opened', async () => {
        apiCalls.getUser = jest.fn()
            .mockRejectedValueOnce(mockFailGetUser)
            .mockResolvedValueOnce(mockSuccessGetUser1);
        setUserOneLoggedInStorage();
        const { queryByText } = setup('/user50');
        await waitForElement(() => queryByText('User not found'));
        const profileLink = queryByText('Profile');
        fireEvent.click(profileLink);
        const user1Info = await waitForElement(() => queryByText('display1@user1'));
        expect(user1Info).toBeInTheDocument();
    });
});

console.error = () => { };
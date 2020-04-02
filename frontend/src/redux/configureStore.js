import {applyMiddleware, createStore} from 'redux';
import thunk from 'redux-thunk';
import logger from 'redux-logger';
import * as apiCalls from '../api/apiCalls';

import authReducer from './authReducer';

export default (addLogger = true) => {

    let localStorageData = localStorage.getItem('portal-auth');

    let persistedState ={
        id: 0,
        username: '',
        displayName: '',
        image: '',
        password: '',
        isLoggedIn: false,
    };

    if(localStorageData){
        try{
            persistedState =JSON.parse(localStorageData);
            apiCalls.setAuthorizationHeader(persistedState);
        } catch (error) {

        }
    }

    const middleware = addLogger
        ? applyMiddleware(thunk, logger)
        : applyMiddleware(thunk);

    const store = createStore(authReducer, persistedState, middleware);
    store.subscribe(() =>{
        localStorage.setItem('portal-auth', JSON.stringify(store.getState()));
        apiCalls.setAuthorizationHeader(store.getState());
    });
    return store;
}
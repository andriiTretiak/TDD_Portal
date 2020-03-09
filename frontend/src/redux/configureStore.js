import {applyMiddleware, createStore} from 'redux';
import thunk from 'redux-thunk';
import logger from 'redux-logger';

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
        } catch (error) {

        }
    }

    const middlewares = [thunk];
    if(addLogger)
        middlewares.push(logger);
    const store = createStore(authReducer, persistedState, applyMiddleware(...middlewares));
    store.subscribe(() =>{
        localStorage.setItem('portal-auth', JSON.stringify(store.getState()));
    });
    return store;
}
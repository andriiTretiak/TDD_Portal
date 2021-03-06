import axios from 'axios';

export const signup = (user) => {
    return axios.post('/api/1.0/users', user);
};

export const login = (user) => {
    return axios.post('/api/1.0/login', {}, {auth: user});
};

export const setAuthorizationHeader = ({ username, password, isLoggedIn }) => {
    if(isLoggedIn)
        axios.defaults.headers.common['Authorization'] = `Basic ${btoa(username+':'+password)}`;
    else
        delete axios.defaults.headers.common['Authorization'];
};

export const listUsers = (param = {page: 0, size: 3}) => {
    const path = `/api/1.0/users?page=${param.page || 0}&size=${param.size || 3}`;
    return axios.get(path);
};

export const getUser = (username) => {
    return axios.get(`/api/1.0/users/${username}`);
};

export const updateUser = (userId, body) => {
    return axios.put('/api/1.0/users/'+ userId, body);
};

export const postMind = (mind) => {
    return axios.post('/api/1.0/minds', mind);
};

export const loadMinds = (username) => {
    const basePath = username
        ? `/api/1.0/users/${username}/minds`
        : '/api/1.0/minds';
    return axios.get(basePath + '?page=0&size=5&sort=id,desc');
};

export const loadOldMinds = (mindId, username) => {
    const basePath = username
        ? `/api/1.0/users/${username}/minds/${mindId}`
        : `/api/1.0/minds/${mindId}`;
    return axios.get(basePath + '?direction=before&page=0&size=5&sort=id,desc');
};

export const loadNewMinds = (mindId, username) => {
    const basePath = username
        ? `/api/1.0/users/${username}/minds/${mindId}`
        : `/api/1.0/minds/${mindId}`;
    return axios.get(basePath + '?direction=after&sort=id,desc');
};

export const loadNewMindsCount = (mindId, username) => {
    const basePath = username
        ? `/api/1.0/users/${username}/minds/${mindId}`
        : `/api/1.0/minds/${mindId}`;
    return axios.get(basePath + '?direction=after&count=true');
};

export const postMindFile = (file) => {
    return axios.post('/api/1.0/minds/upload', file);
};

export const deleteMind = (mindId) => {
    return axios.delete('/api/1.0/minds/' + mindId);
};
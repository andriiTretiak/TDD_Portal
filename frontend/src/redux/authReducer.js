const initialState = {
    id: 0,
    username: '',
    displayName: '',
    image: '',
    password: '',
    isLoggedIn: false,
};

export default function authReducer(state = initialState, action) {
    switch (action.type) {
        case 'LOGOUT_SUCCESS':
            localStorage.removeItem('portal-auth');
            return { ...initialState };
        case 'LOGIN_SUCCESS':
            return { ...action.payload, isLoggedIn: true };
        case 'UPDATE-SUCCESS' :
            return {
                ...state,
                displayName: action.payload.displayName,
                image: action.payload.image
            };
        default:
            return state;
    }
}
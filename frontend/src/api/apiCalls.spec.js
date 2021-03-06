import axios from 'axios';
import * as apiCalls from "./apiCalls";

describe('apiCalls', () => {
    describe('signup', () => {
        it('calls /api/1.0/users', () => {
            const mockSignup = jest.fn();
            axios.post = mockSignup;
            apiCalls.signup();

            const path = mockSignup.mock.calls[0][0];
            expect(path).toBe('/api/1.0/users');
        });
    });
    describe('login', () => {
        it('calls api/1.0/login', () => {
            const mockLogin = jest.fn();
            axios.post = mockLogin;
            apiCalls.login({username: 'test-user', password: 'P4ssword'});
            const path = mockLogin.mock.calls[0][0];
            expect(path).toBe('/api/1.0/login');
        })
    });
    describe('listUsers', () => {
        it('calls api/1.0/users?page=0&size=3 when no param for listUsers', () => {
            const mockListUsers = jest.fn();
            axios.get = mockListUsers;
            apiCalls.listUsers();
            expect(mockListUsers).toBeCalledWith('/api/1.0/users?page=0&size=3');
        });
        it('calls api/1.0/users?page=5&size=10 when corresponding params provided for listUsers', () => {
            const mockListUsers = jest.fn();
            axios.get = mockListUsers;
            apiCalls.listUsers({page: 5, size:10});
            expect(mockListUsers).toBeCalledWith('/api/1.0/users?page=5&size=10');
        });
        it('calls api/1.0/users?page=5&size=3 when only page param provided for listUsers', () => {
            const mockListUsers = jest.fn();
            axios.get = mockListUsers;
            apiCalls.listUsers({page: 5});
            expect(mockListUsers).toBeCalledWith('/api/1.0/users?page=5&size=3');
        });
        it('calls api/1.0/users?page=0&size=5 when only size param provided for listUsers', () => {
            const mockListUsers = jest.fn();
            axios.get = mockListUsers;
            apiCalls.listUsers({size: 5});
            expect(mockListUsers).toBeCalledWith('/api/1.0/users?page=0&size=5');
        });
    });
    describe('getUser', () => {
        it('calls /api/1.0/users/user5 when user is provided for getUser', () => {
            const mockGetUser = jest.fn();
            axios.get = mockGetUser;
            apiCalls.getUser('user5');
            expect(mockGetUser).toBeCalledWith('/api/1.0/users/user5');
        });
    });
    describe('updateUser', () => {
        it('calls /api/1.0/users/5 when 5 is provided for updateUser', () => {
            const mockUpdateUser = jest.fn();
            axios.put = mockUpdateUser;
            apiCalls.updateUser('5');
            const path = mockUpdateUser.mock.calls[0][0];
            expect(path).toBe('/api/1.0/users/5');
        });
    });
    describe('postMind', () => {
        it('calls /api/1.0/minds', () => {
            const mockPostMind = jest.fn();
            axios.post = mockPostMind;
            apiCalls.postMind();

            const path = mockPostMind.mock.calls[0][0];
            expect(path).toBe('/api/1.0/minds');
        });
    });
    describe('loadMinds', () => {
        it('calls /api/1.0/minds?page=0&size=5&sort=id,desc when no param provided', () => {
            const mockGetMinds = jest.fn();
            axios.get = mockGetMinds;
            apiCalls.loadMinds();
            expect(mockGetMinds).toHaveBeenCalledWith('/api/1.0/minds?page=0&size=5&sort=id,desc');
        });
        it('calls /api/1.0/users/user1/minds?page=0&size=5&sort=id,desc when user param provided', () => {
            const mockGetMinds = jest.fn();
            axios.get = mockGetMinds;
            apiCalls.loadMinds('user1');
            expect(mockGetMinds).toHaveBeenCalledWith('/api/1.0/users/user1/minds?page=0&size=5&sort=id,desc');
        });
    });
    describe('loadOldMinds', () => {
        it('calls /api/1.0/minds/5?direction=before&page=0&size=5&sort=id,desc when no param provided', () => {
            const mockGetMinds = jest.fn();
            axios.get = mockGetMinds;
            apiCalls.loadOldMinds(5);
            expect(mockGetMinds).toHaveBeenCalledWith('/api/1.0/minds/5?direction=before&page=0&size=5&sort=id,desc');
        });
        it('calls /api/1.0/users/user1/minds/5?direction=before&page=0&size=5&sort=id,desc when user param provided', () => {
            const mockGetMinds = jest.fn();
            axios.get = mockGetMinds;
            apiCalls.loadOldMinds(5, 'user1');
            expect(mockGetMinds).toHaveBeenCalledWith('/api/1.0/users/user1/minds/5?direction=before&page=0&size=5&sort=id,desc');
        });
    });
    describe('loadNewMinds', () => {
        it('calls /api/1.0/minds/5?direction=after&sort=id,desc when no param provided', () => {
            const mockGetMinds = jest.fn();
            axios.get = mockGetMinds;
            apiCalls.loadNewMinds(5);
            expect(mockGetMinds).toHaveBeenCalledWith('/api/1.0/minds/5?direction=after&sort=id,desc');
        });
        it('calls /api/1.0/users/user1/minds/5?direction=after&sort=id,desc when user param provided', () => {
            const mockGetMinds = jest.fn();
            axios.get = mockGetMinds;
            apiCalls.loadNewMinds(5, 'user1');
            expect(mockGetMinds).toHaveBeenCalledWith('/api/1.0/users/user1/minds/5?direction=after&sort=id,desc');
        });
    });
    describe('loadNewMindsCount', () => {
        it('calls /api/1.0/minds/5?direction=after&count=true when no param provided', () => {
            const mockGetMinds = jest.fn();
            axios.get = mockGetMinds;
            apiCalls.loadNewMindsCount(5);
            expect(mockGetMinds).toHaveBeenCalledWith('/api/1.0/minds/5?direction=after&count=true');
        });
        it('calls /api/1.0/users/user1/minds/5?direction=after&count=true when user param provided', () => {
            const mockGetMinds = jest.fn();
            axios.get = mockGetMinds;
            apiCalls.loadNewMindsCount(5, 'user1');
            expect(mockGetMinds).toHaveBeenCalledWith('/api/1.0/users/user1/minds/5?direction=after&count=true');
        });
    });
    describe('postMindFile', () => {
        it('calls /api/1.0/minds/upload', () => {
            const mockPostMindFile = jest.fn();
            axios.post = mockPostMindFile;
            apiCalls.postMindFile();

            const path = mockPostMindFile.mock.calls[0][0];
            expect(path).toBe('/api/1.0/minds/upload');
        });
    });
    describe('deleteMind', () => {
        it('calls /api/1.0/minds/5 when mind id param provided as 5', () => {
            const mockDeleteMind = jest.fn();
            axios.delete = mockDeleteMind;
            apiCalls.deleteMind(5);

            const path = mockDeleteMind.mock.calls[0][0];
            expect(path).toBe('/api/1.0/minds/5');
        });
    });
});
import React from 'react';
import {fireEvent, render, waitForDomChange, waitForElement} from '@testing-library/react';
import UserList from './UserList';
import * as apiCalls from '../api/apiCalls';

apiCalls.listUsers = jest.fn().mockResolvedValue({
    data: {
        content: [],
        number: 0,
        size:3
    }
});

const setup = () =>{
    return render(<UserList/>);
};

const mockedEmptySuccessResponse = {
    data: {
        content:[],
        number: 0,
        size: 3
    }
};

const mockedSuccessGetSinglePage = {
    data: {
        content:[
            {
                username: 'user1',
                displayName: 'display1',
                image: ''
            },
            {
                username: 'user2',
                displayName: 'display2',
                image: ''
            },
            {
                username: 'user3',
                displayName: 'display3',
                image: ''
            }
        ],
        number: 0,
        first: true,
        last: true,
        size: 3,
        totalPages: 1
    }
};

const mockedSuccessGetMultiPageFirst = {
    data: {
        content:[
            {
                username: 'user1',
                displayName: 'display1',
                image: ''
            },
            {
                username: 'user2',
                displayName: 'display2',
                image: ''
            },
            {
                username: 'user3',
                displayName: 'display3',
                image: ''
            }
        ],
        number: 0,
        first: true,
        last: false,
        size: 3,
        totalPages: 2
    }
};

const mockedSuccessGetMultiPageLast = {
    data: {
        content:[
            {
                username: 'user4',
                displayName: 'display4',
                image: ''
            }
        ],
        number: 1,
        first: false,
        last: true,
        size: 3,
        totalPages: 2
    }
};

describe('UserList', () => {
    describe('Layout', () => {
        it('has header Users', () => {
            const { container } = setup();
            const header = container.querySelector('h3');
            expect(header).toHaveTextContent('Users');
        });
        it('displays 3 items when listUsers api returns three users', async () => {
            apiCalls.listUsers = jest.fn().mockResolvedValue(mockedSuccessGetSinglePage);
            const { queryByTestId } = setup();
            await waitForDomChange();
            const userGroup = queryByTestId('usergroup');
            expect(userGroup.childElementCount).toBe(3);
        });
        it('displays the displayName@username when listUsers api returns users', async () => {
            apiCalls.listUsers = jest.fn().mockResolvedValue(mockedSuccessGetSinglePage);
            const { queryByText } = setup();
            const firstUser = await waitForElement(() => queryByText('display1@user1'));
            expect(firstUser).toBeInTheDocument();
        });
        it('displays the next button when response has last value as false', async () => {
            apiCalls.listUsers = jest.fn().mockResolvedValue(mockedSuccessGetMultiPageFirst);
            const { queryByText } = setup();
            const nextLink = await waitForElement(() => queryByText('next >'));
            expect(nextLink).toBeInTheDocument();
        });
        it('hides the next button when response has last value as true', async () => {
            apiCalls.listUsers = jest.fn().mockResolvedValue(mockedSuccessGetMultiPageLast);
            const { queryByText } = setup();
            const nextLink = await waitForElement(() => queryByText('next >'));
            expect(nextLink).not.toBeInTheDocument();
        });
        it('displays the previous button when response has first value as false', async () => {
            apiCalls.listUsers = jest.fn().mockResolvedValue(mockedSuccessGetMultiPageLast);
            const { queryByText } = setup();
            const previousLink = await waitForElement(() => queryByText('< previous'));
            expect(previousLink).toBeInTheDocument();
        });
        it('hides the previous button when response has first value as true', async () => {
            apiCalls.listUsers = jest.fn().mockResolvedValue(mockedSuccessGetMultiPageFirst);
            const { queryByText } = setup();
            const previousLink = await waitForElement(() => queryByText('< previous'));
            expect(previousLink).not.toBeInTheDocument();
        });
    });
    describe('Lifecycle', () => {
        it('calls listUsers api when it is rendered', () => {
            apiCalls.listUsers = jest.fn().mockResolvedValue(mockedEmptySuccessResponse);
            setup();
            expect(apiCalls.listUsers).toHaveBeenCalledTimes(1);
        });
        it('calls listUsers method with page zero and size 3', () => {
            apiCalls.listUsers = jest.fn().mockResolvedValue(mockedEmptySuccessResponse);
            setup();
            expect(apiCalls.listUsers).toHaveBeenCalledWith({page:0, size:3});
        });
    });
    describe('Interactions', () => {
        it('loads next page when click next button', async () => {
            apiCalls.listUsers = jest.fn()
                .mockResolvedValueOnce(mockedSuccessGetMultiPageFirst)
                .mockResolvedValueOnce(mockedSuccessGetMultiPageLast);
            const { queryByText } = setup();
            const nextLink = await waitForElement(() => queryByText('next >'));
            fireEvent.click(nextLink);

            const secondPageUser = await waitForElement(() => queryByText('display4@user4'));
            expect(secondPageUser).toBeInTheDocument();
        });
        it('loads previous page when click previous button', async () => {
            apiCalls.listUsers = jest.fn()
                .mockResolvedValueOnce(mockedSuccessGetMultiPageLast)
                .mockResolvedValueOnce(mockedSuccessGetMultiPageFirst);
            const { queryByText } = setup();
            const previousLink = await waitForElement(() => queryByText('< previous'));
            fireEvent.click(previousLink);
            const firstPageUser = await waitForElement(() => queryByText('display1@user1'));
            expect(firstPageUser).toBeInTheDocument();
        });
    });
});
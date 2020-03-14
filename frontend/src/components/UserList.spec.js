import React from 'react';
import {render, waitForDomChange, waitForElement} from '@testing-library/react';
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
});
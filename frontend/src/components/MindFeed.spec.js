import React from "react";
import {render, waitForDomChange, waitForElement} from "@testing-library/react";
import MindFeed from './MindFeed';
import * as apiCalls from '../api/apiCalls';
import {MemoryRouter} from "react-router-dom";

const setup = (props) => {
    return render(
        <MemoryRouter>
            <MindFeed {...props}/>
        </MemoryRouter>
       );
};

const mockEmptyResponse = {
    data: {
        content: []
    }
};

const mockSuccessGetMindsSinglePage = {
    data: {
        content: [
            {
                id: 10,
                content: 'This is the last mind',
                date: 1561294668539,
                user: {
                    id: 1,
                    username: 'user1',
                    displayName: 'display1',
                    image: 'profile1.png'
                }
            }
        ],
        number: 0,
        first: true,
        last: true,
        size: 5,
        totalPages: 1
    }
};

describe('MindFeed', () => {
    describe('Lifecycle', () => {
        it('calls loadMinds when it is rendered', () => {
            apiCalls.loadMinds = jest.fn().mockResolvedValue(mockEmptyResponse);
            setup();
            expect(apiCalls.loadMinds).toHaveBeenCalledTimes(1);
        });
        it('calls loadMinds with user parameter when it is rendered with user property', () => {
            apiCalls.loadMinds = jest.fn().mockResolvedValue(mockEmptyResponse);
            setup({user:"user1"});
            expect(apiCalls.loadMinds).toHaveBeenCalledWith('user1');
        });
        it('calls loadMinds without user parameter when it is rendered without user property', () => {
            apiCalls.loadMinds = jest.fn().mockResolvedValue(mockEmptyResponse);
            setup();
            const parameter = apiCalls.loadMinds.mock.calls[0][0];
            expect(parameter).toBeUndefined();
        });
    });
    describe('Layout', () => {
        it('displays no mind message when the response has empty page', async () => {
            apiCalls.loadMinds = jest.fn().mockResolvedValue(mockEmptyResponse);
            const { queryByText } = setup();
            const message = await waitForElement(() =>
                queryByText('There are no minds')
            );
            expect(message).toBeInTheDocument();
        });
        it('does not display no mind message when the response has page of mind', async () => {
            apiCalls.loadMinds = jest.fn().mockResolvedValue(mockSuccessGetMindsSinglePage);
            const { queryByText } = setup();
            await waitForDomChange();
            expect(queryByText('There are no minds')).not.toBeInTheDocument();
        });
        it('displays spinner when loading the minds', async () => {
            apiCalls.loadMinds = jest.fn().mockImplementation(() => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve(mockSuccessGetMindsSinglePage);
                    }, 300);
                });
            });
            const { queryByText } = setup();
            expect(queryByText('Loading...')).toBeInTheDocument();
        });
        it('displays mind content', async () => {
            apiCalls.loadMinds = jest.fn().mockResolvedValue(mockSuccessGetMindsSinglePage);
            const { queryByText } = setup();
            const mindContent = await waitForElement(() => queryByText('This is the last mind'));
            expect(mindContent).toBeInTheDocument();
        });
    });
});
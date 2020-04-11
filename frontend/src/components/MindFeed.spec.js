import React from "react";
import {fireEvent, render, waitForDomChange, waitForElement} from "@testing-library/react";
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
const mockSuccessGetMindsFirstOfMultiPage = {
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
            },
            {
                id: 9,
                content: 'This is mind 9',
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
        last: false,
        size: 5,
        totalPages: 2
    }
};
const mockSuccessGetMindsLastOfMultiPage = {
    data: {
        content: [
            {
                id: 1,
                content: 'This is the oldest mind',
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
        totalPages: 2
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
        it('calls loadNewMindsCount with topMind id', async () => {
            apiCalls.loadMinds = jest.fn().mockResolvedValue(mockSuccessGetMindsFirstOfMultiPage);
            apiCalls.loadNewMindsCount =jest.fn().mockResolvedValue({data: {count: 1}});
            const { queryByText } = setup();
            await waitForElement(() => queryByText('There is 1 new mind'));
            const firstParam = apiCalls.loadNewMindsCount.mock.calls[0][0];
            expect(firstParam).toBe(10);
        });
        it('calls loadNewMindsCount with topMind id and username when rendered with user property', async () => {
            apiCalls.loadMinds = jest.fn().mockResolvedValue(mockSuccessGetMindsFirstOfMultiPage);
            apiCalls.loadNewMindsCount =jest.fn().mockResolvedValue({data: {count: 1}});
            const { queryByText } = setup({user: 'user1'});
            await waitForElement(() => queryByText('There is 1 new mind'));
            expect(apiCalls.loadNewMindsCount).toHaveBeenCalledWith(10, 'user1');
        });
        it('displays new minds count as 1 after loadNewMindsCount success', async () => {
            apiCalls.loadMinds = jest.fn().mockResolvedValue(mockSuccessGetMindsFirstOfMultiPage);
            apiCalls.loadNewMindsCount =jest.fn().mockResolvedValue({data: {count: 1}});
            const { queryByText } = setup({user: 'user1'});
            const newMindsCount = await waitForElement(() => queryByText('There is 1 new mind'));
            expect(newMindsCount).toBeInTheDocument();
        });
        it('displays new minds count constantly', async () => {
            apiCalls.loadMinds = jest.fn().mockResolvedValue(mockSuccessGetMindsFirstOfMultiPage);
            apiCalls.loadNewMindsCount =jest.fn().mockResolvedValue({data: {count: 1}});
            const { queryByText } = setup({user: 'user1'});
            await waitForElement(() => queryByText('There is 1 new mind'));
            apiCalls.loadNewMindsCount =jest.fn().mockResolvedValue({data: {count: 2}});
            const newMindsCount = await waitForElement(() => queryByText('There are 2 new minds'));
            expect(newMindsCount).toBeInTheDocument();
        }, 7000);
        it('does not call loadNewMindsCount after component is unmounted', async (done) => {
            apiCalls.loadMinds = jest.fn().mockResolvedValue(mockSuccessGetMindsFirstOfMultiPage);
            apiCalls.loadNewMindsCount =jest.fn().mockResolvedValue({data: {count: 1}});
            const { queryByText, unmount } = setup({user: 'user1'});
            await waitForElement(() => queryByText('There is 1 new mind'));
            unmount();
            setTimeout(() => {
                expect(apiCalls.loadNewMindsCount).toHaveBeenCalledTimes(1);
                done();
            }, 3500);
        }, 7000);
        it('displays new minds count as 1 after loadNewMindsCount success when user does not have minds initially', async () => {
            apiCalls.loadMinds = jest.fn().mockResolvedValue(mockEmptyResponse);
            apiCalls.loadNewMindsCount =jest.fn().mockResolvedValue({data: {count: 1}});
            const { queryByText } = setup({user: 'user1'});
            const newMindsCount = await waitForElement(() => queryByText('There is 1 new mind'));
            expect(newMindsCount).toBeInTheDocument();
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
        it('displays load more when there are next pages', async () => {
            apiCalls.loadMinds = jest.fn().mockResolvedValue(mockSuccessGetMindsFirstOfMultiPage);
            const { queryByText } = setup();
            const loadMore = await waitForElement(() => queryByText('Load More'));
            expect(loadMore).toBeInTheDocument();
        });
    });
    describe('Interactions', () => {
        it('calls loadOldMinds with id when clicking load more', async () => {
            apiCalls.loadMinds = jest.fn().mockResolvedValue(mockSuccessGetMindsFirstOfMultiPage);
            apiCalls.loadOldMinds =jest.fn().mockResolvedValue(mockSuccessGetMindsLastOfMultiPage);
            const { queryByText } = setup();
            const loadMore = await waitForElement(() => queryByText('Load More'));
            fireEvent.click(loadMore);
            const firstParam = apiCalls.loadOldMinds.mock.calls[0][0];
            expect(firstParam).toBe(9);
        });
        it('calls loadOldMinds with mind id and username when clicking load more when rendered with user property', async () => {
            apiCalls.loadMinds = jest.fn().mockResolvedValue(mockSuccessGetMindsFirstOfMultiPage);
            apiCalls.loadOldMinds =jest.fn().mockResolvedValue(mockSuccessGetMindsLastOfMultiPage);
            const { queryByText } = setup({user: 'user1'});
            const loadMore = await waitForElement(() => queryByText('Load More'));
            fireEvent.click(loadMore);
            expect(apiCalls.loadOldMinds).toHaveBeenCalledWith(9, 'user1');
        });
        it('displays loaded old minds when loadOldMinds api call success', async () => {
            apiCalls.loadMinds = jest.fn().mockResolvedValue(mockSuccessGetMindsFirstOfMultiPage);
            apiCalls.loadOldMinds =jest.fn().mockResolvedValue(mockSuccessGetMindsLastOfMultiPage);
            const { queryByText } = setup();
            const loadMore = await waitForElement(() => queryByText('Load More'));
            fireEvent.click(loadMore);
            const oldMind = await waitForElement(() => queryByText('This is the oldest mind'));
            expect(oldMind).toBeInTheDocument();
        });
        it('hides Load More when loadOldMinds api call returns last page', async () => {
            apiCalls.loadMinds = jest.fn().mockResolvedValue(mockSuccessGetMindsFirstOfMultiPage);
            apiCalls.loadOldMinds =jest.fn().mockResolvedValue(mockSuccessGetMindsLastOfMultiPage);
            const { queryByText } = setup();
            const loadMore = await waitForElement(() => queryByText('Load More'));
            fireEvent.click(loadMore);
            await waitForElement(() => queryByText('This is the oldest mind'));
            expect(queryByText('Load More')).not.toBeInTheDocument();
        });
    });
});

console.error = () => {};
import React from "react";
import {fireEvent, render, waitForDomChange, waitForElement} from "@testing-library/react";
import MindFeed from './MindFeed';
import * as apiCalls from '../api/apiCalls';
import {MemoryRouter} from "react-router-dom";
import {Provider} from 'react-redux';
import {createStore} from 'redux';
import authReducer from '../redux/authReducer';

const originalSetInterval = window.setInterval;
const originalClearInterval = window.clearInterval;

let timedFunction;

const loggedInStateUser1 = {
    id: 1,
    username: 'user1',
    displayName: 'display1',
    image: 'image1',
    password: 'P4ssword',
    isLoggedIn: true,
};

const useFakeIntervals = () => {
    window.setInterval = (callback, interval) => {
        timedFunction = callback;
    };
    window.clearInterval = () => {
        timedFunction = undefined
    };
};

const useRealIntervals = () => {
    window.setInterval = originalSetInterval;
    window.clearInterval = originalClearInterval;
};

const runTimer = () => {
    timedFunction && timedFunction();
};

const setup = (props, state = loggedInStateUser1) => {
    const store = createStore(authReducer, state);
    return render(
        <Provider store={store}>
            <MemoryRouter>
                <MindFeed {...props}/>
            </MemoryRouter>
        </Provider>
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

const mockSuccessGetNewMindsList = {
    data: [
        {
            id: 21,
            content: 'This is the newest mind',
            date: 1561294668539,
            user: {
                id: 1,
                username: 'user1',
                displayName: 'display1',
                image: 'profile1.png'
            }
        }
    ]
};
const mockSuccessGetMindsMiddleOfMultiPage = {
    data: {
        content: [
            {
                id: 5,
                content: 'This mind is in middle page',
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
        first: false,
        last: false,
        size: 5,
        totalPages: 2
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
            setup({user: "user1"});
            expect(apiCalls.loadMinds).toHaveBeenCalledWith('user1');
        });
        it('calls loadMinds without user parameter when it is rendered without user property', () => {
            apiCalls.loadMinds = jest.fn().mockResolvedValue(mockEmptyResponse);
            setup();
            const parameter = apiCalls.loadMinds.mock.calls[0][0];
            expect(parameter).toBeUndefined();
        });
        it('calls loadNewMindsCount with topMind id', async () => {
            useFakeIntervals();
            apiCalls.loadMinds = jest.fn().mockResolvedValue(mockSuccessGetMindsFirstOfMultiPage);
            apiCalls.loadNewMindsCount = jest.fn().mockResolvedValue({data: {count: 1}});
            const {queryByText} = setup();
            await waitForDomChange();
            runTimer();
            await waitForElement(() => queryByText('There is 1 new mind'));
            const firstParam = apiCalls.loadNewMindsCount.mock.calls[0][0];
            expect(firstParam).toBe(10);
            useRealIntervals();
        });
        it('calls loadNewMindsCount with topMind id and username when rendered with user property', async () => {
            useFakeIntervals();
            apiCalls.loadMinds = jest.fn().mockResolvedValue(mockSuccessGetMindsFirstOfMultiPage);
            apiCalls.loadNewMindsCount = jest.fn().mockResolvedValue({data: {count: 1}});
            const {queryByText} = setup({user: 'user1'});
            await waitForDomChange();
            runTimer();
            await waitForElement(() => queryByText('There is 1 new mind'));
            expect(apiCalls.loadNewMindsCount).toHaveBeenCalledWith(10, 'user1');
            useRealIntervals();
        });
        it('displays new minds count as 1 after loadNewMindsCount success', async () => {
            useFakeIntervals();
            apiCalls.loadMinds = jest.fn().mockResolvedValue(mockSuccessGetMindsFirstOfMultiPage);
            apiCalls.loadNewMindsCount = jest.fn().mockResolvedValue({data: {count: 1}});
            const {queryByText} = setup({user: 'user1'});
            await waitForDomChange();
            runTimer();
            const newMindsCount = await waitForElement(() => queryByText('There is 1 new mind'));
            expect(newMindsCount).toBeInTheDocument();
            useRealIntervals();
        });
        it('displays new minds count constantly', async () => {
            useFakeIntervals();
            apiCalls.loadMinds = jest.fn().mockResolvedValue(mockSuccessGetMindsFirstOfMultiPage);
            apiCalls.loadNewMindsCount = jest.fn().mockResolvedValue({data: {count: 1}});
            const {queryByText} = setup({user: 'user1'});
            await waitForDomChange();
            runTimer();
            await waitForElement(() => queryByText('There is 1 new mind'));
            apiCalls.loadNewMindsCount = jest.fn().mockResolvedValue({data: {count: 2}});
            runTimer();
            const newMindsCount = await waitForElement(() => queryByText('There are 2 new minds'));
            expect(newMindsCount).toBeInTheDocument();
            useRealIntervals();
        });
        it('does not call loadNewMindsCount after component is unmounted', async () => {
            useFakeIntervals();
            apiCalls.loadMinds = jest.fn().mockResolvedValue(mockSuccessGetMindsFirstOfMultiPage);
            apiCalls.loadNewMindsCount = jest.fn().mockResolvedValue({data: {count: 1}});
            const {queryByText, unmount} = setup({user: 'user1'});
            await waitForDomChange();
            runTimer();
            await waitForElement(() => queryByText('There is 1 new mind'));
            unmount();
            expect(apiCalls.loadNewMindsCount).toHaveBeenCalledTimes(1);
            useRealIntervals();
        });
        it('displays new minds count as 1 after loadNewMindsCount success when user does not have minds initially', async () => {
            useFakeIntervals();
            apiCalls.loadMinds = jest.fn().mockResolvedValue(mockEmptyResponse);
            apiCalls.loadNewMindsCount = jest.fn().mockResolvedValue({data: {count: 1}});
            const {queryByText} = setup({user: 'user1'});
            await waitForDomChange();
            runTimer();
            const newMindsCount = await waitForElement(() => queryByText('There is 1 new mind'));
            expect(newMindsCount).toBeInTheDocument();
            useRealIntervals();
        });
    });
    describe('Layout', () => {
        it('displays no mind message when the response has empty page', async () => {
            apiCalls.loadMinds = jest.fn().mockResolvedValue(mockEmptyResponse);
            const {queryByText} = setup();
            const message = await waitForElement(() =>
                queryByText('There are no minds')
            );
            expect(message).toBeInTheDocument();
        });
        it('does not display no mind message when the response has page of mind', async () => {
            apiCalls.loadMinds = jest.fn().mockResolvedValue(mockSuccessGetMindsSinglePage);
            const {queryByText} = setup();
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
            const {queryByText} = setup();
            expect(queryByText('Loading...')).toBeInTheDocument();
        });
        it('displays mind content', async () => {
            apiCalls.loadMinds = jest.fn().mockResolvedValue(mockSuccessGetMindsSinglePage);
            const {queryByText} = setup();
            const mindContent = await waitForElement(() => queryByText('This is the last mind'));
            expect(mindContent).toBeInTheDocument();
        });
        it('displays load more when there are next pages', async () => {
            apiCalls.loadMinds = jest.fn().mockResolvedValue(mockSuccessGetMindsFirstOfMultiPage);
            const {queryByText} = setup();
            const loadMore = await waitForElement(() => queryByText('Load More'));
            expect(loadMore).toBeInTheDocument();
        });
    });
    describe('Interactions', () => {
        it('calls loadOldMinds with id when clicking load more', async () => {
            apiCalls.loadMinds = jest.fn().mockResolvedValue(mockSuccessGetMindsFirstOfMultiPage);
            apiCalls.loadOldMinds = jest.fn().mockResolvedValue(mockSuccessGetMindsLastOfMultiPage);
            const {queryByText} = setup();
            const loadMore = await waitForElement(() => queryByText('Load More'));
            fireEvent.click(loadMore);
            const firstParam = apiCalls.loadOldMinds.mock.calls[0][0];
            expect(firstParam).toBe(9);
        });
        it('calls loadOldMinds with mind id and username when clicking load more when rendered with user property', async () => {
            apiCalls.loadMinds = jest.fn().mockResolvedValue(mockSuccessGetMindsFirstOfMultiPage);
            apiCalls.loadOldMinds = jest.fn().mockResolvedValue(mockSuccessGetMindsLastOfMultiPage);
            const {queryByText} = setup({user: 'user1'});
            const loadMore = await waitForElement(() => queryByText('Load More'));
            fireEvent.click(loadMore);
            expect(apiCalls.loadOldMinds).toHaveBeenCalledWith(9, 'user1');
        });
        it('displays loaded old minds when loadOldMinds api call success', async () => {
            apiCalls.loadMinds = jest.fn().mockResolvedValue(mockSuccessGetMindsFirstOfMultiPage);
            apiCalls.loadOldMinds = jest.fn().mockResolvedValue(mockSuccessGetMindsLastOfMultiPage);
            const {queryByText} = setup();
            const loadMore = await waitForElement(() => queryByText('Load More'));
            fireEvent.click(loadMore);
            const oldMind = await waitForElement(() => queryByText('This is the oldest mind'));
            expect(oldMind).toBeInTheDocument();
        });
        it('hides Load More when loadOldMinds api call returns last page', async () => {
            apiCalls.loadMinds = jest.fn().mockResolvedValue(mockSuccessGetMindsFirstOfMultiPage);
            apiCalls.loadOldMinds = jest.fn().mockResolvedValue(mockSuccessGetMindsLastOfMultiPage);
            const {queryByText} = setup();
            const loadMore = await waitForElement(() => queryByText('Load More'));
            fireEvent.click(loadMore);
            await waitForElement(() => queryByText('This is the oldest mind'));
            expect(queryByText('Load More')).not.toBeInTheDocument();
        });
        //load new minds
        it('calls loadNewMinds with mind id when clicking New Minds Count card', async () => {
            useFakeIntervals();
            apiCalls.loadMinds = jest.fn().mockResolvedValue(mockSuccessGetMindsFirstOfMultiPage);
            apiCalls.loadNewMindsCount = jest.fn().mockResolvedValue({data: {count: 1}});
            apiCalls.loadNewMinds = jest.fn().mockResolvedValue(mockSuccessGetNewMindsList);
            const {queryByText} = setup();
            await waitForDomChange();
            runTimer();
            const newMindsCount = await waitForElement(() => queryByText('There is 1 new mind'));
            fireEvent.click(newMindsCount);
            const firstParam = apiCalls.loadNewMinds.mock.calls[0][0];
            expect(firstParam).toBe(10);
            useRealIntervals();
        });
        it('calls loadNewMinds with mind id and username when clicking New Minds Count Card when rendered with user property', async () => {
            useFakeIntervals();
            apiCalls.loadMinds = jest.fn().mockResolvedValue(mockSuccessGetMindsFirstOfMultiPage);
            apiCalls.loadNewMindsCount = jest.fn().mockResolvedValue({data: {count: 1}});
            apiCalls.loadNewMinds = jest.fn().mockResolvedValue(mockSuccessGetNewMindsList);
            const {queryByText} = setup({user: 'user1'});

            await waitForDomChange();
            runTimer();
            const newMindsCount = await waitForElement(() => queryByText('There is 1 new mind'));
            fireEvent.click(newMindsCount);
            expect(apiCalls.loadNewMinds).toHaveBeenCalledWith(10, 'user1');
            useRealIntervals();
        });
        it('displays loaded new minds when loadNewMinds api call success', async () => {
            useFakeIntervals();
            apiCalls.loadMinds = jest.fn().mockResolvedValue(mockSuccessGetMindsFirstOfMultiPage);
            apiCalls.loadNewMindsCount = jest.fn().mockResolvedValue({data: {count: 1}});
            apiCalls.loadNewMinds = jest.fn().mockResolvedValue(mockSuccessGetNewMindsList);
            const {queryByText} = setup({user: 'user1'});

            await waitForDomChange();
            runTimer();
            const newMindsCount = await waitForElement(() => queryByText('There is 1 new mind'));
            fireEvent.click(newMindsCount);
            const newMind = await waitForElement(() => queryByText('This is the newest mind'));
            expect(newMind).toBeInTheDocument();
            useRealIntervals();
        });
        it('hides new minds count when loadNewMinds api call success', async () => {
            useFakeIntervals();
            apiCalls.loadMinds = jest.fn().mockResolvedValue(mockSuccessGetMindsFirstOfMultiPage);
            apiCalls.loadNewMindsCount = jest.fn().mockResolvedValue({data: {count: 1}});
            apiCalls.loadNewMinds = jest.fn().mockResolvedValue(mockSuccessGetNewMindsList);
            const {queryByText} = setup({user: 'user1'});

            await waitForDomChange();
            runTimer();
            const newMindsCount = await waitForElement(() => queryByText('There is 1 new mind'));
            fireEvent.click(newMindsCount);
            await waitForElement(() => queryByText('This is the newest mind'));
            expect(queryByText('There is 1 new mind')).not.toBeInTheDocument();
            useRealIntervals();
        });
        it('does not allow loadOldMinds when there is an active api call about it', async () => {
            apiCalls.loadMinds = jest.fn().mockResolvedValue(mockSuccessGetMindsFirstOfMultiPage);
            apiCalls.loadOldMinds = jest.fn().mockResolvedValue(mockSuccessGetMindsLastOfMultiPage);
            const {queryByText} = setup();
            const loadMore = await waitForElement(() => queryByText('Load More'));
            fireEvent.click(loadMore);
            fireEvent.click(loadMore);
            expect(apiCalls.loadOldMinds).toHaveBeenCalledTimes(1);
        });
        it('replace Load More with spinner when there is an active api call about it', async () => {
            apiCalls.loadMinds = jest.fn().mockResolvedValue(mockSuccessGetMindsFirstOfMultiPage);
            apiCalls.loadOldMinds = jest.fn().mockImplementation(() => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve(mockSuccessGetMindsLastOfMultiPage);
                    }, 300);
                });
            });
            const {queryByText} = setup();
            const loadMore = await waitForElement(() => queryByText('Load More'));
            fireEvent.click(loadMore);
            const spinner = await waitForElement(() => queryByText('Loading...'));
            expect(spinner).toBeInTheDocument();
            expect(queryByText('Load More')).not.toBeInTheDocument();
        });
        it('replace spinner with Load More when after api call for loadOldMinds finishes with middle page response', async () => {
            apiCalls.loadMinds = jest.fn().mockResolvedValue(mockSuccessGetMindsFirstOfMultiPage);
            apiCalls.loadOldMinds = jest.fn().mockImplementation(() => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve(mockSuccessGetMindsMiddleOfMultiPage);
                    }, 300);
                });
            });
            const {queryByText} = setup();
            const loadMore = await waitForElement(() => queryByText('Load More'));
            fireEvent.click(loadMore);
            await waitForElement(() => queryByText('This mind is in middle page'));
            expect(queryByText('Loading...')).not.toBeInTheDocument();
            expect(queryByText('Load More')).toBeInTheDocument();
        });
        it('replace spinner with Load More when after api call for loadOldMinds finishes error', async () => {
            apiCalls.loadMinds = jest.fn().mockResolvedValue(mockSuccessGetMindsFirstOfMultiPage);
            apiCalls.loadOldMinds = jest.fn().mockImplementation(() => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        reject({response: {data: {}}});
                    }, 300);
                });
            });
            const {queryByText} = setup();
            const loadMore = await waitForElement(() => queryByText('Load More'));
            fireEvent.click(loadMore);
            await waitForElement(() => queryByText('Loading...'));
            await waitForDomChange();
            expect(queryByText('Loading...')).not.toBeInTheDocument();
            expect(queryByText('Load More')).toBeInTheDocument();
        });
        //load new minds
        it('does not allow loadNewMinds when there is an active api call about it', async () => {
            useFakeIntervals();
            apiCalls.loadMinds = jest.fn().mockResolvedValue(mockSuccessGetMindsFirstOfMultiPage);
            apiCalls.loadNewMindsCount = jest.fn().mockResolvedValue({data: {count: 1}});
            apiCalls.loadNewMinds = jest.fn().mockResolvedValue(mockSuccessGetNewMindsList);
            const {queryByText} = setup({user: 'user1'});

            await waitForDomChange();
            runTimer();
            const newMindsCount = await waitForElement(() => queryByText('There is 1 new mind'));
            fireEvent.click(newMindsCount);
            fireEvent.click(newMindsCount);
            expect(apiCalls.loadNewMinds).toHaveBeenCalledTimes(1);
            useRealIntervals();
        });
        it('replace There is 1 mind with spinner when there is an active api call about it', async () => {
            useFakeIntervals();
            apiCalls.loadMinds = jest.fn().mockResolvedValue(mockSuccessGetMindsFirstOfMultiPage);
            apiCalls.loadNewMindsCount = jest.fn().mockResolvedValue({data: {count: 1}});
            apiCalls.loadNewMinds = jest.fn().mockImplementation(() => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve(mockSuccessGetNewMindsList);
                    }, 300);
                });
            });
            const {queryByText} = setup();
            await waitForDomChange();
            runTimer();
            const newMindsCount = await waitForElement(() => queryByText('There is 1 new mind'));
            fireEvent.click(newMindsCount);
            const spinner = await waitForElement(() => queryByText('Loading...'));
            expect(spinner).toBeInTheDocument();
            expect(queryByText('There is 1 new mind')).not.toBeInTheDocument();
            useRealIntervals();
        });
        it('replace spinner and There is 1 mind when after api call for loadNewMinds finishes with success', async () => {
            useFakeIntervals();
            apiCalls.loadMinds = jest.fn().mockResolvedValue(mockSuccessGetMindsFirstOfMultiPage);
            apiCalls.loadNewMindsCount = jest.fn().mockResolvedValue({data: {count: 1}});
            apiCalls.loadNewMinds = jest.fn().mockImplementation(() => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve(mockSuccessGetNewMindsList);
                    }, 300);
                });
            });
            const {queryByText} = setup();
            await waitForDomChange();
            runTimer();
            const newMindsCount = await waitForElement(() => queryByText('There is 1 new mind'));
            fireEvent.click(newMindsCount);
            await waitForElement(() => queryByText('This is the newest mind'));
            expect(queryByText('Loading...')).not.toBeInTheDocument();
            expect(queryByText('There is 1 new mind')).not.toBeInTheDocument();
            useRealIntervals();
        });
        it('replace spinner with There is 1 mind when after api call for loadNewMinds finishes error', async () => {
            useFakeIntervals();
            apiCalls.loadMinds = jest.fn().mockResolvedValue(mockSuccessGetMindsFirstOfMultiPage);
            apiCalls.loadNewMindsCount = jest.fn().mockResolvedValue({data: {count: 1}});
            apiCalls.loadNewMinds = jest.fn().mockImplementation(() => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        reject({response: {data: {}}});
                    }, 300);
                });
            });

            const {queryByText} = setup();
            await waitForDomChange();
            runTimer();
            const newMindsCount = await waitForElement(() => queryByText('There is 1 new mind'));
            fireEvent.click(newMindsCount);
            await waitForElement(() => queryByText('Loading...'));
            await waitForDomChange();
            expect(queryByText('Loading...')).not.toBeInTheDocument();
            expect(queryByText('There is 1 new mind')).toBeInTheDocument();
            useRealIntervals();
        });
        it('displays Modal when clicking delete on mind', async () => {
            apiCalls.loadMinds = jest.fn().mockResolvedValue(mockSuccessGetMindsFirstOfMultiPage);
            apiCalls.loadNewMindsCount = jest.fn().mockResolvedValue({data: {count: 1}});

            const {queryByTestId, container} = setup();
            await waitForDomChange();
            const deleteButton = container.querySelectorAll('button')[0];
            fireEvent.click(deleteButton);
            const modalRootDiv = queryByTestId('modal-root');
            expect(modalRootDiv).toHaveClass('modal fade d-block show');
        });
        it('hides Modal when clicking cancel', async () => {
            apiCalls.loadMinds = jest.fn().mockResolvedValue(mockSuccessGetMindsFirstOfMultiPage);
            apiCalls.loadNewMindsCount = jest.fn().mockResolvedValue({data: {count: 1}});

            const {queryByTestId, container, queryByText} = setup();
            await waitForDomChange();
            const deleteButton = container.querySelectorAll('button')[0];
            fireEvent.click(deleteButton);
            fireEvent.click(queryByText('Cancel'));
            const modalRootDiv = queryByTestId('modal-root');
            expect(modalRootDiv).not.toHaveClass('d-block show');
        });
        it('displays Modal with information about action', async () => {
            apiCalls.loadMinds = jest.fn().mockResolvedValue(mockSuccessGetMindsFirstOfMultiPage);
            apiCalls.loadNewMindsCount = jest.fn().mockResolvedValue({data: {count: 1}});

            const { container, queryByText} = setup();
            await waitForDomChange();
            const deleteButton = container.querySelectorAll('button')[0];
            fireEvent.click(deleteButton);

            const message = queryByText(`Are you sure to delete 'This is the last mind'`);
            expect(message).toBeInTheDocument();
        });
        it('calls deleteMind api with mind id when delete button is clicked on modal', async () => {
            apiCalls.loadMinds = jest.fn().mockResolvedValue(mockSuccessGetMindsFirstOfMultiPage);
            apiCalls.loadNewMindsCount = jest.fn().mockResolvedValue({data: {count: 1}});
            apiCalls.deleteMind = jest.fn().mockResolvedValue({});

            const { container, queryByText} = setup();
            await waitForDomChange();
            const deleteButton = container.querySelectorAll('button')[0];
            fireEvent.click(deleteButton);

            const deleteMindButton = queryByText('Delete Mind');
            fireEvent.click(deleteMindButton);
            expect(apiCalls.deleteMind).toHaveBeenCalledWith(10);
        });
        it('hides model after successful deleteMind api call', async () => {
            apiCalls.loadMinds = jest.fn().mockResolvedValue(mockSuccessGetMindsFirstOfMultiPage);
            apiCalls.loadNewMindsCount = jest.fn().mockResolvedValue({data: {count: 1}});
            apiCalls.deleteMind = jest.fn().mockResolvedValue({});

            const { container, queryByText, queryByTestId} = setup();
            await waitForDomChange();
            const deleteButton = container.querySelectorAll('button')[0];
            fireEvent.click(deleteButton);

            const deleteMindButton = queryByText('Delete Mind');
            fireEvent.click(deleteMindButton);
            await waitForDomChange();
            const modalRootDiv = queryByTestId('modal-root');
            expect(modalRootDiv).not.toHaveClass('d-block show');
        });
        it('removes the deleted mind from document after successful deleteMind api call', async () => {
            apiCalls.loadMinds = jest.fn().mockResolvedValue(mockSuccessGetMindsFirstOfMultiPage);
            apiCalls.loadNewMindsCount = jest.fn().mockResolvedValue({data: {count: 1}});
            apiCalls.deleteMind = jest.fn().mockResolvedValue({});

            const { container, queryByText} = setup();
            await waitForDomChange();
            const deleteButton = container.querySelectorAll('button')[0];
            fireEvent.click(deleteButton);

            const deleteMindButton = queryByText('Delete Mind');
            fireEvent.click(deleteMindButton);
            await waitForDomChange();
            expect(queryByText('This is the last mind')).not.toBeInTheDocument();
        });
        it('disable Modal buttons when api call in progress', async () => {
            apiCalls.loadMinds = jest.fn().mockResolvedValue(mockSuccessGetMindsFirstOfMultiPage);
            apiCalls.loadNewMindsCount = jest.fn().mockResolvedValue({data: {count: 1}});
            apiCalls.deleteMind = jest.fn().mockImplementation(() => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve({});
                    }, 300);
                });
            });

            const { container, queryByText} = setup();
            await waitForDomChange();
            const deleteButton = container.querySelectorAll('button')[0];
            fireEvent.click(deleteButton);

            const deleteMindButton = queryByText('Delete Mind');
            fireEvent.click(deleteMindButton);
            expect(deleteMindButton).toBeDisabled();
            expect(queryByText('Cancel')).toBeDisabled();
        });
        it('display spinner when api call in progress', async () => {
            apiCalls.loadMinds = jest.fn().mockResolvedValue(mockSuccessGetMindsFirstOfMultiPage);
            apiCalls.loadNewMindsCount = jest.fn().mockResolvedValue({data: {count: 1}});
            apiCalls.deleteMind = jest.fn().mockImplementation(() => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve({});
                    }, 300);
                });
            });

            const { container, queryByText} = setup();
            await waitForDomChange();
            const deleteButton = container.querySelectorAll('button')[0];
            fireEvent.click(deleteButton);

            const deleteMindButton = queryByText('Delete Mind');
            fireEvent.click(deleteMindButton);
            expect(queryByText('Loading...')).toBeInTheDocument();
        });
        it('hides spinner when api call finishes', async () => {
            apiCalls.loadMinds = jest.fn().mockResolvedValue(mockSuccessGetMindsFirstOfMultiPage);
            apiCalls.loadNewMindsCount = jest.fn().mockResolvedValue({data: {count: 1}});
            apiCalls.deleteMind = jest.fn().mockImplementation(() => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve({});
                    }, 300);
                });
            });

            const { container, queryByText} = setup();
            await waitForDomChange();
            const deleteButton = container.querySelectorAll('button')[0];
            fireEvent.click(deleteButton);

            const deleteMindButton = queryByText('Delete Mind');
            fireEvent.click(deleteMindButton);
            await waitForDomChange();
            expect(queryByText('Loading...')).not.toBeInTheDocument();
        });
    });
});

console.error = () => {
};
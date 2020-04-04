import React from "react";
import {fireEvent, render, waitForDomChange} from "@testing-library/react";
import MindSubmit from "./MindSubmit";
import {Provider} from 'react-redux';
import {createStore} from 'redux';
import authReducer from '../redux/authReducer';
import * as apiCalls from '../api/apiCalls';

const defaultState = {
    id: 1,
    username: 'user1',
    displayName: 'display1',
    image: 'image1',
    password: 'P4ssword',
    isLoggedIn: true,
};

let store;

const setup = (state = defaultState) => {
    store = createStore(authReducer, state);
    return render(
        <Provider store={store}>
            <MindSubmit/>
        </Provider>
    );
};

describe('MindSubmit', () => {
    describe('Layout', () => {
        it('has textarea', () => {
            const {container} = setup();
            const textArea = container.querySelector('textarea');
            expect(textArea).toBeInTheDocument();
        });
        it('has image', () => {
            const {container} = setup();
            const image = container.querySelector('img');
            expect(image).toBeInTheDocument();
        });
        it('displays textarea 1 line', () => {
            const {container} = setup();
            const textArea = container.querySelector('textarea');
            expect(textArea.rows).toBe(1);
        });
        it('displays user image', () => {
            const {container} = setup();
            const image = container.querySelector('img');
            expect(image.src).toContain('/images/profile/' + defaultState.image);
        });
    });
    describe('Interactions', () => {
        it('displays 3 rows when focused to textarea', () => {
            const {container} = setup();
            const textArea = container.querySelector('textarea');
            fireEvent.focus(textArea);
            expect(textArea.rows).toBe(3);
        });
        it('displays Send button when focused to textarea', () => {
            const {container, queryByText} = setup();
            const textArea = container.querySelector('textarea');
            fireEvent.focus(textArea);
            const sendButton = queryByText('Send');
            expect(sendButton).toBeInTheDocument();
        });
        it('displays Cancel button when focused to textarea', () => {
            const {container, queryByText} = setup();
            const textArea = container.querySelector('textarea');
            fireEvent.focus(textArea);
            const cancelButton = queryByText('Cancel');
            expect(cancelButton).toBeInTheDocument();
        });
        it('does not display Send button when focused to textarea', () => {
            const {queryByText} = setup();
            const sendButton = queryByText('Send');
            expect(sendButton).not.toBeInTheDocument();
        });
        it('does not display Cancel button when focused to textarea', () => {
            const {queryByText} = setup();
            const cancelButton = queryByText('Cancel');
            expect(cancelButton).not.toBeInTheDocument();
        });
        it('returns back to unfocused state after clicking the cancel', () => {
            const {container, queryByText} = setup();
            const textArea = container.querySelector('textarea');
            fireEvent.focus(textArea);
            const cancelButton = queryByText('Cancel');
            fireEvent.click(cancelButton);
            expect(queryByText('Cancel')).not.toBeInTheDocument();
        });
        it('calls postMind with mind request object when clicking Send', () => {
            const {container, queryByText} = setup();
            const textArea = container.querySelector('textarea');
            fireEvent.focus(textArea);
            fireEvent.change(textArea, {target: {value: 'Test mind content'}});

            const sendButton = queryByText('Send');

            apiCalls.postMind = jest.fn().mockResolvedValue({});
            fireEvent.click(sendButton);
            expect(apiCalls.postMind).toHaveBeenCalledWith({
                content: 'Test mind content'
            });
        });
        it('returns to unfocused state after successful postMind action', async () => {
            const {container, queryByText} = setup();
            const textArea = container.querySelector('textarea');
            fireEvent.focus(textArea);
            fireEvent.change(textArea, {target: {value: 'Test mind content'}});

            const sendButton = queryByText('Send');

            apiCalls.postMind = jest.fn().mockResolvedValue({});
            fireEvent.click(sendButton);
            await waitForDomChange();
            expect(queryByText('Send')).not.toBeInTheDocument();
        });
        it('clears content after successful postMind action', async () => {
            const {container, queryByText} = setup();
            const textArea = container.querySelector('textarea');
            fireEvent.focus(textArea);
            fireEvent.change(textArea, {target: {value: 'Test mind content'}});

            const sendButton = queryByText('Send');

            apiCalls.postMind = jest.fn().mockResolvedValue({});
            fireEvent.click(sendButton);
            await waitForDomChange();
            expect(queryByText('Test mind content')).not.toBeInTheDocument();
        });
        it('clears content after clicking cancel', () => {
            const {container, queryByText} = setup();
            const textArea = container.querySelector('textarea');
            fireEvent.focus(textArea);
            fireEvent.change(textArea, {target: {value: 'Test mind content'}});
            fireEvent.click(queryByText('Cancel'));
            expect(queryByText('Test mind content')).not.toBeInTheDocument();
        });
        it('disables Send button when there is postMind api call', async () => {
            const {container, queryByText} = setup();
            const textArea = container.querySelector('textarea');
            fireEvent.focus(textArea);
            fireEvent.change(textArea, {target: {value: 'Test mind content'}});

            const sendButton = queryByText('Send');

            const mockFunction = jest.fn().mockImplementation(() => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve({});
                    }, 300);
                });
            });

            apiCalls.postMind = mockFunction;
            fireEvent.click(sendButton);
            fireEvent.click(sendButton);

            expect(mockFunction).toHaveBeenCalledTimes(1);
        });
        it('disables Cancel button when there is postMind api call', async () => {
            const {container, queryByText} = setup();
            const textArea = container.querySelector('textarea');
            fireEvent.focus(textArea);
            fireEvent.change(textArea, {target: {value: 'Test mind content'}});

            const sendButton = queryByText('Send');

            const mockFunction = jest.fn().mockImplementation(() => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve({});
                    }, 300);
                });
            });

            apiCalls.postMind = mockFunction;
            fireEvent.click(sendButton);

            const cancelButton = queryByText('Cancel');
            fireEvent.click(sendButton);

            expect(cancelButton).toBeDisabled();
        });
        it('disables spinner when there is postMind api call', async () => {
            const {container, queryByText} = setup();
            const textArea = container.querySelector('textarea');
            fireEvent.focus(textArea);
            fireEvent.change(textArea, {target: {value: 'Test mind content'}});

            const sendButton = queryByText('Send');

            const mockFunction = jest.fn().mockImplementation(() => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve({});
                    }, 300);
                });
            });

            apiCalls.postMind = mockFunction;
            fireEvent.click(sendButton);

            expect(queryByText('Loading...')).toBeInTheDocument();
        });
        it('enables Send button when there is postMind api call fails', async () => {
            const {container, queryByText} = setup();
            const textArea = container.querySelector('textarea');
            fireEvent.focus(textArea);
            fireEvent.change(textArea, {target: {value: 'Test mind content'}});

            const sendButton = queryByText('Send');

            const mockFunction = jest.fn().mockRejectedValueOnce( {
               response: {
                   data: {
                       validationErrors: {
                           content: 'It must have minimum 10 and maximum 5000 characters'
                       }
                   }
               }
            });

            apiCalls.postMind = mockFunction;
            fireEvent.click(sendButton);

            await waitForDomChange();

            expect(queryByText('Send')).not.toBeDisabled();
        });
        it('enables Cancel button when there is postMind api call fails', async () => {
            const {container, queryByText} = setup();
            const textArea = container.querySelector('textarea');
            fireEvent.focus(textArea);
            fireEvent.change(textArea, {target: {value: 'Test mind content'}});

            const sendButton = queryByText('Send');

            const mockFunction = jest.fn().mockRejectedValueOnce( {
               response: {
                   data: {
                       validationErrors: {
                           content: 'It must have minimum 10 and maximum 5000 characters'
                       }
                   }
               }
            });

            apiCalls.postMind = mockFunction;
            fireEvent.click(sendButton);

            await waitForDomChange();

            expect(queryByText('Cancel')).not.toBeDisabled();
        });
        it('enables Send button state after successful postMind action', async () => {
            const {container, queryByText} = setup();
            const textArea = container.querySelector('textarea');
            fireEvent.focus(textArea);
            fireEvent.change(textArea, {target: {value: 'Test mind content'}});

            const sendButton = queryByText('Send');

            apiCalls.postMind = jest.fn().mockResolvedValue({});
            fireEvent.click(sendButton);
            await waitForDomChange();

            fireEvent.focus(textArea);
            expect(queryByText('Send')).not.toBeDisabled();
        });
    });
});
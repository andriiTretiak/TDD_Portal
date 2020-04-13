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

        let textArea;
        const setupFocused =() => {
            const rendered = setup();
            textArea = rendered.container.querySelector('textarea');
            fireEvent.focus(textArea);
            return rendered;
        };

        it('displays 3 rows when focused to textarea', () => {
            setupFocused();
            expect(textArea.rows).toBe(3);
        });
        it('displays Send button when focused to textarea', () => {
            const {queryByText} = setupFocused();
            const sendButton = queryByText('Send');
            expect(sendButton).toBeInTheDocument();
        });
        it('displays Cancel button when focused to textarea', () => {
            const {queryByText} = setupFocused();
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
            const {queryByText} = setupFocused();
            const cancelButton = queryByText('Cancel');
            fireEvent.click(cancelButton);
            expect(queryByText('Cancel')).not.toBeInTheDocument();
        });
        it('calls postMind with mind request object when clicking Send', () => {
            const {queryByText} = setupFocused();
            fireEvent.change(textArea, {target: {value: 'Test mind content'}});

            const sendButton = queryByText('Send');

            apiCalls.postMind = jest.fn().mockResolvedValue({});
            fireEvent.click(sendButton);
            expect(apiCalls.postMind).toHaveBeenCalledWith({
                content: 'Test mind content'
            });
        });
        it('returns to unfocused state after successful postMind action', async () => {
            const {queryByText} = setupFocused();
            fireEvent.change(textArea, {target: {value: 'Test mind content'}});

            const sendButton = queryByText('Send');

            apiCalls.postMind = jest.fn().mockResolvedValue({});
            fireEvent.click(sendButton);
            await waitForDomChange();
            expect(queryByText('Send')).not.toBeInTheDocument();
        });
        it('clears content after successful postMind action', async () => {
            const {queryByText} = setupFocused();
            fireEvent.change(textArea, {target: {value: 'Test mind content'}});

            const sendButton = queryByText('Send');

            apiCalls.postMind = jest.fn().mockResolvedValue({});
            fireEvent.click(sendButton);
            await waitForDomChange();
            expect(queryByText('Test mind content')).not.toBeInTheDocument();
        });
        it('clears content after clicking cancel', () => {
            const {queryByText} = setupFocused();
            fireEvent.change(textArea, {target: {value: 'Test mind content'}});
            fireEvent.click(queryByText('Cancel'));
            expect(queryByText('Test mind content')).not.toBeInTheDocument();
        });
        it('disables Send button when there is postMind api call', async () => {
            const {queryByText} = setupFocused();
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
            const {queryByText} = setupFocused();
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
            const {queryByText} = setupFocused();
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
            const {queryByText} = setupFocused();
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
            const {queryByText} = setupFocused();
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
            const {queryByText} = setupFocused();
            fireEvent.change(textArea, {target: {value: 'Test mind content'}});

            const sendButton = queryByText('Send');

            apiCalls.postMind = jest.fn().mockResolvedValue({});
            fireEvent.click(sendButton);
            await waitForDomChange();

            fireEvent.focus(textArea);
            expect(queryByText('Send')).not.toBeDisabled();
        });
        it('displays validation error for content', async () => {
            const {queryByText} = setupFocused();
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

            expect(queryByText('It must have minimum 10 and maximum 5000 characters')).toBeInTheDocument();
        });
        it('clears validation error after clicking cancel', async () => {
            const {queryByText} = setupFocused();
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

            fireEvent.click(queryByText('Cancel'));

            expect(queryByText('It must have minimum 10 and maximum 5000 characters')).not.toBeInTheDocument();
        });
        it('clears validation error after content is changed', async () => {
            const {queryByText} = setupFocused();
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

            fireEvent.change(textArea, {target: {value: 'Test mind content is changed'}});

            expect(queryByText('It must have minimum 10 and maximum 5000 characters')).not.toBeInTheDocument();
        });
        it('displays file attachment input when text area focused', () => {
            const {container} = setupFocused();

            const uploadInput = container.querySelector('input');
            expect(uploadInput.type).toBe('file');
        });
        it('displays image component when file selected', async () => {
            const {container} = setupFocused();

            const uploadInput = container.querySelector('input');
            expect(uploadInput.type).toBe('file');

            const file = new File(['dummy content'], 'example.png', {type: 'image/png'});
            fireEvent.change(uploadInput, {target:{files:[file]}});
            await waitForDomChange();
            const images = container.querySelectorAll('img');
            const attachmentImage = images[1];
            expect(attachmentImage.src).toContain('data:image/png;base64');
        });
        it('removes image after clicking cancel', async () => {
            const {container, queryByText } = setupFocused();

            const uploadInput = container.querySelector('input');
            expect(uploadInput.type).toBe('file');

            const file = new File(['dummy content'], 'example.png', {type: 'image/png'});
            fireEvent.change(uploadInput, {target:{files:[file]}});
            await waitForDomChange();
            fireEvent.click(queryByText('Cancel'));
            fireEvent.focus(textArea);
            const images = container.querySelectorAll('img');
            expect(images.length).toBe(1);
        });
    });
});

console.error = () => {};
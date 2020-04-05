import React from "react";
import {render} from "@testing-library/react";
import MindFeed from './MindFeed';
import * as apiCalls from '../api/apiCalls';

const setup = (props) => {
    return render(<MindFeed {...props}/>);
};

const mockEmptyResponse = {
    data: {
        content: []
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
        it('displays no mind message when the response has empty page', () => {
            apiCalls.loadMinds = jest.fn().mockResolvedValue(mockEmptyResponse);
            const { queryByText } = setup();
            expect(queryByText('There are no minds')).toBeInTheDocument();
        });
    });
});
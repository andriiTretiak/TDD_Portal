import React from "react";
import {render} from "@testing-library/react";
import MindView from "./MindView";
import {MemoryRouter} from "react-router-dom";

const setup = () => {
    const oneMinuteAgo = 60 * 1000;
    const date = new Date(new Date() - oneMinuteAgo);
    const mind = {
        id: 10,
        content: 'This is the first mind',
        date: date,
        user: {
            id: 1,
            username: 'user1',
            displayName: 'display1',
            image: 'profile1.png'
        }
    };
    return render(
        <MemoryRouter>
            <MindView mind={mind} />
        </MemoryRouter>
       );
};

describe('MindView', () => {
    describe('Layout', () => {
        it('displays mind content', () => {
            const { queryByText } = setup();
            expect(queryByText('This is the first mind')).toBeInTheDocument();
        });
        it('displays user image', () => {
            const { container } = setup();
            const image = container.querySelector('img');
            expect(image.src).toContain('/images/profile/profile1.png');
        });
        it('displays displayName@username', () => {
            const { queryByText } = setup();
            expect(queryByText('display1@user1')).toBeInTheDocument();
        });
        it('displays relative time', () => {
            const { queryByText } = setup();
            expect(queryByText('1 minute ago')).toBeInTheDocument();
        });
        it('has link to user page', () => {
            const { container } = setup();
            const anchor = container.querySelector('a');
            expect(anchor.getAttribute('href')).toBe('/user1');
        });
    });
});
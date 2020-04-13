import React from "react";
import {render} from "@testing-library/react";
import MindView from "./MindView";
import {MemoryRouter} from "react-router-dom";

const mindWithoutAttachment = {
    id: 10,
    content: 'This is the first mind',
    user: {
        id: 1,
        username: 'user1',
        displayName: 'display1',
        image: 'profile1.png'
    }
};

const mindWithAttachment = {
    id: 10,
    content: 'This is the first mind',
    user: {
        id: 1,
        username: 'user1',
        displayName: 'display1',
        image: 'profile1.png'
    },
    attachment: {
        fileType: 'image/png',
        name: 'attachment-image.png'
    }
};

const mindWithPdfAttachment = {
    id: 10,
    content: 'This is the first mind',
    user: {
        id: 1,
        username: 'user1',
        displayName: 'display1',
        image: 'profile1.png'
    },
    attachment: {
        fileType: 'applications/pdf',
        name: 'attachment.pdf'
    }
};

const setup = (mind = mindWithoutAttachment) => {
    const oneMinuteAgo = 60 * 1000;
    mind.date = new Date(new Date() - oneMinuteAgo);

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
        it('displays file attachment image', () => {
            const { container } = setup(mindWithAttachment);
            const images = container.querySelectorAll('img');
            expect(images.length).toBe(2);
        });
        it('does not display file attachment when attachment type is not image', () => {
            const { container } = setup(mindWithPdfAttachment);
            const images = container.querySelectorAll('img');
            expect(images.length).toBe(1);
        });
        it('sets the attachment path as source for the file attachment image', () => {
            const { container } = setup(mindWithAttachment);
            const images = container.querySelectorAll('img');
            const attachmentImage = images[1];
            expect(attachmentImage.src).toContain('/images/attachments/' + mindWithAttachment.attachment.name);
        });
    });
});
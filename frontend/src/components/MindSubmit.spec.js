import React from "react";
import {render} from "@testing-library/react";
import MindSubmit from "./MindSubmit"

describe('MindSubmit', () => {
    describe('Layout', () => {
        it('has textarea', () => {
            const { container } = render(<MindSubmit/>);
            const textArea = container.querySelector('textarea');
            expect(textArea).toBeInTheDocument();
        });
        it('has image', () => {
            const { container } = render(<MindSubmit/>);
            const image = container.querySelector('img');
            expect(image).toBeInTheDocument();
        });
        it('displays textarea 1 line', () => {
            const { container } = render(<MindSubmit/>);
            const textArea = container.querySelector('textarea');
            expect(textArea.rows).toBe(1);
        });
    });
});
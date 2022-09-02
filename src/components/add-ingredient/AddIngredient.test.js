import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import AddIngredient from "./AddIngredient";

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve( true ),
  })
);

const mockedUpdateItems = jest.fn();

test("AddIngredient renders without crashing", () => {
    render(
        <AddIngredient 
            Items={[]}
            updateItems={mockedUpdateItems}
        />
    );
});

test("AddIngredient contains input field and it has focus on mount", () => {
    render(
        <AddIngredient
            Items={[]}
            updateItems={mockedUpdateItems}
        />
    );

    expect( screen.getByPlaceholderText( "Add a new ingredient..." ) ).toHaveFocus();
});

test("should be able to type into input", () => {
    render(
        <AddIngredient
            Items={[]}
            updateItems={mockedUpdateItems}
        />
    );

    const inputElement = screen.getByPlaceholderText( "Add a new ingredient..." );

    act(() => {
        fireEvent.change( inputElement, { target: { value: 'New ingredient' } } );
    });

    expect( inputElement.value ).toBe( 'New ingredient' );
});

test("should have empty input after submit button is clicked", async() => {

    render(
        <AddIngredient
            Items={[]}
            updateItems={mockedUpdateItems}
        />
    );

    const inputElement = screen.getByPlaceholderText( "Add a new ingredient..." );
    const submitButton = screen.getByRole( 'button' );

    // TODO - this fives a warning, we need to look at the async behaviour and how the test needs to wait for render after state update
    // TypeError: MutationObserver is not a constructor error because of react script version, in order to use waitFor
    fireEvent.change( inputElement, { target: { value: 'New ingredient' } } );
    fireEvent.click( submitButton );

    await waitFor(() => {
        expect( inputElement.value ).toBe( '' );
    });
});



// test("Clicking submit with no text in input should not add a new ingredient", () => {
//     render( <AddIngredient /> );
//     const updateItems = jest.fn();
//     userEvent.click( screen.getByRole( 'button' ) );
//     expect( updateItems ).not.toHaveBeenCalled();
// });


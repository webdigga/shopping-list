import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import AddIngredient from "./AddIngredient";

const unmockedFetch = global.fetch;

// Fetching the Promise with the JSON method, which also returns the Promise with the data
beforeAll(() => {
    global.fetch = () =>
        Promise.resolve({
            json: () => Promise.resolve([]),
        })
});

// Using the afterAll() jest hook and calling the global.fetch function to cleanup mock test
afterAll(() => {
    global.fetch = unmockedFetch
});

const mockedUpdateItems = jest.fn();

test("AddIngredient renders without crashing", () => {
    render(
        <AddIngredient 
            Items = { [] }
            updateItems = { mockedUpdateItems }
        />
    );
});

test("AddIngredient contains input field and it has focus on mount", () => {
    render(
        <AddIngredient
            Items = { [] }
            updateItems = { mockedUpdateItems }
        />
    );

    expect( screen.getByPlaceholderText( "Add a new ingredient..." ) ).toHaveFocus();
});

test("should be able to type into input", () => {
    render(
        <AddIngredient
            Items = { [] }
            updateItems = { mockedUpdateItems }
        />
    );

    const inputElement = screen.getByPlaceholderText( "Add a new ingredient..." );

	act( () => {
		fireEvent.change( inputElement, { target: { value: 'New ingredient' } } );
	});

    expect( inputElement.value ).toBe( 'New ingredient' );
});

test("should have empty input after submit button is clicked", async() => {

    render(
        <AddIngredient
            Items = { [] }
            updateItems = { mockedUpdateItems }
        />
    );

    const inputElement = screen.getByPlaceholderText( "Add a new ingredient..." );

	act( () => {
		fireEvent.change( inputElement, { target: { value: 'New ingredient' } } );
		fireEvent.click( screen.getByRole( 'button' ) );
	});

    await waitFor(() => {
        expect( inputElement.value ).toBe( '' );
    });
});

test("Clicking submit with no text in input should not add a new ingredient", () => {
    render(
        <AddIngredient
            Items = { [] }
            updateItems = { mockedUpdateItems }
        />
    );

    const updateItems = jest.fn();
    
	act( () => {
		fireEvent.click( screen.getByRole( 'button' ) );
	});

    expect( updateItems ).not.toHaveBeenCalled();
});


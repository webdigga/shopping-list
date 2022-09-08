import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import IngredientsList from "./IngredientsList";

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

const mockedUpdateItemsFunction = jest.fn();
const mockedUpdateCompletedItemsFunction = jest.fn();

test("There should be no items if none have been passed through at render", () => {
	const { container } = render(
		<IngredientsList
			items = { [] }
			completedItems = { [] }
			updateItems = { mockedUpdateItemsFunction }
			updateCompletedItems = { mockedUpdateCompletedItemsFunction }
		/>
	);

	expect( container.firstChild ).toBeNull();
});

test("There should be items if they have been passed through at render", () => {
	const { container } = render(
		<IngredientsList
			items = {
				[{
					"id": "24323423",
					"name": "Test ingredient"
				}]
			}
			completedItems = { [] }
			updateItems = { mockedUpdateItemsFunction }
			updateCompletedItems = { mockedUpdateCompletedItemsFunction }
		/>
	);

	expect( container.firstChild ).toBeTruthy();
});

test("Clicking one of the items to mark as complete will remove 1 item from the list", () => {
	render(
		<IngredientsList
			items = {
				[{
					"id": "24323423",
					"name": "Test ingredient"
				}]
			}
			completedItems = { [] }
			updateItems = { mockedUpdateItemsFunction }
			updateCompletedItems = { mockedUpdateCompletedItemsFunction }
		/>
	);

	fireEvent.click( screen.getByTestId( 'markIncomplete0' ) );

	expect( mockedUpdateItemsFunction ).toHaveBeenCalled();
});

test("Clicking one of the items to mark as deleted will remove 1 item from the list", async() => {
	render(
		<IngredientsList
			items = {
				[{
					"id": "24323423",
					"name": "Test ingredient"
				}]
			}
			completedItems = { [] }
			updateItems = { mockedUpdateItemsFunction }
			updateCompletedItems = { mockedUpdateCompletedItemsFunction }
		/>
	);

	act( () => {
		fireEvent.click( screen.getByTestId( 'delete0' ) );
	});

	await waitFor(() => {
		expect( mockedUpdateItemsFunction ).toHaveBeenCalled();
	});
});

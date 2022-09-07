import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import CompletedIngredientsList from "./CompletedIngredientsList";

const mockedUpdateItemsFunction = jest.fn();
const mockedUpdateCompletedItemsFunction = jest.fn();

test("There should be no completed items if none have been passed through at render", () => {
	const { container } = render(
		<CompletedIngredientsList
			items = { [] }
			completedItems = { [] }
			updateItems = { mockedUpdateItemsFunction }
			updateCompletedItems = { mockedUpdateCompletedItemsFunction }
		/>
	);

	expect(container.firstChild).toBeNull();
});

test("There should be completed items if they have been passed through at render", () => {
	const { container } = render(
		<CompletedIngredientsList
			items = { [] }
			completedItems = { [{
				"id": "24323423",
				"name": "dfsdfsdfds"
			}] }
			updateItems = { mockedUpdateItemsFunction }
			updateCompletedItems = { mockedUpdateCompletedItemsFunction }
		/>
	);

	expect( container.firstChild ).toBeTruthy();
});

test("Clicking one of the items to mark as incomplete will remove 1 item from the list", () => {

});

// test( "if there are no completed items then it should not call clearAllItems" , () => {
// 	render(
// 		<ClearAllIngredients
// 			clearAllItems = { mockedClearAllItemsFunction }
// 			updateItems = { mockedUpdateItemsFunction }
// 			items = { [] }
// 			completedItems = { [] }
// 		/>
// 	);

// 	fireEvent.click( screen.getByRole( 'button' ) );

// 	expect( mockedClearAllItemsFunction ).not.toBeCalled();	
	
// });

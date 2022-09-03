import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ClearAllIngredients from "./ClearAllIngredients";

const mockedClearAllItemsFunction = jest.fn();
const mockedUpdateItemsFunction = jest.fn();

test( "if there are no completed items then it should not call clearAllItems" , () => {
	render(
		<ClearAllIngredients
			clearAllItems = { mockedClearAllItemsFunction }
			updateItems = { mockedUpdateItemsFunction }
			items = { [] }
			completedItems = { [] }
		/>
	);

	fireEvent.click( screen.getByRole( 'button' ) );

	expect( mockedClearAllItemsFunction ).not.toBeCalled();	
	
});

test( "if we have completed items, then clicking the button should call clearAllItems function", () => {
	<ClearAllIngredients
		clearAllItems = { mockedClearAllItemsFunction }
		updateItems = { mockedUpdateItemsFunction }
		items = { [] }
		completedItems = {[
			{
				"id": "2bbf63f7-57aa-4f32-8336-b0f54efbed7e",
				"name": "Ingredient 1"
			},
			{
				"id": "a18270eb-01a8-445a-832c-212e33faf190",
				"name": "Ingredient 2"
			}
		]}
	/>

	fireEvent.click( screen.getByRole( 'button' ) );

	expect( mockedClearAllItemsFunction ).toBeCalled();
});
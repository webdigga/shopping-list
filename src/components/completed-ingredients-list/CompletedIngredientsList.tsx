import React from 'react';
import { convertTypeAcquisitionFromJson } from 'typescript';

interface Props {
	Items: {
		id: number;
		name: string;
	}[];
	CompletedItems: {
		id: number;
		name: string;
	}[];
	updateItems: Function;
	updateCompletedItems: Function;
};
const IngredientsList: React.FC<Props> = ({ Items, updateItems, CompletedItems, updateCompletedItems }) => {

	const markItemIncomplete = ( id: number ) => {

		// Get the incompleted item
		const incompletedItem = CompletedItems.filter(function( obj ) {
			return obj.id === id;
		});

		// Remove the completed items from array
		const newCompletedItems = CompletedItems.filter(function( obj ) {
			return obj.id !== id;
		});

		// Update state
		updateCompletedItems( newCompletedItems );
		
		// Add the item back to the items array
		Items.push( ...incompletedItem );

		// Update state
		updateItems( Items );
	}

	return (
		<>
			<ul>
				{
					CompletedItems.map( ( item ) => {
						return (
							<li key={ item.id }>
								{ item.name }
								<button onClick={() => markItemIncomplete( item.id )}>Mark as incomplete</button>
							</li>
						)
					})
				}
			</ul>
		</>
	)
}

export default IngredientsList;

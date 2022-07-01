import React from 'react';

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

	const deleteItem = ( id: number ) => {
		fetch('https://ary9mw0hd0.execute-api.eu-west-2.amazonaws.com/items/' + id, {
  			method: 'DELETE',
		})
		.then(res => res.text()) // or res.json()
		.then( () => {

			// Remove the item from array
			const newItems = Items.filter(function( obj ) {
				return obj.id !== id;
			});

			// Update state
			updateItems( newItems );
		});
	}

	const markItemComplete = ( id: number ) => {

		// Get the completed item
		const completedItem = Items.filter(function( obj ) {
			return obj.id === id;
		});

		// Add the item to the completed items array
		CompletedItems.push( ...completedItem );

		// Update state
		updateCompletedItems( CompletedItems );

		// Remove the item from array
		const newItems = Items.filter(function( obj ) {
			return obj.id !== id;
		});

		// Update state
		updateItems( newItems );
	}

	return (
		<>
			<ul>
				{
					Items.map( ( item ) => {
						return (
							<li key={ item.id }>
								{ item.name }
								<button onClick={() => markItemComplete( item.id )}>Mark as complete</button>
								<button onClick={() => deleteItem( item.id )}>Delete</button>
							</li>
						)
					})
				}
			</ul>
		</>
	)
}

export default IngredientsList;

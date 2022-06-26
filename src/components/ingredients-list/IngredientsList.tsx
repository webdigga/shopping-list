import React from 'react';

interface Props {
	Items: {
		id: number;
		name: string;
	}[];
	updateItems: Function;
};
const IngredientsList: React.FC<Props> = ({ Items, updateItems }) => {

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
			console.log( newItems );
			updateItems( newItems )
		});
	}

	return (
		<>
			<ul>
				{
					Items.map( ( item ) => {
						return <li key={ item.id }>{ item.name } <button onClick={() => deleteItem( item.id )}>Delete</button></li>
					})
				}
			</ul>
		</>
	)
}

export default IngredientsList;

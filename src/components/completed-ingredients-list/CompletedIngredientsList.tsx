import React from 'react';
import styles from './CompletedIngredientsList.module.css';

interface Props {
	items: {
		id: number;
		name: string;
		completed: boolean;
	}[];
	completedItems: {
		id: number;
		name: string;
		completed: boolean;
	}[];
	updateItems: Function;
	updateCompletedItems: Function;
};

const IngredientsList: React.FC<Props> = ({ items, updateItems, completedItems, updateCompletedItems }) => {

	const markItemIncomplete = ( id: number ) => {

		// Get the incompleted item
		const incompletedItem: any = completedItems.filter(function( obj ) {
			return obj.id === id;
		});

		// Remove the completed items from array
		const newCompletedItems = completedItems.filter(function( obj ) {
			return obj.id !== id;
		});

		// Add the state to the incompleted item
		incompletedItem.completed = false;

		// Update the state of the item in the DB
		fetch(`https://ary9mw0hd0.execute-api.eu-west-2.amazonaws.com/items/` + id, {
			method: 'PUT',
			body: JSON.stringify( incompletedItem ),
			headers: {
				'Content-type': 'application/json; charset=UTF-8',
				'Accept': 'application/json'
			}
		})
		.then(( response ) => {
			return response.json();
		})
		.then(() => {
			// Update state
			updateCompletedItems( newCompletedItems );

			// Add the item back to the items array
			items.push( ...incompletedItem );

			// Update state
			updateItems( items );
		})
		.catch(( error ) => console.error('Error:', error));
	}

	if( completedItems && completedItems.length ) {
		return (
			<>
				<ul className={styles.list}>
					{
						completedItems.map( ( item ) => {
							return (
								<li key={ item.id } className={styles.listItem}>
									<div className={styles.name}>{ item.name }</div>
									<button className={styles.buttonInComplete} onClick={() => markItemIncomplete( item.id )}>
										<i className="fas fa-arrow-rotate-left fa-fw fa-xl"></i>
									</button>
								</li>
							)
						})
					}
				</ul>
			</>
		);
	} else {
		return null;
	}
	
}

export default IngredientsList;

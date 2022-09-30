import React from 'react';
import styles from './IngredientsList.module.css';

interface Props {
	items: {
		id: number;
		name: string;
		completed?: boolean;
	}[];
	completedItems: {
		id: number;
		name: string;
		completed?: boolean;
	}[];
	updateItems: Function;
	updateCompletedItems: Function;
};

const IngredientsList: React.FC<Props> = ({ items, updateItems, completedItems, updateCompletedItems }) => {

	const deleteItem = ( id: number ) => {
		fetch('https://ary9mw0hd0.execute-api.eu-west-2.amazonaws.com/items/' + id, {
  			method: 'DELETE',
		})
		.then(res => res.json())
		.then( () => {

			// Remove the item from array
			const newItems = items.filter(function( obj ) {
				return obj.id !== id;
			});

			// Update state
			updateItems( newItems );
		})
		.catch(( error ) => console.error('Error:', error));
	}

	const markItemComplete = ( id: number ) => {

		// Get the completed item
		const completedItem: any = items.find(function( obj ) {
			return obj.id === id;
		});

		// Add the state to the completed item
		completedItem.completed = true;

		console.log( JSON.stringify( completedItem ) );

		// Update the state of the item in the DB
		fetch(`https://ary9mw0hd0.execute-api.eu-west-2.amazonaws.com/items/` + id, {
			method: 'PUT',
			body: JSON.stringify( completedItem ),
			headers: {
				'Content-type': 'application/json; charset=UTF-8',
				'Accept': 'application/json'
			}
		})
		.then(( response ) => {
			return response.json();
		})
		.then(() => {
			// Add the item to the completed items array
			completedItems.push( completedItem );

			// Update state
			updateCompletedItems( completedItems );

			// Remove the item from array
			const newItems = items.filter(function( obj ) {
				return obj.id !== id;
			});

			// Update state
			updateItems( newItems );
		})
		.catch(( error ) => console.error('Error:', error));
	}

	if( items && items.length ) {
		return (
			<>
				<ul className={styles.list}>
					{
						items.map( ( item, index ) => {
							return (
								<li key={ item.id } className={styles.listItem}>
									<div className={styles.name}>{ item.name }</div>
									<button data-testid={"markIncomplete" + index} className={styles.buttonComplete} onClick={() => markItemComplete( item.id )}>
										<i className="fas fa-check fa-fw fa-xl"></i>
									</button>
									<button data-testid={"delete" + index} className={styles.buttonDelete} onClick={() => deleteItem( item.id )}>
										<i className="fas fa-trash fa-fw fa-xl"></i>
									</button>
								</li>
							)
						})
					}
				</ul>
			</>
		)
	} else {
		return null;
	}
}

export default IngredientsList;

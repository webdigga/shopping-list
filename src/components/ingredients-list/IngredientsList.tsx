import React from 'react';
import styles from './IngredientsList.module.css';

interface Props {
	items: {
		id: number;
		name: string;
	}[];
	completedItems: {
		id: number;
		name: string;
	}[];
	updateItems: Function;
	updateCompletedItems: Function;
};

const IngredientsList: React.FC<Props> = ({ items, updateItems, completedItems, updateCompletedItems }) => {

	const deleteItem = ( id: number ) => {
		fetch('https://ary9mw0hd0.execute-api.eu-west-2.amazonaws.com/items/' + id, {
  			method: 'DELETE',
		})
		.then(res => res.text()) // or res.json()
		.then( () => {

			// Remove the item from array
			const newItems = items.filter(function( obj ) {
				return obj.id !== id;
			});

			// Update state
			updateItems( newItems );
		});
	}

	const markItemComplete = ( id: number ) => {

		// Get the completed item
		const completedItem = items.filter(function( obj ) {
			return obj.id === id;
		});

		// Add the item to the completed items array
		completedItems.push( ...completedItem );

		// Update state
		updateCompletedItems( completedItems );

		// Remove the item from array
		const newItems = items.filter(function( obj ) {
			return obj.id !== id;
		});

		// Update state
		updateItems( newItems );
	}

	return (
		<>
			<ul className={styles.list}>
				{
					items.map( ( item ) => {
						return (
							<li key={ item.id } className={styles.listItem}>
								<div className={styles.name}>{ item.name }</div>
								<button className={styles.buttonComplete} onClick={() => markItemComplete( item.id )}>
									<i className="fas fa-check fa-fw fa-xl"></i>
								</button>
								<button className={styles.buttonDelete} onClick={() => deleteItem( item.id )}>
									<i className="fas fa-trash fa-fw fa-xl"></i>
								</button>
							</li>
						)
					})
				}
			</ul>
		</>
	)
}

export default IngredientsList;

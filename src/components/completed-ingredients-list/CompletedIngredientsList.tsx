import React from 'react';
import styles from './CompletedIngredientsList.module.css';

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

	const markItemIncomplete = ( id: number ) => {

		// Get the incompleted item
		const incompletedItem = completedItems.filter(function( obj ) {
			return obj.id === id;
		});

		// Remove the completed items from array
		const newCompletedItems = completedItems.filter(function( obj ) {
			return obj.id !== id;
		});

		// Update state
		updateCompletedItems( newCompletedItems );
		
		// Add the item back to the items array
		items.push( ...incompletedItem );

		// Update state
		updateItems( items );
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

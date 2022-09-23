import React from 'react';
import styles from './ClearAllIngredients.module.css';

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
	clearAllItems: Function;
    updateItems: Function;
};

const ClearAllIngredients: React.FC<Props> = ({ items, completedItems, clearAllItems, updateItems }) => {

    function clearAllItemsEvent() {
		if ( completedItems.length ) {
			clearAllItems([]);
        	updateItems( [...items, ...completedItems] ); 
		}
    }

    return (
        <button className={styles.button} onClick={clearAllItemsEvent}>
			<i className="fas fa-recycle fa-fw fa-xl"></i>
		</button>
    );
}

export default ClearAllIngredients;

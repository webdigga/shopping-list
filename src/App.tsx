import React, { useState } from 'react';
import styles from './App.module.css';
import Spinner from './components/spinner/Spinner';
import Error from './components/error/Error';
import IngredientsList from './components/ingredients-list/IngredientsList';
import CompletedIngredientsList from './components/completed-ingredients-list/CompletedIngredientsList';
import AddIngredient from './components/add-ingredient/AddIngredient';
import ClearAllIngredients from './components/clear-all-ingredients/ClearAllIngredients';

// API Gateway - https://ary9mw0hd0.execute-api.eu-west-2.amazonaws.com/
// PUT/POST - "Content-Type: application/json" -d "{\"id\": \"abcdef234\", \"price\": 12345, \"name\": \"myitem\"}" https://ary9mw0hd0.execute-api.eu-west-2.amazonaws.com/items
// GET all items - https://ary9mw0hd0.execute-api.eu-west-2.amazonaws.com/items
// GET item - https://ary9mw0hd0.execute-api.eu-west-2.amazonaws.com/items/1
// DELETE item - https://ary9mw0hd0.execute-api.eu-west-2.amazonaws.com/items/1

type item = {
	id: number;
	name: string;
	completed?: boolean;
};

const App = () => {

	// Set state
	const [items, setItems] = useState( [] );
	const [completedItems, setCompletedItems] = useState( [] );
	const [isLoaded, setIsLoaded] = useState( false );
	const [isError, setIsError] = useState( false );
	const [errorMessage, setErrorMessage] = useState( '' );

	// Fetch the data for all shopping list items
	function fetchData () {
		fetch( 'https://ary9mw0hd0.execute-api.eu-west-2.amazonaws.com/items' )
			.then( res => res.json() )
			.then( ( data ) => {
				const [complete, incomplete] = data.Items
					.reduce((result: any, item: item) => {
						result[item.completed === true ? 0 : 1].push( item ); // Determine and push to complete/incomplete array
						return result;
					},
					[[], []]);

				setItems( incomplete );
				setCompletedItems( complete );
				setIsLoaded( true );
			}, ( error ) => {
				setIsLoaded( true );
				setIsError( true );
				setErrorMessage( error );
			});
	}

	// Runs fetchData after first render lifecycle
	React.useEffect( () => {
		fetchData();
	}, []);

	function updateItems( newItems: [], shouldClear: boolean ) {
		if ( shouldClear ) {
			newItems.forEach(( item: item ) => {
				item.completed = false;

				// Update the state of the item in the DB
				fetch(`https://ary9mw0hd0.execute-api.eu-west-2.amazonaws.com/items/` + item.id, {
					method: 'PUT',
					body: JSON.stringify( item ),
					headers: {
						'Content-type': 'application/json; charset=UTF-8',
						'Accept': 'application/json'
					}
				})
				.then(( response ) => {
					return response.json();
				})
			});
		}

		setItems( [...newItems] );
	}

	function updateCompletedItems( newItems: [] ) {
		setCompletedItems( [...newItems] );
	}

	function clearAllItems( newItems: [] ) {
		setCompletedItems( [...newItems] );
	}

	if ( !isLoaded ) {
		return (
			<div className={ styles.posts }>
				<Spinner />
			</div>
		);
	} else if ( isError ) {
		return (
			<>
				<Error message = { errorMessage } />
			</>
		)
	} else {
		return (
			<>
				<div className={styles.form}>
					<AddIngredient
						Items = { items }
						updateItems = { updateItems }
					/>

					<ClearAllIngredients
						clearAllItems = { clearAllItems }
						updateItems = { updateItems }
						items = { items }
						completedItems = { completedItems }
					/>
				</div>

				<IngredientsList
					items = { items }
					completedItems = { completedItems }
					updateItems = { updateItems }
					updateCompletedItems = { updateCompletedItems }
				/>

				<CompletedIngredientsList
					items = { items }
					completedItems = { completedItems }
					updateItems = { updateItems }
					updateCompletedItems = { updateCompletedItems }
				/>
			</>
		)
	}
}

export default App;

import React, { useState } from 'react';
import styles from './App.module.css';
import Spinner from './components/spinner/Spinner';
import Error from './components/error/Error';
import IngredientsList from './components/ingredients-list/IngredientsList';
import CompletedIngredientsList from './components/completed-ingredients-list/CompletedIngredientsList';
import AddIngredient from './components/add-ingredient/AddIngredient';

// API Gateway - https://ary9mw0hd0.execute-api.eu-west-2.amazonaws.com/
// PUT/POST - "Content-Type: application/json" -d "{\"id\": \"abcdef234\", \"price\": 12345, \"name\": \"myitem\"}" https://ary9mw0hd0.execute-api.eu-west-2.amazonaws.com/items
// GET all items - https://ary9mw0hd0.execute-api.eu-west-2.amazonaws.com/items
// GET item - https://ary9mw0hd0.execute-api.eu-west-2.amazonaws.com/items/1
// DELETE item - https://ary9mw0hd0.execute-api.eu-west-2.amazonaws.com/items/1

// TODO - Edit item
// TODO - Ability to untick all items
// TODO - Add the styling
// TODO - Cypress integration tests
// TODO - Unit tests
// TODO - Deploy App

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
			.then( ( result ) => {
				setItems( result.Items );
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

	function updateItems( newItems: [] ) {
		setItems( [...newItems] );
	}

	function updateCompletedItems( newItems: [] ) {
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
				<AddIngredient
					Items = { items }
					updateItems = { updateItems }
				/>

				<IngredientsList
					Items = { items }
					CompletedItems = { completedItems }
					updateItems = { updateItems }
					updateCompletedItems = { updateCompletedItems }
				/>

				<CompletedIngredientsList
					Items = { items }
					CompletedItems = { completedItems }
					updateItems = { updateItems }
					updateCompletedItems = { updateCompletedItems }
				/>
			</>
		)
	}
}

export default App;

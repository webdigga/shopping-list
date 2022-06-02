import React, { useState } from 'react';
import styles from './App.module.css';
import Spinner from './components/spinner/Spinner';
import Error from './components/error/Error';

// API Gateway - https://ary9mw0hd0.execute-api.eu-west-2.amazonaws.com/
// PUT/POST - "Content-Type: application/json" -d "{\"id\": \"abcdef234\", \"price\": 12345, \"name\": \"myitem\"}" https://ary9mw0hd0.execute-api.eu-west-2.amazonaws.com/items
// GET all items - https://ary9mw0hd0.execute-api.eu-west-2.amazonaws.com/items
// GET item - https://ary9mw0hd0.execute-api.eu-west-2.amazonaws.com/items/1
// DELETE item - https://ary9mw0hd0.execute-api.eu-west-2.amazonaws.com/items/1

// TODO - list all items
// TODO - Add new item
// TODO - Edit item
// TODO - Delete item
// TODO - Mark item as ticked
// TODO - Ability to untick all items
// TODO - Cypress integration tests
// TODO - Unit tests
// TODO - Deploy App

function App() {

	// Set state
	const [items, setItems] = useState( [] );
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
				<p>Call the ingredient list component here</p>
			</>
		)
	}
}

export default App;

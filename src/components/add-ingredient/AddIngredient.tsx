import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import styles from './AddIngredient.module.css';

interface Props {
	Items: {
		id: string;
		name: string;
		completed: boolean;
	}[];
	updateItems: Function;
};

const AddIngredient: React.FC<Props> = ({ Items, updateItems }) => {
	const [ingredient, setIngredient] = useState( '' );

	const handleClick = (e: React.FormEvent<EventTarget>): void => {
		e.preventDefault();

		// If there is nothing in the input field then don't try to add a new ingredient
		if( !ingredient ) return;

		const data = {
			id: uuidv4(),
			name: ingredient,
			completed: false
		};

		console.log( JSON.stringify( data ) );

		fetch('https://ary9mw0hd0.execute-api.eu-west-2.amazonaws.com/items', {
			method: 'POST',
			body: JSON.stringify( data ),
			headers: {
				'Content-type': 'application/json; charset=UTF-8',
				'Accept': 'application/json'
			}
		})
		.then((response) => { 
			return response.json();
		})
		.then(() => {
			Items.push( data );
			setIngredient( '' );
			updateItems( Items );
		})
		.catch(( error ) => console.error('Error:', error));	
	}
	
	const handleChange = (e: React.FormEvent<HTMLInputElement>) => {
		setIngredient( e.currentTarget.value );
	}

	return (
		<>
			<form>
				<input
					className={styles.input}
					type="text"
					name="ingredient"
					onChange={ handleChange }
					placeholder="Add a new ingredient..."
					autoFocus
					value={ingredient}
				/>

				<button className={styles.submit} type="submit" onClick={ handleClick }>
					<i className="fas fa-plus fa-fw fa-xl"></i>
				</button>
			</form>
		</>
	);
};

export default AddIngredient;

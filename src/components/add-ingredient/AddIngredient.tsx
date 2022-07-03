import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface Props {
	Items: {
		id: string;
		name: string;
	}[];
	updateItems: Function;
};

const AddIngredient: React.FC<Props> = ({ Items, updateItems }) => {
	const [ingredient, setIngredient] = useState( '' );

	const handleClick = (e: React.FormEvent<EventTarget>): void => {
		e.preventDefault();

		const data = {
			id: uuidv4(),
			name: ingredient
		};

		fetch('https://ary9mw0hd0.execute-api.eu-west-2.amazonaws.com/items', {
			method: 'PUT',
			body: JSON.stringify( data ),
			headers: {
				'Content-type': 'application/json; charset=UTF-8',
				'Accept': 'application/json'
			}
		})
		.then((response) => { 
			return response.json()
		})
		.then(() => {
			Items.push( data );

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
				<input type="text" name="ingredient" onChange={ handleChange } />
				<input type="submit" onClick={ handleClick } />
			</form>
			
		</>
	);
};

export default AddIngredient;

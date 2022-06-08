import React, { useState } from 'react';

interface Props {
	Items: {
		id: number;
		name: string;
	}[]
};

const AddIngredient: React.FC<Props> = ({ Items }) => {
	const [ingredient, setIngredient] = useState( '' );

	const handleClick = (e: React.FormEvent<EventTarget>): void => {
		e.preventDefault();

		console.log( ingredient );

		let xhr = new XMLHttpRequest();
		xhr.open("PUT", "https://ary9mw0hd0.execute-api.eu-west-2.amazonaws.com/items");

		xhr.setRequestHeader("Accept", "application/json");
		xhr.setRequestHeader("Content-Type", "application/json");

		xhr.onload = () => console.log(xhr.responseText);

		let data = `{
			"Name": ${ ingredient },
		}`;

		xhr.send( data );
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

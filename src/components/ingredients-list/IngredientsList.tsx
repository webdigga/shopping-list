import React from 'react';

interface Props {
	Items: {
		id: number;
		name: string;
	}[]
};

const IngredientsList: React.FC<Props> = ({ Items }) => {
	return (
		<>
			<ul>
				{
					Items.map( ( item ) => {
						return <li>{ item.name }</li>
					})
				}
			</ul>
		</>
	)
}

export default IngredientsList;

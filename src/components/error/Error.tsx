import styles from './Error.module.css';

interface Props {
	message: string
}

const Error: React.FC<Props> = ( props ) => {
	return (
		<div className={ styles.error } data-test="error">{ props.message }</div>
	);
}

export default Error;

import styles from './Error.module.css';

function Error( props ) {
	return (
		<div className={ styles.error } data-test="error">{ props.message }</div>
	);
}

export default Error;

import styles from './Spinner.module.css';

// Renders spinner until fetch has completed
function Spinner () {
	return (
		<div className={ styles.spinner } data-test="spinner"></div>
	)
}

export default Spinner;

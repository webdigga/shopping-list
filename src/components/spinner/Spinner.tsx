import React from 'react';
import styles from './Spinner.module.css';

/**
 * Renders a loading spinner until Fatch API call completes.
 */
const Spinner = () => {
	return (        
		<div className={ styles.spinner } data-test="spinner"></div>        
	)
}

export default Spinner;
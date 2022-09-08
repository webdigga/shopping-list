import React from "react";
import { render } from "@testing-library/react";
import Error from "./Error";



test("There should be no completed items if none have been passed through at render", () => {
	const { getByText } = render(
		<Error
			message = { "Sorry, there has been a problem" }
		/>
	);

	expect( getByText( 'Sorry, there has been a problem' ) ).toBeInTheDocument()
});

import { Container, Box } from "@material-ui/core";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Home from "./home";
import "./App.css";

function App() {
	return (
		<Container maxWidth="lg">
			<Box py={1}>
				<Router>
					<Switch>
						<Route path="/">
							<Home />
						</Route>
					</Switch>
				</Router>
			</Box>
		</Container>
	);
}

export default App;

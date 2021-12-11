import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { ThemeProvider } from "@mui/system";
import HomePage from "./views/HomePage";
import DemoPage from "./views/DemoPage";
import theme from "./theme/theme";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Switch>
          <Route exact path="/" component={HomePage} />
          <Route exact path="/demo" component={DemoPage} />
        </Switch>
      </Router>
    </ThemeProvider>
  );
}

export default App;

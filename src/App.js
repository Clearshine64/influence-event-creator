import React, { Component } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import { Web3ReactProvider } from '@web3-react/core'
import Web3 from 'web3'

import Home from './components/home/Home';
import Events from './components/events/Events';
import Connectors from "./components/connectors/Connectors";
import Create from './components/events/Create';
import EventStart from './components/events/EventStart';
import "./App.css";

function getLibrary(provider) {
  return new Web3(provider)
}

class App extends Component {
  state = { storageValue: 0, web3: null, accounts: null, contract: null };
  
  render() {
    return (
      <Web3ReactProvider getLibrary={getLibrary}>
        <div className="App">
          <Router>
            <Switch>
              <Route path="/events">
                <Events />
              </Route>
              <Route path="/connectors">
                <Connectors />
              </Route>
              <Route path="/event/create">
                <Create />
              </Route>
              <Route path="/event/:eventId">
                <EventStart />
              </Route>
              <Route path="/">
                <Home />
              </Route>
            </Switch>
          </Router>
        </div>
      </Web3ReactProvider>
    );
  }
}

export default App;

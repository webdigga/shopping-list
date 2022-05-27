import React from 'react';
import logo from './logo.svg';
import './App.css';

// API Gateway - https://ary9mw0hd0.execute-api.eu-west-2.amazonaws.com/
// PUT/POST - "Content-Type: application/json" -d "{\"id\": \"abcdef234\", \"price\": 12345, \"name\": \"myitem\"}" https://ary9mw0hd0.execute-api.eu-west-2.amazonaws.com/items
// GET all items - https://ary9mw0hd0.execute-api.eu-west-2.amazonaws.com/items
// GET item - https://ary9mw0hd0.execute-api.eu-west-2.amazonaws.com/items/1
// DELETE item - https://ary9mw0hd0.execute-api.eu-west-2.amazonaws.com/items/1

// TODO - list all items
// TODO - Add new item
// TODO - Edit item
// TODO - Delete item
// TODO - Mark item as ticked
// TODO - Ability to untick all items
// TODO - Cypress integration tests
// TODO - Unit tests
// TODO - Deploy App

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;

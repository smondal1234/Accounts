// index.js - WEB
import React from "react";
import ReactDOM from "react-dom";
import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min'
import './index.css'
import App from "./App";
import registerServiceWorker from "./registerServiceWorker";
import { Provider } from 'react-redux'
import store from './store'

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>, document.getElementById("root")
);
registerServiceWorker();

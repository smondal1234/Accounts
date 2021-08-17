import { applyMiddleware, combineReducers, createStore } from "redux";
import thunk from 'redux-thunk'
import { accountStatementReducer } from './reducers/AccountStatementReducer'

const store = createStore(
    combineReducers({
        accountStatementReducer
    }),
    applyMiddleware(thunk)
)

export default store
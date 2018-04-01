import { combineReducers } from 'redux'
import User from './UserActions'
import Polls from './Polls'

export default combineReducers({
    User,
    Polls
})
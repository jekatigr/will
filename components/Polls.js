import { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import pollsActions from "../actions/PollsActions";

import PollsList from './PollsList'
import AddPoll from './AddPoll'

class Polls extends Component {
    constructor(props) {
        super(props);

        this.state = {
            mode: 'list', //or 'add'
        }

        this.togglePollsListMode = this.togglePollsListMode.bind(this);
    }

    togglePollsListMode() {
        this.setState({
            mode: (this.state.mode === 'list') ? 'add' : 'list'
        })
    }

    async componentDidMount() {
        let { loadPolls } = this.props.pollsActions;
        await loadPolls();
    }

    render() {
        let { user } = this.props.userState;
        let { polls, pollsLoaded, pollsLoadingError } = this.props.pollsState;
        let { handlePollAdded, handleVoteAdded } = this.props.pollsActions;

        if (!pollsLoaded && !pollsLoadingError) {
            return (
                <div className="uk-position-center">
                    <img src='./static/images/spinner.gif' className="spinner" /> Загрузка голосований...
                </div>
            )
        }

        if (pollsLoadingError) {
            return (
                <div className="uk-position-center uk-alert uk-alert-danger">
                    Ошибка при загрузке голосований, обновите страницу.
                </div>
            )
        }

        if (this.state.mode === 'list') {
            return <PollsList polls={polls} togglePollsListMode={this.togglePollsListMode} handleVoteAdded={handleVoteAdded}/>
        } else if(this.state.mode === 'add') {
            return <AddPoll handlePollAdded={handlePollAdded} togglePollsListMode={this.togglePollsListMode}/>
        }
    }
}

const mapStateToProps = (state) => ({
    userState: state.User,
    pollsState: state.Polls
});
const mapDispatchToProps = (dispatch) => ({
    pollsActions: bindActionCreators(pollsActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(Polls)
import { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import pollsActions from "../actions/PollsActions";

class Polls extends Component {
    async componentDidMount() {
        let { loadPolls } = this.props.pollsActions;
        await loadPolls();
    }

    render() {
        let { user } = this.props.userState;
        let { polls, pollsLoaded, pollsLoadingError } = this.props.pollsState;
        // let { logout } = this.props.userActions;

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

        if (pollsLoaded && (!polls || polls.length === 0)) {
            return (
                <div className="uk-position-center uk-alert">
                    {/*Голосований нет, но можно <a>создать...</a>*/}
                    Голосований нет.
                </div>
            )
        }

        return (
            <div>
                Голосования
            </div>
        )
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
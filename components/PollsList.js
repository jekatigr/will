import { Component } from 'react'

export default class PollsList extends Component {
    constructor(props) {
        super(props);

        this.handleAddPollLickClicked = this.handleAddPollLickClicked.bind(this);
    }

    handleAddPollLickClicked(event) {
        event.preventDefault();

        let togglePollsListMode = this.props.togglePollsListMode;
        togglePollsListMode()
    }

    render() {
        let { polls } = this.props;

        if (!polls || polls.length === 0) {
            return (
                <div className="uk-position-center uk-alert">
                    Голосований нет, но можно <a onClick={this.handleAddPollLickClicked}>создать...</a>
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
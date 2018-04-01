import { Component } from 'react'
import {post} from "../utils/fetch";
import {showNotificationError, showNotificationSuccess} from "../utils/UIkitWrapper";

export default class PollsList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            inProgress: false
        }

        this.handleAddPollLickClicked = this.handleAddPollLickClicked.bind(this);
        this.handleVoteClicked = this.handleVoteClicked.bind(this);
    }

    handleAddPollLickClicked(event) {
        event.preventDefault();

        let togglePollsListMode = this.props.togglePollsListMode;
        togglePollsListMode()
    }

    async handleVoteClicked(event) {
        let pollId = +event.currentTarget.getAttribute("data-poll");
        let optionIndex = +event.currentTarget.getAttribute("data-option");

        let { handleVoteAdded } = this.props;

        this.setState({
            inProgress: true
        })

        try {
            const res = await post('api/v1/vote', {
                pollId: pollId,
                optionIndex: optionIndex
            })

            if (res && res.success) {
                handleVoteAdded(pollId, optionIndex);
                showNotificationSuccess("Голос отдан.")
            } else {
                showNotificationError("Внутренняя ошибка, пожалуйста, попробуйте позже.")
            }
        } catch (ex) {
            console.log(`poll vote request failed, exception: ${ex}`);
            showNotificationError();
        }
        this.setState({
            inProgress: false
        })
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

        let pollsCards = [];
        for (let poll of polls) {

            let total = 0;
            let alreadyVoted = false;
            for(let o of poll.options) {
                total += o.votesCount;
                if (o.selected) {
                    alreadyVoted = true;
                }
            }

            let tooltip = (alreadyVoted) ? undefined : "title: Отдать голос; pos: bottom"
            let onClickFunction = (alreadyVoted) ? undefined : this.handleVoteClicked
            let pollOptions = []
            for (let i = 0; i < poll.options.length; i++) {
                let option = poll.options[i]
                let percent = (total === 0) ? 0 : ((option.votesCount / total) * 100).toFixed(1)
                pollOptions.push(
                    <div className={(alreadyVoted) ? "" : "vote_option"}
                         onClick={onClickFunction}
                         data-uk-tooltip={tooltip}
                         data-option={i}
                         data-poll={poll.id}
                    >
                        <span key={i}>{option.title} ({percent}%)</span>
                        <progress className="uk-progress" value={option.votesCount} max={total}/>
                    </div>
                )
            }

            let pollCard = (
                <div key={poll.id}>
                    <div className="uk-card uk-card-default uk-card-small uk-card-body uk-margin-top uk-padding-small">
                        {(alreadyVoted) ? (
                            <div className="uk-card-badge uk-label uk-label-success">Голос отдан</div>
                        ) : ""}
                        <div className="uk-card-header"><h3>{poll.title}</h3></div>
                        <div className="uk-card-body">
                            {poll.description}
                        </div>
                        <div className="uk-card-footer">
                            {pollOptions}
                        </div>
                    </div>
                </div>
            )

            pollsCards.push(pollCard)
        }


        return (
            <div className={(this.state.inProgress) ? "uk-container uk-disabled" : "uk-container"}>
                <div className="uk-grid uk-grid-medium uk-grid-match uk-child-width-1-2 uk-margin-bottom">
                    {pollsCards}
                </div>
            </div>
        )
    }
}
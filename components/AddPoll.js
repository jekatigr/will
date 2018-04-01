import { Component } from 'react'
import { post } from '../utils/fetch'

import ProceedIcon from 'react-icons/lib/md/arrow-forward';
import RemoveIcon from 'react-icons/lib/md/highlight-remove';

import { showNotificationError } from '../utils/UIkitWrapper'

export default class AddPoll extends Component {
    constructor(props) {
        super(props);

        this.state = {
            title: '',
            description: '',
            options: ['', ''],

            inProgress: false
        }

        this.handleTitleChange = this.handleTitleChange.bind(this);
        this.handleDescriptionChange = this.handleDescriptionChange.bind(this);
        this.handleOptionChange = this.handleOptionChange.bind(this);
        this.handleAddButtonClicked = this.handleAddButtonClicked.bind(this);
        this.handleRemoveIconClicked = this.handleRemoveIconClicked.bind(this);
        this.handleCancelButtonClicked = this.handleCancelButtonClicked.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleTitleChange(event) {
        this.setState({
            title: event.target.value
        })
    }

    handleDescriptionChange(event) {
        this.setState({
            description: event.target.value
        })
    }

    handleAddButtonClicked(event) {
        event.preventDefault();

        let newOptions = [...this.state.options, '']
        this.setState({
            options: newOptions
        })
    }

    handleRemoveIconClicked(event) {
        event.preventDefault();

        let optionIndex = +event.currentTarget.getAttribute("data-option");
        let newOptions = [...this.state.options];

        newOptions.splice(optionIndex, 1);

        this.setState({
            options: newOptions
        })
    }

    handleOptionChange(event) {
        let optionIndex = +event.currentTarget.getAttribute("data-option");

        let newOptions = [...this.state.options];
        newOptions[optionIndex] = event.target.value
        this.setState({
            options: newOptions
        })
    }

    handleCancelButtonClicked(event) {
        event.preventDefault();

        let togglePollsListMode = this.props.togglePollsListMode;
        togglePollsListMode();
    }


    async handleSubmit(event) {
        event.preventDefault();

        let { handlePollAdded, togglePollsListMode } = this.props;

        this.setState({
            inProgress: true
        })

        try {
            const res = await post('api/v1/poll', {
                title: this.state.title,
                description: this.state.description,
                options: this.state.options
            })

            if (res && res.success && res.poll) {
                handlePollAdded(res.poll);
                togglePollsListMode();
            } else {
                showNotificationError("Внутренняя ошибка, пожалуйста, попробуйте позже.")
            }
        } catch (ex) {
            console.log(`poll creation request failed, exception: ${ex}`);
            showNotificationError();
        }
        this.setState({
            inProgress: false
        })
    }

    render() {
        let { title, description, options, inProgress } = this.state;

        return (
            <div className="uk-section uk-section-small uk-section-muted">
                <div className="uk-container uk-container-large">
                    <div className="uk-width-1-1 uk-width-2-3@s uk-align-center">
                        <div className="uk-card uk-card-default">
                            <div className="uk-card-header">
                                <h3>Создание голосования</h3>
                            </div>
                            <div className="uk-card-body uk-padding-remove-bottom">
                                <form onSubmit={this.handleSubmit} method="POST" className="uk-margin-small-bottom">
                                    <fieldset className="uk-fieldset">
                                        <div className="uk-margin">
                                            <div className="uk-position-relative">
                                                <input name="title" className="uk-input" value={title} placeholder="Заголовок..." onChange={this.handleTitleChange} disabled={inProgress}/>
                                            </div>
                                        </div>
                                        <div className="uk-margin">
                                            <div className="uk-position-relative">
                                                <textarea className="uk-textarea" rows="5" value={description} placeholder="Описание..." onChange={this.handleDescriptionChange} disabled={inProgress} />
                                            </div>
                                        </div>

                                        {options.map((option, index) => {
                                            return (
                                                <div key={index}>
                                                    <div className="uk-margin">
                                                        <div className="uk-position-relative">
                                                            {(options.length > 2) ? (
                                                                <a className="uk-form-icon uk-form-icon-flip remove_option_icon" data-option={index} onClick={this.handleRemoveIconClicked}>
                                                                    <RemoveIcon size={20}/>
                                                                </a>
                                                            ) : ""}
                                                            <input className="uk-input"
                                                                   value={option}
                                                                   data-option={index}
                                                                   placeholder="Введите вариант для голосования..."
                                                                   onChange={this.handleOptionChange}
                                                                   disabled={inProgress}
                                                            />
                                                        </div>
                                                    </div>

                                                </div>
                                            )
                                        })}

                                        <button className="uk-button uk-button-default uk-button-small uk-align-center uk-margin" onClick={this.handleAddButtonClicked} disabled={inProgress}>
                                            Добавить вариант
                                        </button>

                                        <div className="uk-margin">
                                            <button type="reset" className="uk-button uk-button-default" disabled={inProgress} onClick={this.handleCancelButtonClicked}>
                                                Отмена
                                            </button>
                                            <button type="submit" className="uk-button uk-button-primary uk-align-right" disabled={inProgress}>
                                                <ProceedIcon size={20}/>&nbsp; Создать
                                            </button>
                                        </div>
                                    </fieldset>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
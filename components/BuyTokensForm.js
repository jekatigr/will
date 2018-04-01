import { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { post } from '../utils/fetch'

import ProceedIcon from 'react-icons/lib/md/arrow-forward';

import userActions from '../actions/UserActions'
import { showNotificationSuccess, showNotificationError } from '../utils/UIkitWrapper'

class BuyTokensForm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            amount: '',
            inProgress: false
        }

        this.handleAmountChange = this.handleAmountChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleAmountChange(event) {
        this.setState({
            amount: event.target.value
        })
    }

    async handleSubmit(event) {
        event.preventDefault();

        let { handleBalanceChanged } = this.props.userActions;
        this.setState({
            inProgress: true
        })

        try {
            const res = await post('api/v1/buy', {
                amount: this.state.amount
            })

            if (res && res.success) {
                handleBalanceChanged(res.balance);
                showNotificationSuccess("Токены получены.")
                this.setState({
                    amount: ''
                })
            } else {
                showNotificationError("Внутренняя ошибка, попробуйте позже.")
            }
        } catch (ex) {
            console.log(`login request failed, exception: ${ex}`);
            showNotificationError();
        }
        this.setState({
            inProgress: false
        })
    }

    render() {
        let { amount, inProgress } = this.state;

        return (
            <div className="uk-section uk-section-muted">
                <div className="uk-container uk-container-large">
                    <div className="uk-width-1-1 uk-width-2-3@s uk-width-2-5@m uk-width-2-5@l uk-width-1-3@xl uk-align-center">
                        <div className="uk-card uk-card-default">
                            <div className="uk-card-header">
                                <h3>Покупка токенов для голосований</h3>
                            </div>
                            <div className="uk-card-body uk-padding-remove-bottom">
                                <form onSubmit={this.handleSubmit} method="POST" className="uk-margin-small-bottom">
                                    <fieldset className="uk-fieldset">
                                        <div className="uk-margin">
                                            <div className="uk-position-relative">
                                                <input name="amount" className="uk-input" type="number" value={amount} placeholder="Введите количество..." onChange={this.handleAmountChange}/>
                                            </div>
                                        </div>
                                        <div className="uk-margin uk-align-right">
                                            <button type="submit" className="uk-button uk-button-primary" disabled={inProgress}>
                                                <ProceedIcon size={20}/>&nbsp; Купить
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

const mapDispatchToProps = (dispatch) => ({
    userActions: bindActionCreators(userActions, dispatch)
})

export default connect(null, mapDispatchToProps)(BuyTokensForm)
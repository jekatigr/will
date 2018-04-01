import { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Router from 'next/router'
import { post } from '../utils/fetch'

import UserIcon from 'react-icons/lib/md/person-outline';
import LockIcon from 'react-icons/lib/md/lock-outline';
import ProceedIcon from 'react-icons/lib/md/arrow-forward';

import userActions from '../actions/UserActions'
import { showNotificationError } from '../utils/UIkitWrapper'

class LoginForm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            login: '',
            password: '',
            inProgress: false
        }

        this.handleLoginChange = this.handleLoginChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleLoginChange(event) {
        this.setState({
            login: event.target.value
        })
    }

    handlePasswordChange(event) {
        this.setState({
            password: event.target.value
        })
    }

    async handleSubmit(event) {
        event.preventDefault();

        let { handleUserLogin } = this.props.userActions;
        this.setState({
            inProgress: true
        })

        try {
            const res = await post('api/v1/login', {
                login: this.state.login,
                password: this.state.password
            })

            if (res && res.success && res.user) {
                handleUserLogin(res.user);
                Router.push('/')
            } else {
                showNotificationError(res && res.error === "INVALID_CREDENTIALS" ? "Неверный логин/пароль." : "Внутренняя ошибка, попробуйте позже.")
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
        let { login, password, inProgress } = this.state;

        return (
            <div className="uk-section uk-section-muted">
                <div className="uk-container uk-container-large">
                    <div className="uk-width-1-1 uk-width-2-3@s uk-width-2-5@m uk-width-2-5@l uk-width-1-3@xl uk-align-center">
                        <div className="uk-card uk-card-default">
                            <div className="uk-card-header">
                                Вход
                            </div>
                            <div className="uk-card-body uk-padding-remove-bottom">
                                <form onSubmit={this.handleSubmit} method="POST" className="uk-margin-small-bottom">
                                    <fieldset className="uk-fieldset">
                                        <div className="uk-margin">
                                            <div className="uk-position-relative">
                                                <span className="uk-form-icon"><UserIcon size={20}/></span>
                                                <input name="login" className="uk-input" value={login} placeholder="Логин" onChange={this.handleLoginChange}/>
                                            </div>
                                        </div>
                                        <div className="uk-margin">
                                            <div className="uk-position-relative">
                                                <span className="uk-form-icon"><LockIcon size={20}/></span>
                                                <input name="LoginForm[password]" className="uk-input" value={password} type="password" placeholder="Пароль" onChange={this.handlePasswordChange}/>
                                            </div>
                                        </div>
                                        <div className="uk-margin uk-align-right">
                                            <button type="submit" className="uk-button uk-button-primary" disabled={inProgress}>
                                                <ProceedIcon size={20}/>&nbsp; Войти
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

export default connect(null, mapDispatchToProps)(LoginForm)
import { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { withRouter } from 'next/router'
import Router from "next/router";

import Link from 'next/link'
import LogoutIcon from 'react-icons/lib/md/exit-to-app';

import userActions from "../actions/UserActions";

class Header extends Component {
    loginLinkClicked() {
        Router.push('/login');
    }

    balanceClicked() {
        Router.push('/buy');
    }


    render() {
        let { router, user, balance } = this.props;
        let { logout } = this.props.userActions;
        let currentPage = router.pathname;

        let loginButton = (
            <div className="uk-navbar-right header_logout_login_link" onClick={this.loginLinkClicked.bind(this)}>
                <a>Войти <LogoutIcon size={30}/></a>
            </div>
        )

        let userPanel = !user ? '' : (
            <div className="uk-navbar-right header_logout_login_link">
                <span className="uk-margin-right navbar_text">{user.login}</span>
                <div className="uk-badge uk-badge uk-margin-right uk-padding-small user_panel_balance" onClick={this.balanceClicked.bind(this)}>
                    Баланс голосов: {+balance}
                </div>
                <div onClick={logout}>
                    <a>Выход <LogoutIcon size={30}/></a>
                </div>
            </div>
        )

        return (
            <div className="uk-section-primary">
                <nav className="uk-navbar">
                    <div className="uk-navbar-left">
                        <Link href={'/'}>
                            <a className="uk-navbar-item uk-logo">
                                <span className="logo_text uk-visible@m">Will of the nation</span>
                            </a>
                        </Link>

                        <ul className="uk-navbar-nav uk-visible@s">
                            <li className={(currentPage === '/' ? "uk-active" : null)}>
                                <Link href={'/'}>
                                    <a>О проекте</a>
                                </Link>
                            </li>
                            <li className={(currentPage.includes('polls') ? "uk-active" : null)}>
                                <Link href={'/polls'}>
                                    <a>Голосования</a>
                                </Link>
                            </li>
                        </ul>

                    </div>

                    { (user) ? userPanel : loginButton }

                </nav>
            </div>
        )
    }
}

const mapStateToProps = (state) => state.User;
const mapDispatchToProps = (dispatch) => ({
    userActions: bindActionCreators(userActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Header))
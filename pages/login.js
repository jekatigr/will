import { Component } from 'react'
import withRedux from 'next-redux-wrapper'
import Router from "next/router";

import { initStore } from '../utils/store';
import { getAuthenticatedUser } from "../utils/checkAuth";

import Layout from '../components/Layout'
import LoginForm from '../components/LoginForm'

class LoginPage extends Component {

    static async getInitialProps ({ isServer, req, res, store }) {
        let user = getAuthenticatedUser(isServer, req, store)

        if (user) {
            if (!isServer) {
                Router.push('/');
            } else {
                res.redirect('/')
            }
        }
    }

    render() {
        return (
            <Layout title="Вход">
                <LoginForm/>
            </Layout>
        )
    }
}

export default withRedux(initStore, null)(LoginPage)

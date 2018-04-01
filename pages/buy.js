import { Component } from 'react'
import withRedux from 'next-redux-wrapper'
import Router from "next/router";

import { initStore } from '../utils/store';
import { getAuthenticatedUser } from "../utils/checkAuth";

import Layout from '../components/Layout'
import BuyTokensForm from '../components/BuyTokensForm'

class BuyTokensPage extends Component {

    static async getInitialProps ({ isServer, req, res, store }) {
        let user = getAuthenticatedUser(isServer, req, store)

        if (!user) {
            if (!isServer) {
                Router.push('/login');
            } else {
                res.redirect('/login')
            }
        }
    }

    render() {
        return (
            <Layout title="Покупка токенов">
                <BuyTokensForm/>
            </Layout>
        )
    }
}

export default withRedux(initStore, null)(BuyTokensPage)

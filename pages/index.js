import { Component } from 'react'
import withRedux from 'next-redux-wrapper'

import { initStore } from '../utils/store'
import { getAuthenticatedUser } from "../utils/checkAuth";

import Layout from '../components/Layout'
import Polls from '../components/Polls'
import Router from "next/router";

class PollsPage extends Component {

    static async getInitialProps ({ isServer, req, res, store }) {
        let user = getAuthenticatedUser(isServer, req, store)

        if (!user) {
            if (!isServer) {
                Router.push('/login');
            } else {
                res.redirect('/login')
            }
        }

        return {};
    }

    render() {
        return (
            <Layout title="Голосования">
                <Polls/>
            </Layout>
        )
    }
}

export default withRedux(initStore, null)(PollsPage)

import { Component } from 'react'
import withRedux from 'next-redux-wrapper'

import { initStore } from '../utils/store'
import { getAuthenticatedUser } from "../utils/checkAuth";

import Layout from '../components/Layout'

class IndexPage extends Component {

    static async getInitialProps ({ isServer, req, res, store }) {
        let user = getAuthenticatedUser(isServer, req, store)
        return {};
    }

    render() {
        return (
            <Layout title="О проекте">
                <div className="uk-flex uk-flex-middle uk-flex-center uk-height-large"><h2>Главная страница</h2></div>
            </Layout>
        )
    }
}

export default withRedux(initStore, null)(IndexPage)

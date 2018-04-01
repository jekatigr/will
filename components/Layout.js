import NextHeadMiddleware from 'next/head'
import { Component } from 'react'
import Router from 'next/router'

import NProgress from 'nprogress'

import Header from './Header'

/* Router events */
Router.onRouteChangeStart = (url) => NProgress.start()
Router.onRouteChangeComplete = () => NProgress.done()
Router.onRouteChangeError = () => NProgress.done()
/* /Router events */


export default class Layout extends Component {
    render() {
        let {children, title} = this.props;

        if (title) {
            title += ` | Will of the nation project`
        } else {
            title = `Will of the nation project`;
        }

        return (
            <div>
                <NextHeadMiddleware>
                    <title>{ title }</title>
                    <meta charSet='utf-8'/>
                    <meta name='viewport' content='initial-scale=1.0, width=device-width'/>
                    <base href="/" />
                    <link rel="shortcut icon" href="static/images/favicon.ico" type="image/x-icon" />
                    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />

                    <link rel="stylesheet" href="static/css/uikit.min.css" />
                    <script src="static/js/uikit.min.js" />
                    <script src="static/js/uikit-icons.min.js" />

                    <link href="static/css/style.css" rel="stylesheet" />
                    <link href="static/css/nprogress.css" rel="stylesheet" />

                </NextHeadMiddleware>

                <Header/>

                { children }

            </div>
        )
    }
}

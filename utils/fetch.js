import fetchFunction from 'isomorphic-unfetch'

export async function get(uri, params) {
    if (params) {
        uri = withQuery(uri, params);
    }
    try {
        const res = await fetchFunction(uri, {
            method: 'GET',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            credentials: "include"
        });
        const json = await res.json();

        if (json) {
            return json;
        } else {
            console.log(`request failed, data missing`);
        }
    } catch (ex) {
        console.log(`request failed, exception: ${ex}`);
    }
}

const withQuery = (uri, params) => {
    let query = Object.keys(params)
        .filter(k => params[k] !== undefined)
        .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
        .join('&');
    uri += (uri.indexOf('?') === -1 ? '?' : '&') + query;
    return uri;
};

export async function post(uri, params) {
    try {
        const res = await fetch(uri, {
            method: 'POST',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            credentials: "include",
            body: JSON.stringify(params)
        });

        if (res) {
            const json = await res.json();
            if (json) {
                return json;
            }
        }
        console.log(`request failed, data missing`);
    } catch (ex) {
        console.log(`request failed, exception: ${ex}`);
    }
}
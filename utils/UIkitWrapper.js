export function showNotificationError(error = 'Внутренняя ошибка, попробуйте позже.') {
    UIkit.notification(`<span data-uk-icon='icon: warning'></span> ${error}`, {status: 'danger'})
}

export function showNotificationSuccess(text) {
    UIkit.notification(`<span data-uk-icon='icon: check'></span> ${text}`, {status: 'success'})
}
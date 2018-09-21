const sendSnack = (store, message, type = 'info', timeout = 15) => {
  store.dispatch('Snacks/create', { message, type, timeout })
}

const SnackListener = (store) => {
  store.subscribe(({ type, payload }, state) => {
    if (type === 'Errors/NEW_ERROR') {
      sendSnack(store, payload.message, 'error', (payload.persist ? -1 : 15))
    } else if (type.startsWith('Lights')) {
      let name = (payload.name ? `"${payload.name}"` : '')
      if (payload.id || payload.id === 0) {
        if (!name) {
          name = `#${payload.id}`
        } else {
          name += ` [#${payload.id}]`
        }
      }
      switch (type) {
        case 'Lights/ADD_LIGHT':
          sendSnack(store, `Successfully added Light ${name}`, 'success')
          break
      }
    }
  })
}

export default SnackListener

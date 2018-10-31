const sendSnack = (store, message, type = 'info', { timeout, persist, dismissable, color } = {}) => {
  store.dispatch('Snacks/createSnack', {
    message,
    type,
    timeout: (persist ? 0 : timeout),
    dismissable,
    color
  });
};

const SnackChef = (store) => {
  store.subscribe(({ type, payload }, state) => {
    if (type === 'Errors/NEW_ERROR') {
      const type = (['warning'].includes(payload.type) ? payload.type : 'error');
      sendSnack(store, payload.message, type, {
        timeout: payload.timeout,
        persist: payload.persist,
        dismissable: payload.dismissable
      });
    } else if (type.startsWith('Lights') && payload && typeof payload === 'object') {
      let name = (payload.name ? `"${payload.name}"` : '');
      if (payload.id || payload.id === 0) {
        if (!name) {
          name = `#${payload.id}`;
        } else {
          name += ` [#${payload.id}]`;
        }
      }
      switch (type) {
        case 'Lights/ADD_LIGHT':
          sendSnack(store, `Successfully added Light ${name}`, 'success');
          break;
      }
    }
  });
};

export default SnackChef;

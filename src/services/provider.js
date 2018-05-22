export const getProvider = () => {
  if (typeof window.web3 !== 'undefined' && typeof window.web3.currentProvider !== 'undefined') {
    return window.web3.currentProvider
  } else {
    throw new Error('no metamask')
  }
}

export const getWebsocketProvider = () => {
  // https://github.com/ethereum/web3.js/issues/1119
  // TODO: check whether WebsocketProvider exists
  if (!window.Web3.providers.WebsocketProvider.prototype.sendAsync) {
    window.Web3.providers.WebsocketProvider.prototype.sendAsync = window.Web3.providers.WebsocketProvider.prototype.send
  }

  return new window.Web3.providers.WebsocketProvider('wss://rinkeby.infura.io/_ws')
}

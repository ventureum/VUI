import { createStore } from 'redux'

/**
 * This is a reducer, a pure function with (state, action) => state signature.
 * It describes how an action transforms the state into the next state.
 *
 * The shape of the state is up to you: it can be a primitive, an array, an object,
 * or even an Immutable.js data structure. The only important part is that you should
 * not mutate the state object, but return a new object if the state changes.
 *
 * In this example, we use a `switch` statement and strings, but you can use a helper that
 * follows a different convention (such as function maps) if it makes sense for your
 * project.
 */
function reducer (state = -1, action) {
  switch (action.type) {
    case 'WEB3_RECEIVE_ACCOUNT':
    case 'WEB3_FETCH_ACCOUNT_ERROR':
    case 'WEB3_CHANGE_ACCOUNT':
    case 'WEB3_CHANGE_NETWORK':
    case 'WEB3_FETCH_NETWORK_ERROR':
    case 'TOKEN_CONTRACT_INIT':
    case 'TOKEN_EVENT':
    case 'TOKEN_APPROVE':
    case 'TOKEN_TRANSFERED':
    case 'SALE_CONTRACT_INIT':
    case 'SALE_EVENT':
    case 'REGISTRY_CONTRACT_INIT':
    case 'REGISTRY_NAME_APPLY':
    case 'REGISTRY_PROJECT_CHALLENGE':
    case 'REGISTRY_PROJECT_VOTE_COMMIT':
    case 'REGISTRY_PROJECT_VOTE_REVEAL':
    case 'REGISTRY_PROJECT_UPDATE_STATUS':
    case 'REGISTRY_CLAIM_REWARD':
    case 'REGISTRY_EVENT':
    case 'PLCR_CONTRACT_INIT':
    case 'PLCR_VOTE_COMMIT':
    case 'PLCR_VOTE_REVEAL':
    case 'PLCR_EVENT':
    case 'PLCR_REQUEST_VOTING_RIGHTS':
    case 'PLCR_WITHDRAW_VOTING_RIGHTS':
    case 'PARAMETERIZER_CONTRACT_INIT':
    case 'PARAMETERIZER_EVENT':
    case 'TOKEN_SALE_CONTRACT_INIT':
    case 'TOKEN_SALE_EVENT':
    case 'PROJECT_CONTROLLER_CONTRACT_INIT':
    case 'PROJECT_CONTROLLER_EVENT':
    case 'MILESTONE_CONTRACT_INIT':
    case 'MILESTONE_EVENT':
    case 'REP_SYS_CONTRACT_INIT':
    case 'REP_SYS_EVENT':
    case 'REGULATING_RATING_CONTRACT_INIT':
    case 'REGULATING_RATING_EVENT':
    case 'REFUND_MANAGER_CONTRACT_INIT':
    case 'REFUND_MANAGER_EVENT':
    case 'REWARD_MANAGER_CONTRACT_INIT':
    case 'REWARD_MANAGER_EVENT':
    case 'PAYMENT_MANAGER_CONTRACT_INIT':
    case 'PAYMENT_MANAGER_EVENT':
    case 'SHOW_TRANSACTION_INFO':
    case 'UPDATE_TIMESTAMP':
      return action
    default:
      return state
  }
}

// Create a Redux store holding the state of your app.
// Its API is { subscribe, dispatch, getState }.
let store = createStore(reducer)

// You can use subscribe() to update the UI in response to state changes.
// Normally you'd use a view binding library (e.g. React Redux) rather than subscribe() directly.
// However it can also be handy to persist the current state in the localStorage.

/*
store.subscribe(() =>
  console.log(store.getState())
)
*/

export default store

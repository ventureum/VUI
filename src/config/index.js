import contract from 'truffle-contract'
import { getProvider } from '../services/provider'

var createErrorHandler = function (name) {
  return function (err) {
    console.error(err)
    throw new Error('contract ' + name + ' cannot be found, make sure you are connected to Rinkeby Testnet')
  }
}

// refer to https://github.com/trufflesuite/truffle-contract/issues/88
// can't catch error from `.at()`, use `then()` to check if we get the instance
var createEmptyChecker = function (name) {
  return function (inst) {
    if (!inst) {
      throw new Error('contract ' + name + ' cannot be found, make sure you are using the correct network.')
    } else {
      return Promise.resolve(inst)
    }
  }
}

export const getAbi = async (contract) => {
  const url = '/contracts'
  const data = await window.fetch(`${url}/${contract}.json`)
  const json = await data.json()

  return json
}

export const getRegistry = async (account, provider) => {
  const registryArtifact = await getAbi('Registry')
  const Registry = contract(registryArtifact)
  Registry.defaults({from: account})
  Registry.setProvider(provider || getProvider())

  return Registry.deployed().catch(createErrorHandler('Registry'))
}

export const getSale = async (account, provider) => {
  const saleArtifact = await getAbi('Presale')
  const Sale = contract(saleArtifact)
  Sale.defaults({from: account})
  Sale.setProvider(provider || getProvider())

  return Sale.deployed().catch(createErrorHandler('Presale'))
}

export const getToken = async (account, provider) => {
  const tokenArtifact = await getAbi('VetXToken')
  const Token = contract(tokenArtifact)
  Token.defaults({from: account})
  Token.setProvider(provider || getProvider())

  return Token.deployed().catch(createErrorHandler('VetXToken'))
}

export const getPLCR = async (account) => {
  const plcrArtifact = await getAbi('PLCRVoting')
  const PLCRVoting = contract(plcrArtifact)
  PLCRVoting.defaults({from: account})
  PLCRVoting.setProvider(getProvider())

  return PLCRVoting.deployed().catch(createErrorHandler('PLCRVoting'))
}

export const getParameterizer = async (account) => {
  const pArtifact = await getAbi('Parameterizer')
  const Parameterizer = contract(pArtifact)
  Parameterizer.defaults({from: account})
  Parameterizer.setProvider(getProvider())

  return Parameterizer.deployed().catch(createErrorHandler('Parameterizer'))
}

export const getTokenSale = async (account) => {
  const pArtifact = await getAbi('TokenSale')
  const TokenSale = contract(pArtifact)
  TokenSale.defaults({from: account})
  TokenSale.setProvider(getProvider())

  return TokenSale.deployed().catch(createErrorHandler('TokenSale'))
}

export const getProjectController = async (account) => {
  const pArtifact = await getAbi('ProjectController')
  const ProjectController = contract(pArtifact)
  ProjectController.defaults({from: account})
  ProjectController.setProvider(getProvider())

  return ProjectController.deployed().catch(createErrorHandler('ProjectController'))
}

export const getMilestoneController = async (account) => {
  const pArtifact = await getAbi('MilestoneController')
  const MilestoneController = contract(pArtifact)
  MilestoneController.defaults({from: account})
  MilestoneController.setProvider(getProvider())

  return MilestoneController.deployed().catch(createErrorHandler('MilestoneController'))
}

export const getMilestoneControllerView = async (account) => {
  const pArtifact = await getAbi('MilestoneControllerView')
  const MilestoneControllerView = contract(pArtifact)
  MilestoneControllerView.defaults({from: account})
  MilestoneControllerView.setProvider(getProvider())

  return MilestoneControllerView.deployed().catch(createErrorHandler('MilestoneControllerView'))
}

export const getCarbonVoteXCore = async (account) => {
  const pArtifact = await getAbi('CarbonVoteXCore')
  const CarbonVoteXCore = contract(pArtifact)
  CarbonVoteXCore.defaults({from: account})
  CarbonVoteXCore.setProvider(getProvider())

  return CarbonVoteXCore.deployed().catch(createErrorHandler('CarbonVoteXCore'))
}

export const getRepSys = async (account) => {
  const pArtifact = await getAbi('ReputationSystem')
  const ReputationSystem = contract(pArtifact)
  ReputationSystem.defaults({from: account})
  ReputationSystem.setProvider(getProvider())

  return ReputationSystem.deployed().catch(createErrorHandler('ReputationSystem'))
}

export const getRegulatingRating = async (account) => {
  const pArtifact = await getAbi('RegulatingRating')
  const RegulatingRating = contract(pArtifact)
  RegulatingRating.defaults({from: account})
  RegulatingRating.setProvider(getProvider())

  return RegulatingRating.deployed().catch(createErrorHandler('RegulatingRating'))
}

export const getRefundManager = async (account) => {
  const pArtifact = await getAbi('RefundManager')
  const RefundManager = contract(pArtifact)
  RefundManager.defaults({from: account})
  RefundManager.setProvider(getProvider())

  return RefundManager.deployed().catch(createErrorHandler('RefundManager'))
}

export const getRewardManager = async (account) => {
  const pArtifact = await getAbi('RewardManager')
  const RewardManager = contract(pArtifact)
  RewardManager.defaults({from: account})
  RewardManager.setProvider(getProvider())

  return RewardManager.deployed().catch(createErrorHandler('RewardManager'))
}

export const getPaymentManager = async (account) => {
  const pArtifact = await getAbi('PaymentManager')
  const PaymentManager = contract(pArtifact)
  PaymentManager.defaults({from: account})
  PaymentManager.setProvider(getProvider())

  return PaymentManager.deployed().catch(createErrorHandler('PaymentManager'))
}

export const getERC20Token = async (account, address) => {
  const pArtifact = await getAbi('ERC20')
  const Token = contract(pArtifact)
  Token.defaults({from: account})
  Token.setProvider(getProvider())

  return Token.at(address).then(createEmptyChecker('Token'))
}

// sendTransaction

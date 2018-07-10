import contract from 'truffle-contract'
import { getProvider } from '../services/provider'

var createErrorHandler = function (name) {
  return function (err) {
    console.error(err)
    throw new Error('contract ' + name + ' cannot be found, make sure you are connected to Rinkeby Testnet')
  }
}

export const getAbi = async (contract) => {
  const storageKey = `ventureum:abi:${contract}`
  const cached = window.sessionStorage.getItem(storageKey)

  try {
    if (cached) {
      return JSON.parse(cached)
    }
  } catch (error) {
    console.error(error)
  }

  const url = '/contracts'
  const data = await window.fetch(`${url}/${contract}.json`)
  const json = await data.json()

  try {
    window.sessionStorage.setItem(storageKey, JSON.stringify(json))
  } catch (error) {
    console.error(error)
  }

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

// sendTransaction

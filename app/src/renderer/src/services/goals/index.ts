import request from '../../lib/request'

export enum GoalsQueryEnum {
  UNFINISHED = 'unfinished',
  CREATE = 'create',
  START = 'start',
  GOAL_CACULATE = 'goal-caculate',
  FINISH = 'finish',
  GET_FINISH_GOALS = 'get-finish-goals',
  CONTRIBUTE_DATA = 'get-contribute-data'
}

export function getUnfinishedGoals(data: { address: string }) {
  return request('/api/goals/unfinished', {
    data
  })
}

export function createGoal(data: {
  address: string
  goalIpfsCid: string
  name: string
  description: string
  duration: number
}) {
  return request('/api/goals/create', {
    data
  })
}

export function fetchStartGoal(data: { address: string; goalId: string; startedAt: string }) {
  return request('/api/goals/start', {
    data
  })
}

export function getCalculateGoal(data: { goalId: string }) {
  return request('/api/goals/detail', {
    data
  })
}

export function finishGoal(data: {user: string; goalId: string; zoneId: string }) {
  return request('/api/goals/finish', {
    data
  })
}

export function getFinishedGoalsdata(data: { address: string }) {
  return request('/api/goals/finshed-goals', {
    data
  })
}

export function getContributeData(data: { address: string; startDate: string; endDate: string }) {
  return request('/api/goals/contribute-data', {
    data
  })
}

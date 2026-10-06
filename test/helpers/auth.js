export const USERS = {
  han: { username: 'han', password: 'han', planet: 'Corellia', name: 'Han Solo' },
  ellen: { username: 'ellen', password: 'ellen', planet: 'Earth', name: 'Ellen Ripley' }
}

export function asUser(defaults, userKey) {
  const user = USERS[userKey]
  if (!user) throw new Error(`Unknown test user: ${userKey}`)
  defaults.auth = { username: user.username, password: user.password }
  return user
}

const formatUser = (user) => {
  return ({
    ...user.profile,
    ticket: user.ticket,
    id: user.id,
  })
}

const formatUsers = (users) => users.map(formatUser)

const formatFullUser = (user) => {
  return ({
    email: user.profile.email,
    group: {
      name: user?.profile?.group?.name,
      id: user?.profile?.group?.id,
    },
    faculty: {
      name: user?.profile?.group?.faculty?.name,
      id: user?.profile?.group?.faculty?.id,
    },
    university: {
      name: user?.profile?.group?.faculty?.university?.name,
      id: user?.profile?.group?.faculty?.university?.id,
    },
    first_name: user.profile.first_name,
    last_name: user.profile.last_name,
    createdAt: user.profile.createdAt,
    updatedAt: user.profile.updatedAt,
    imageUrl: user.profile.imageUrl,
    ticket: user.ticket,
    id: user.id
  })
}

module.exports = {
  formatUser,
  formatUsers,
  formatFullUser
}
import { BadgeName } from "src/badges/badge.entity";
import { User } from "src/users/user.entity";

export const generateUserWithStats = (user: User) => {
  return {
    ...user,
    stats: {
      games: user.userToGames.length,
      laughBadges: user.badges.filter(b => b.name === BadgeName.LAUGH).length,
      loveBadges: user.badges.filter(b => b.name === BadgeName.LOVE).length,
      sickBadges: user.badges.filter(b => b.name === BadgeName.SICK).length,
    }
  }
}
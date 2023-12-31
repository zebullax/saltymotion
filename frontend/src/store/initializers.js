/**
 * Build initial user profile
 * @param {Object} [overrideUserProfile]
 * @param {string} overrideUserProfile.ID
 * @param {string} overrideUserProfile.name
 * @param {string} overrideUserProfile.email
 * @param {string} overrideUserProfile.selfIntroduction
 * @param {Language[]} overrideUserProfile.languages
 * @param {string} overrideUserProfile.timezone
 * @param {string} overrideUserProfile.countryCode
 * @param {string} overrideUserProfile.registrationDate
 * @param {Wallet} overrideUserProfile.wallet
 * @param {number} overrideUserProfile.nbUnreadNotification
 * @param {UserPublicProfile[]} overrideUserProfile.favoriteReviewers
 * @param {Game[]} overrideUserProfile.favoriteGames
 * @param {SnsAccounts} overrideUserProfile.snsAccounts
 * @param {NotificationPreference} overrideUserProfile.notificationPreference
 * @param {boolean} overrideUserProfile.isOauth
 * @param {boolean} overrideUserProfile.isStripeAccountLinked
 * @param {string} overrideUserProfile.stripeCustomerID
 * @param {NormalizedGamePool} overrideUserProfile.gamePool
 * @param {Tag[]} overrideUserProfile.tags
 * @return {UserProfile}
 */

const buildInitialUserProfile = (overrideUserProfile) => ({
  ID: overrideUserProfile?.ID,
  name: overrideUserProfile?.name,
  email: overrideUserProfile?.email,
  selfIntroduction: overrideUserProfile?.selfIntroduction,
  languages: overrideUserProfile?.languages,
  timezone: overrideUserProfile?.timezone,
  countryCode: overrideUserProfile?.countryCode,
  registrationDate: overrideUserProfile?.registrationDate,
  wallet: overrideUserProfile?.wallet,
  nbUnreadNotification: overrideUserProfile?.nbUnreadNotification,
  favoriteReviewers: overrideUserProfile?.favoriteReviewers,
  favoriteGames: overrideUserProfile?.favoriteGames,
  snsAccounts: overrideUserProfile?.snsAccounts,
  notificationPreference: overrideUserProfile?.notificationPreference,
  isOauth: overrideUserProfile?.isOauth,
  isStripeAccountLinked: overrideUserProfile?.isStripeAccountLinked ?? false,
  stripeCustomerID: overrideUserProfile?.stripeCustomerID,
  gamePool: overrideUserProfile?.gamePool,
  tags: overrideUserProfile?.tags,
});

/**
 * Build initial notification state
 * @param {Object} override
 * @return {NotificationStore}
 */
const buildInitialNotificationsState = (override) => ({
  data: override?.notifications ?? [],
  loadingStatus: override?.isLoading ?? false,
  hasUnreadNotification: override?.hasUnreadNotification ?? false,
  hasMore: override?.hasMore ?? true,
});

/**
 * Build initial application state
 * @param {Object} [overrideApplicationState]
 * @return {ApplicationStore}
 */
const buildInitialApplicationState = (overrideApplicationState) => ({
  userProfileUpdateStatus: overrideApplicationState?.userProfileUpdateStatus ?? null,
  statusMessage: overrideApplicationState?.statusMessage ?? "",
  errorMessage: overrideApplicationState?.errorMessage ?? "",
  quickAccessWorkshopsLoadChunkStatus: overrideApplicationState?.quickAccessWorkshopsLoadChunkStatus,
  hasMoreQuickAccessWorkshops: overrideApplicationState?.hasMoreQuickAccessWorkshops ?? true,
  quickAccessWorkshops: overrideApplicationState?.quickAccessWorkshops ?? [],
  loginStatus: overrideApplicationState?.loginStatus,
  isVisitor: overrideApplicationState?.isVisitor ?? true,
  jwt: overrideApplicationState?.jwt ?? undefined,
  isDarkMode: overrideApplicationState?.isDarkMode ?? true,
});

export { buildInitialUserProfile, buildInitialApplicationState, buildInitialNotificationsState };

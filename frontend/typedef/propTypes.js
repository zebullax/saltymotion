/* eslint-disable react/forbid-prop-types */
import PropTypes from "prop-types";

const tagPropTypes = PropTypes.shape({
  ID: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
});
export { tagPropTypes };

const gamePropTypes = PropTypes.shape({
  ID: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  releaseYear: PropTypes.number.isRequired,
  editor: PropTypes.string.isRequired,
  introduction: PropTypes.string.isRequired,
});
export { gamePropTypes };

const gamePoolGamePropTypes = PropTypes.shape({
  ID: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  nbWorkshops: PropTypes.number,
  score: PropTypes.number,
  minimumBounty: PropTypes.number.isRequired,
});
gamePoolGamePropTypes.defaultProps = {
  score: 0,
  minimumBounty: 0,
};
export { gamePoolGamePropTypes };

const userPublicProfilePropTypes = PropTypes.shape({
  ID: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  selfIntroduction: PropTypes.string,
  registrationDate: PropTypes.string,
  countryCode: PropTypes.string.isRequired,
  timezone: PropTypes.string.isRequired,
  languages: PropTypes.arrayOf(
    PropTypes.shape({
      isoCode: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    }),
  ).isRequired,
  snsAccounts: PropTypes.shape({
    youtubeName: PropTypes.string.isRequired,
    twitchName: PropTypes.string.isRequired,
    twitterName: PropTypes.string.isRequired,
  }),
  tags: PropTypes.arrayOf(tagPropTypes),
  gamePool: PropTypes.arrayOf(gamePoolGamePropTypes),
});
export { userPublicProfilePropTypes };

// reviewer type is an alias for public profile
const reviewerProfilePropTypes = userPublicProfilePropTypes;
export { reviewerProfilePropTypes };

const gameStatisticsPropTypes = PropTypes.shape({
  nbWorkshops: PropTypes.number.isRequired,
  nbReviewers: PropTypes.number.isRequired,
});
export { gameStatisticsPropTypes };

const favoriteGamePropTypes = PropTypes.shape({
  ID: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  nbAtelier: PropTypes.number,
});
export { favoriteGamePropTypes };

const reviewStatePropTypes = PropTypes.shape({
  streamSourcesEnumerationStatus: PropTypes.string.isRequired,
  videoSources: PropTypes.array.isRequired,
  audioSources: PropTypes.array.isRequired,
  selectedAudioSource: PropTypes.object,
  selectedVideoSource: PropTypes.object,
  stream: PropTypes.object,
  isMediaAccepted: PropTypes.bool.isRequired,
});
export { reviewStatePropTypes };

const visitorProfilePropTypes = PropTypes.shape({});
const nonVisitorProfilePropTypes = PropTypes.shape({
  ID: PropTypes.string.isRequired,
  nickname: PropTypes.string.isRequired,
  stripeCustomerID: PropTypes.string,
  email: PropTypes.string.isRequired,
  selfIntroduction: PropTypes.string,
  registrationDate: PropTypes.string,
  countryCode: PropTypes.string.isRequired,
  timezone: PropTypes.string.isRequired,
  isOauth: PropTypes.bool.isRequired,
  nbUnreadNotification: PropTypes.number.isRequired,
  languages: PropTypes.arrayOf(
    PropTypes.shape({
      isoCode: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    }),
  ).isRequired,
  wallet: PropTypes.shape({
    redeemableCoin: PropTypes.number.isRequired,
    freeCoin: PropTypes.number.isRequired,
    frozenCoin: PropTypes.number.isRequired,
  }).isRequired,
  snsAccounts: PropTypes.shape({
    youtubeName: PropTypes.string.isRequired,
    twitchName: PropTypes.string.isRequired,
    twitterName: PropTypes.string.isRequired,
  }),
  favoriteGames: PropTypes.arrayOf(favoriteGamePropTypes).isRequired,
  favoriteReviewers: PropTypes.arrayOf(userPublicProfilePropTypes).isRequired,
  notificationPreference: PropTypes.shape({
    isNotifyOnReviewOpportunity: PropTypes.bool.isRequired,
    isNotifyOnReviewComplete: PropTypes.bool.isRequired,
    isNotifyOnNewComment: PropTypes.bool.isRequired,
    isNotifyOnFavoriteActivity: PropTypes.bool.isRequired,
  }).isRequired,
  tags: PropTypes.arrayOf(tagPropTypes),
  gamePool: PropTypes.arrayOf(gamePoolGamePropTypes),
});

const userProfilePropTypes = PropTypes.oneOfType([visitorProfilePropTypes, nonVisitorProfilePropTypes]);
export { userProfilePropTypes };

const shortWorkshopDescriptionPropTypes = PropTypes.shape({
  ID: PropTypes.number.isRequired,
  uploader: PropTypes.shape({
    ID: PropTypes.string.isRequired,
  }).isRequired,
  title: PropTypes.string.isRequired,
  creationTimestamp: PropTypes.string.isRequired,
  game: PropTypes.shape({
    ID: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
});
export { shortWorkshopDescriptionPropTypes };

const atelierPropTypes = PropTypes.shape({
  ID: PropTypes.number.isRequired,
  s3Key: PropTypes.string.isRequired,
  creationTimestamp: PropTypes.string.isRequired,
  game: PropTypes.shape({
    ID: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  stats: PropTypes.shape({
    nbViews: PropTypes.number.isRequired,
    score: PropTypes.number,
  }).isRequired,
  uploader: PropTypes.shape({
    ID: PropTypes.string.isRequired,
    nickname: PropTypes.string.isRequired,
  }).isRequired,
  reviewer: PropTypes.shape({
    ID: PropTypes.string,
    nickname: PropTypes.string,
  }),
  currentStatus: PropTypes.shape({
    ID: PropTypes.number.isRequired,
  }).isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  tags: PropTypes.arrayOf(
    PropTypes.shape({
      ID: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
    }),
  ),
  bounty: PropTypes.number,
  auctions: PropTypes.arrayOf(
    PropTypes.shape({
      ID: PropTypes.string.isRequired,
      nickname: PropTypes.string.isRequired,
      bounty: PropTypes.number.isRequired,
      timestamp: PropTypes.string.isRequired,
    }),
  ),
});
export { atelierPropTypes };

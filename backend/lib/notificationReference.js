
const notificationType = {
  status: {
    charge: {
      complete: 'CHARGE__SUCCESS',
      cancelled: 'CHARGE__CANCELLED',
    },
    atelier: {
      creation: {
        complete: 'ATELIER_CREATION_COMPLETE',
      },
    },
    auction: {
      askCandidate: 'AUCTION_ASK_CANDIDATE',
      cancelFromLastDecline: 'AUCTION_CANCEL_FROM_DECLINE', // Last candidate declined => the atelier is cancelled
    },
    user: {
      updateProfile: {
        complete: 'USER_PROFILE_UPDATE_COMPLETE',
      },
    },
    review: {
      uploadComplete: 'REVIEW_UPLOAD_COMPLETE',
      processComplete: 'REVIEW_SAVE_PROCESS_COMPLETE',
    },
    bounty: {
      receive: 'BOUNTY_RECEIVE',
    },
    comment: {
      creation: {
        complete: 'COMMENT_CREATION_COMPLETE',
      },
    },
  },
  error: {
    charge: {
      failure: 'CHARGE__FAILURE',
    },
    creationAtelier: { // FIXME whats with the French ?
      missingTag: 'ATELIER_CREATION_FAILURE_TAGS',
      insufficientFund: 'ATELIER_CREATION_FAILURE_INSUFFICIENT_FUND',
      uploadFailure: 'ATELIER_CREATION_FAILURE_VIDEO_UPLOAD',
      thumbnailFailure: 'ATELIER_CREATION_FAILURE_THUMB_CREATE',
      parameter: 'ATELIER_CREATION__FAILURE__PARAMETER',
      unknownError: 'ATELIER_CREATION_FAILURE_UNKNOWN_ERROR',
    },
    uploadReview: {
      unknownError: 'REVIEW_UPLOAD_FAILURE_UNKNOWN_ERROR',
      unknownFormat: 'REVIEW_UPLOAD_FAILURE_UNKNOWN_FORMAT',
      unauthorizedUser: 'REVIEW_UPLOAD_FAILURE_UNAUTHORIZED_USER',
    },
    user: {
      updateProfile: 'USER_PROFILE_UPDATE_UNKNOWN_ERROR',
    },
  },
};


module.exports.notificationType = notificationType;

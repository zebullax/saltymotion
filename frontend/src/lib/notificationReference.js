export const notificationType = {
  status: {
    charge: {
      complete: "CHARGE__SUCCESS",
      cancelled: "CHARGE__CANCELLED",
    },
    atelier: {
      creation: {
        complete: "ATELIER_CREATION_COMPLETE",
      },
    },
    auction: {
      askCandidate: "AUCTION_ASK_CANDIDATE",
      cancelFromLastDecline: "AUCTION_CANCEL_FROM_DECLINE", // Last candidate declined => the atelier is cancelled
    },
    user: {
      updateProfile: {
        complete: "USER_PROFILE_UPDATE_COMPLETE",
      },
    },
    review: {
      uploadComplete: "REVIEW_UPLOAD_COMPLETE",
      processComplete: "REVIEW_SAVE_PROCESS_COMPLETE",
    },
    bounty: {
      receive: "BOUNTY_RECEIVE",
    },
    comment: {
      creation: {
        complete: "COMMENT_CREATION_COMPLETE",
      },
    },
  },
  error: {
    charge: {
      failure: "CHARGE__FAILURE",
    },
    creationAtelier: {
      // FIXME whats with the French ?
      missingTag: "ATELIER_CREATION_FAILURE_TAGS",
      insufficientFund: "ATELIER_CREATION_FAILURE_INSUFFICIENT_FUND",
      uploadFailure: "ATELIER_CREATION_FAILURE_VIDEO_UPLOAD",
      thumbnailFailure: "ATELIER_CREATION_FAILURE_THUMB_CREATE",
      parameter: "ATELIER_CREATION__FAILURE__PARAMETER",
      unknownError: "ATELIER_CREATION_FAILURE_UNKNOWN_ERROR",
    },
    uploadReview: {
      unknownError: "REVIEW_UPLOAD_FAILURE_UNKNOWN_ERROR",
      unknownFormat: "REVIEW_UPLOAD_FAILURE_UNKNOWN_FORMAT",
      unauthorizedUser: "REVIEW_UPLOAD_FAILURE_UNAUTHORIZED_USER",
    },
    user: {
      updateProfile: "USER_PROFILE_UPDATE_UNKNOWN_ERROR",
    },
  },
};

/**
 * Translate a server notification to a helper text for display to user in a snack
 * @param {string} type
 * @return {string}
 */
export const notificationTypeToText = (type) => {
  switch (type) {
    case notificationType.status.atelier.creation.complete:
      return "Atelier successfully created ";
    case notificationType.status.auction.cancelFromLastDecline:
      return "Atelier declined by last reviewer... Cancelling";
    case notificationType.status.user.updateProfile.complete:
      return "Profile successfully updated";
    case notificationType.status.comment.creation.complete:
      return "Comment successfully posted";
    case notificationType.status.review.uploadComplete:
      return "Review video is being processed by our server";
    case notificationType.status.review.processComplete:
      return "Review video successfully processed!";
    case notificationType.status.charge.complete:
      return "Coins successfully looted";
    case notificationType.error.creationAtelier.missingTag:
      return "You should add at least one tag";
    case notificationType.error.creationAtelier.insufficientFund:
      return "You don't have enough free coins to fund that auction";
    case notificationType.error.creationAtelier.uploadFailure:
      return "Error while uploading files...";
    case notificationType.error.creationAtelier.unknownError:
      return "Unknown error while creating the atelier...";
    case notificationType.error.creationAtelier.parameter:
      return "Issue with parameters while processing atelier creation";
    case notificationType.error.user.updateProfile:
      return "Unknown error while updating your profile...";
    case notificationType.error.charge.failure:
      return "An error happened while processing payment hook";
    default:
      return "";
  }
};

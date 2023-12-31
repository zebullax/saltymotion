const userType = {
  'application': 0,
  'user': 1,
};

const activityRefID = {
  'createAtelier': 1,
  'acceptReview': 2,
  'declineReview': 3,
  'addAuction': 4,
  'removeAuction': 5,
  'updateAuction': 6,
  'postReview': 7,
  'transferBounty': 8,
  'commentAtelier': 9,
  'assignReview': 10,
  'cancelAtelier': 11,
  'buyCash': 12,
};

module.exports.userType = userType;
module.exports.activityRefID = activityRefID;

/**
 * Build an activity description
 * @return {ActivityDescription}
 */
module.exports.buildActivityFilter = () => ({
  sourceActor: {
    typeID: undefined,
    userID: undefined,
  },
  /**
   * Set Source Actor
   * @param {number} typeID
   * @param {number} userID
   * @return {ActivityDescription}
   */
  setSourceActor(typeID, userID) {
    this.sourceActor.typeID = typeID;
    this.sourceActor.userID = userID;
    return this;
  },
  targetActor: {
    typeID: undefined,
    userID: undefined,
  },
  /**
   * Set Target Actor
   * @param {number} typeID
   * @param {number} userID
   * @return {ActivityDescription}
   */
  setTargetActor(typeID, userID) {
    this.targetActor.typeID = typeID;
    this.targetActor.userID = userID;
    return this;
  },
  activityRefID: undefined,
  /**
   * Set Activity ref ID
   * @param {number} activityRefID
   * @return {ActivityDescription}
   */
  setActivityRefID(activityRefID) {
    this.activityRefID = activityRefID;
    return this;
  },
  linkedID: undefined,
  /**
   * Set linked ID
   * @param {number} linkedID
   * @return {ActivityDescription}
   */
  setLinkedID(linkedID) {
    this.linkedID = linkedID;
    return this;
  },
  timestamp: undefined,
  /**
   * Set timestamp
   * @param {Date} timestamp
   * @return {ActivityDescription}
   */
  setTimestamp(timestamp) {
    this.timestamp = timestamp;
    return this;
  },
});

/**
 * Build the text summary for an activity
 * @param {NormalizedActivity} normalizedDescription
 * @return {{summary: string, href: string}}
 */
module.exports.buildActivitySummary = (normalizedDescription) => {
  const fromName = normalizedDescription.sourceActor.user.name;
  switch (normalizedDescription.activityRef.ID) {
    case activityRefID.updateAuction: return {
      summary: `${fromName} updated his auction`,
      href: `/workshop/${normalizedDescription.linkedID}`,
    };
    case activityRefID.removeAuction: return {
      summary: `${fromName} removed his auction`,
      href: `/workshop/${normalizedDescription.linkedID}`,
    };
    case activityRefID.addAuction: return {
      summary: `${fromName} created an auction`,
      href: `/workshop/${normalizedDescription.linkedID}`,
    };
    case activityRefID.acceptReview: return {
      summary: `${fromName} accepted to review your atelier`,
      href: `/workshop/${normalizedDescription.linkedID}`,
    };
    case activityRefID.assignReview: return {
      summary: `${fromName} assigned an atelier to you`,
      href: `/workshop/${normalizedDescription.linkedID}`,
    };
    case activityRefID.declineReview: return {
      summary: `${fromName} declined to review your atelier`,
      href: `/workshop/${normalizedDescription.linkedID}`,
    };
    case activityRefID.commentAtelier: return {
      summary: `${fromName} left a message on your atelier`,
      href: `/workshop/${normalizedDescription.linkedID}`,
    };
    case activityRefID.postReview: return {
      summary: `${fromName} completed the review of your atelier`,
      href: `/workshop/${normalizedDescription.linkedID}`,
    };
    case activityRefID.transferBounty: return {
      summary: `${fromName} sent the bounty for your review`,
      href: `/workshop/${normalizedDescription.linkedID}`,
    };
    default: return {};
  }
};

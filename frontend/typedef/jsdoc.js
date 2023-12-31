/**
 * @typedef {Object} AtelierHistoryEvent
 * @type {Object}
 * @property {number} statusID - Event type ID
 * @property {Date} timestamp - Timestamp of the atelier history event
 * @property {string} metadata - blob of data associated with that event
 */

/**
 * @typedef Action
 * @type {string} type
 * @type {any} payload
 */

/**
 * @typedef {Object} AtelierStatus
 * Mapping between atelier status and their description as should be mirrored in atelierStatusRef
 * @type {{Created: number
, Auction: number
, Assigned: number
, InProgress: number
, Complete: number
, Cancelled: number
, ErrorOnUpload: number
, ErrorOnStreamCross: number
, ErrorOnAccept: number
, ErrorUnknown: number}}
 */

/**
 * @typedef WalletActivityType
 * @readonly
 * @type {{charge: string, outgoingBounty: string}}
 */

/**
 * @typedef {Object} Charge
 * @property {Date} date
 * @property {string} status
 * @property {WalletActivityType} type
 * @property {number} amount
 * @property {string} failureMsg
 * @property {string} url
 */

/**
 * @typedef {Object} OutgoingBounty
 * @property {Date} date
 * @property {number} amount
 * @property {WalletActivityType} type
 * @property {{ID: number, name: string}} reviewer
 * @property {{ID: number}} atelier
 */

/**
 * @typedef {Object} WalletHistory
 * @property {Charge[]} charges
 * @property {OutgoingBounty[]} outgoingBounties
 */

/**
 * @typedef {Object} Tag
 * @property {number} ID - Tag ID
 * @property {string} name - Tag description
 */

/**
 * @typedef {Object} Auction
 * Candidate reviewer auction information
 * @property {number} ID - Candidate user ID
 * @property {string} nickname - Candidate username
 * @property {Date} timestamp - Offer timestamp
 * @property {number} bounty - Auction candidate bounty
 * @property {boolean} isCandidateReviewer -
 * @property {boolean} isAcceptedReviewer -
 */

/**
 * @typedef {Object} Uploader
 * Uploader synthetic description
 * @property {string} ID -
 * @property {string} name -
 */

/**
 * @typedef {Object} AtelierStatus
 * Atelier Status
 * @property {number} ID -
 * @property {string} description -
 */

/**
 * @typedef {Object} Game
 * @property {number} ID
 * @property {string} name
 * @property {number} releaseYear
 * @property {string} editor
 * @property {string} introduction
 */

/**
 * @typedef {Object} GameStatistics
 * @property {number} ID
 * @property {number} nbWorkshops
 * @property {number} nbReviewers
 */

/**
 * @typedef {Object} AtelierStat
 * Atelier statistics
 * @property {number} score -
 * @property {number} nbViews -
 */

/**
 * @typedef {Object} AtelierDescription
 * Atelier synthetic description
 * @property {number} ID - ID
 * @property {string} title - atelier video original file name
 * @property {string} s3Key - AWS S3 hash for content
 * @property {Game} game
 * @property {Reviewer} reviewer
 * @property {Uploader} uploader
 * @property {number} bounty
 * @property {[Auction]} auctions -
 * @property {boolean} isUpdated - True if the atelier received an update since its last view by uploader
 * @property {boolean} isPrivate - True if the atelier is private, false if it is public
 * @property {AtelierStat} stats -
 * @property {Date} creationTimestamp - Creation timestamp
 * @property {AtelierStatus} currentStatus -
 */

/**
 * @typedef {Object} AtelierCurrentStatus
 * Current status of the atelier
 * @property {number} ID - Atelier ID
 * @property {number} status - Status ID
 */

/**
 * @typedef {Object} ReviewerStat
 * Popularity statistics for a reviewer
 * @property {number} nbThumbsUp - Atelier ID
 * @property {number} nbReviewed - Status ID
 */

/**
 * @typedef {Object.<string, TimelineEvent>} AtelierTimeline
 */

/**
 * @typedef {Object} TimelineEvent
 * @property {string} metadata -
 * @property {Object} agent -
 * @property {string} agent.nickname -
 * @property {number} agent.ID -
 * @property {number} statusID -
 * @property {Date} timestamp -
 */

/**
 * @typedef {Object} AtelierHistory
 * @property {[Date]} InAuction -
 * @property {[Date]} Created -
 * @property {[Date]} InProgress -
 * @property {[Date]} Complete -
 * @property {AtelierTimeline} timeline -
 */

/**
 * @typedef {Object} Actor
 * @property {number} typeID - Actor type ID
 * @property {number} userID - If the actor type is an user, this tracks its ID
 */

/**
 * @typedef {Object} ActivityDescription
 * @property {Actor} sourceActor
 * @property {Actor} targetActor
 * @property {number} activityRefID
 * @property {number} linkedID
 * @property {Date} timestamp
 * @property {function(number, number)} setSourceActor -
 * @property {function(number, number)} setTargetActor -
 * @property {function(number)} setActivityRefID
 * @property {function(number)} setLinkedID
 * @property {function(Date)} setTimestamp
 */

/**
 * @typedef {Object} ChargeDescriptionRedirectURL
 * @property {string} success
 * @property {string} cancel
 */

/**
 * @typedef {Object} ChargeDescription
 * @property {string} name
 * @property {string} description
 * @property {string} currency
 * @property {string} imageURL
 * @property {number} qty
 * @property {number} amount
 * @property {number} customerID
 * @property {number} saltymotionUserID
 * @property {string} saltymotionUserEmail
 * @property {ChargeDescriptionRedirectURL} redirectURL
 * @property {function(string) : ChargeDescription} setName
 * @property {function(string) : ChargeDescription} setDescription
 * @property {function(string) : ChargeDescription} setCurrency
 * @property {function(string) : ChargeDescription} setImageURL
 * @property {function(number) : ChargeDescription} setQty
 * @property {function(number) : ChargeDescription} setAmount
 * @property {function(number) : ChargeDescription} setSaltymotionUserID
 * @property {function(number) : ChargeDescription} setCustomerID
 * @property {function(string) : ChargeDescription} setSaltymotionEmail
 * @property {function(ChargeDescriptionRedirectURL) : ChargeDescription} setRedirectURL
 */

/**
 * @typedef {Object} RawActivity
 * @property {number} activityID
 * @property {string} activityName
 * @property {number} linkedID
 * @property {number} sourceTypeID
 * @property {number} sourceUserID
 * @property {string} sourceUserNickname
 * @property {number} targetTypeID
 * @property {number} targetUserID
 * @property {string} targetUserNickname
 * @property {Date} timestamp - activity timestamp
 * @property {?Date} lastObserved - if not null, the last time the notification was observed by client
 */

/**
 * @typedef {Object} ActivityActor
 * @property {number} typeID
 * @property {Object|undefined} user
 * @property {number} user.ID
 * @property {string} user.nickname
 */

/**
 * @typedef {Object} ActivityReference
 * @property {number} ID
 * @property {string} name
 */

/**
 * @typedef {Object} NormalizedActivity
 * @property {ActivityReference} activityRef
 * @property {number} linkedID
 * @property {string} href
 * @property {string} summary - Short text representation of the activity
 * @property {ActivityActor} sourceActor
 * @property {ActivityActor} targetActor
 * @property {Date} timestamp
 */

/**
 * @typedef {Object} NormalizedGamePool
 * @property {number} ID
 * @property {string} name
 * @property {(number|undefined)} avgScore
 * @property {number} nbReview
 * @property {number} minimumBounty
 */

/**
 * @typedef {Object} Language
 * @property {number} isoCode
 * @property {number} name
 */

/**
 * @typedef {Object} SnsAccounts
 * @property {string} youtubeName
 * @property {string} twitchName
 * @property {string} twitterName
 */

/**
 * @typedef {Object} Reviewer
 * @property {string} ID
 * @property {string} name
 * @property {string} selfIntroduction
 * @property {Language[]} languages
 * @property {string} timezone
 * @property {string} countryCode
 * @property {Date} registrationDate
 * @property {snsAccounts} snsAccounts
 * @property {NormalizedGamePool[]} gamePool
 */

/**
 * @typedef {Object} NormalizedAtelierDescription
 * @property {number} ID
 * @property {string} s3Key
 * @property {string} title
 * @property {string} description
 * @property {Object} game
 * @property {number} game.ID
 * @property {string} game.name
 * @property {Uploader} uploader
 * @property {Reviewer} reviewer
 * @property {number} bounty
 * @property {Object[]} auctions
 * @property {Tag[]} tags
 * @property {boolean} isPrivate
 * @property {Object} stats
 * @property {number} stats.score
 * @property {number} stats.nbViews
 * @property {Date} creationTimestamp
 * @property {Object} currentStatus
 * @property {number} currentStatus.ID
 * @property {string} currentStatus.description
 */

/**
 * @typedef {Object} Wallet
 * @property {number} redeemableCoin
 * @property {number} freeCoin
 * @property {number} frozenCoin
 *
 */

/**
 * @typedef {Object} NotificationPreference
 * @property {boolean} isNotifyOnReviewOpportunity
 * @property {boolean} isNotifyOnReviewComplete
 * @property {boolean} isNotifyOnNewComment
 * @property {boolean} isNotifyOnFavoriteActivity
 *
 */

/**
 * @typedef {Object} ReviewerGame
 * @property {number} ID
 * @property {string} name
 * @property {number} score
 * @property {number} nbWorkshops
 * @property {number} minimumBounty
 */

/**
 * @typedef {Object} UserProfile
 * @property {string} ID
 * @property {string} name
 * @property {string} email
 * @property {string} selfIntroduction
 * @property {Language[]} languages
 * @property {string} timezone
 * @property {string} countryCode
 * @property {string} stripeCustomerID
 * @property {string} [stripeAccountID]
 * @property {string} registrationDate
 * @property {Wallet} wallet
 * @property {number} nbUnreadNotification
 * @property {Reviewer[]} favoriteReviewers
 * @property {Game[]} favoriteGames
 * @property {SnsAccounts} snsAccounts
 * @property {NotificationPreference} notificationPreference
 * @property {ReviewerGame} gamePool
 * @property {boolean} isStripeAccountLinked
 * @property {boolean} isOauth
 * @property {Tag[]} tags
 */

/**
 * @typedef {Object} UserPublicProfile
 * @property {string} ID
 * @property {string} name
 * @property {string} selfIntroduction
 * @property {Language[]} languages
 * @property {string} timezone
 * @property {string} countryCode
 * @property {string} registrationDate
 * @property {SnsAccounts} snsAccounts
 * @property {ReviewerGame} gamePool
 */

/**
 * @typedef {object} JWT
 * @property {string} raw
 * @property {object} header
 * @property {object} payload
 * @property {string} payload.ID
 */

/**
 * @typedef {Object} Review
 * @property {number} ID
 * @property {string} creationTimestamp
 * @property {string} title
 * @property {string} s3Key
 * @property {Object} uploader
 * @property {number} uploader.ID
 * @property {string} uploader.nickname
 * @property {Object} reviewer
 * @property {number} reviewer.ID
 * @property {string} reviewer.nickname
 */

/**
 * @typedef ShortWorkshopDescription
 * @property {number} ID
 * @property {object} uploader
 * @property {number} uploader.ID
 * @property {object} game
 * @property {number} game.ID
 * @property {string} game.name
 * @property {string} creationTimestamp
 * @property {string} title
 */

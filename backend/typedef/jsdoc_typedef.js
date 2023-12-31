/**
 * @typedef {Object} AtelierHistoryEvent
 * @type {Object}
 * @property {number} statusID - Event type ID
 * @property {Date} timestamp - Timestamp of the atelier history event
 * @property {string} metadata - blob of data associated with that event
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
 * @typedef {Object} AcceptCancelModalElementID
 * @type {Object}
 * @property {string} mainForm - Modal form main ID
 * @property {string} acceptButton - Accept button ID
 * @property {string} cancelButton - Cancel Button ID
 */

/**
 * @typedef {Object} Tag
 * @property {number} ID - Tag ID
 * @property {string} name - Tag description
 */

/**
 * @typedef {Object} AtelierDescriptionCurrentStatus
 * Current status of the atelier as returned in atelier description
 * @property {number} ID - Status ID
 * @property {string} Description - Status Description
 */

/**
 * @typedef {Object} Auction
 * Candidate reviewer auction information
 * @property {string} ID - Candidate user ID
 * @property {string} nickname - Candidate username
 * @property {Date} timestamp - Offer timestamp
 * @property {number} bounty - Auction candidate bounty
 * @property {boolean} isCandidateReviewer -
 * @property {boolean} isAcceptedReviewer -
 */

/**
 * Uploader synthetic description
 * @typedef {Object} Uploader
 * @property {string} ID -
 * @property {string} name -
*/

/**
 * Atelier Status
 * @typedef {Object} AtelierStatus
 * @property {number} ID -
 * @property {string} description -
*/

/**
 * @typedef {Object} Game
 * @property {number} ID
 * @property {number} releaseYear
 * @property {string} name
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
 * @property {string} reviewerNickname
 * @property {number} reviewerID
 * @property {string} uploaderNickname
 * @property {number} uploaderID
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
 * @typedef {Object} UserQueryFilters
 * @property {string} name -
 * @property {string} nameHint -
 * @property {string} userID -
 * @property {string} stripeAccountID -
 * @property {string} stripeCustomerID -
 */

/**
 * @typedef {Object} UserQueryTweaker
 * @property {boolean} keepPrivateFields -
 * @property {boolean} getLanguageFields -
 * @property {boolean} getSnsAccounts -
 * @property {boolean} isMinimumQuery -
 */

/**
 * @typedef {Object} buildUserQueryParameter
 * @property {UserQueryFilters} filter -
 * @property {UserQueryTweaker} tweaker -
 * @property {function(string) : buildUserQueryParameter} setFullName -
 * @property {function(string) : buildUserQueryParameter} setHintName -
 * @property {function(string|string[]) : buildUserQueryParameter} setUserID -
 * @property {function(string) : buildUserQueryParameter} setStripeAccountID -
 * @property {function(string) : buildUserQueryParameter} setStripeCustomerID -
 * @property {function(boolean) : buildUserQueryParameter} setKeepPrivateFields -
 * @property {function(boolean) : buildUserQueryParameter} setSnsAccountsSelected -
 * @property {function(boolean) : buildUserQueryParameter} setGetLanguageFields -
 * @property {function(boolean) : buildUserQueryParameter} setIsMinimumQuery -
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
 * @property {string} userID - If the actor type is an user, this tracks its ID
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
 * @typedef {Object} GameQueryParameter
 * @property {Object} filter
 * @property {number[]} filter.gameID
 * @property {number[]} filter.tagID
 * @property {number[]} filter.excludingGameID
 * @property {string} filter.name
 * @property {string} filter.nameHint
 * @property {Object} tweaker
 * @property {boolean} tweaker.isNbAtelierIncluded
 * @property {Object} sort
 * @property {string} sort.field
 * @property {boolean} sort.isAsc
 * @property {function(fieldName: string, isAsc: boolean) : GameQueryParameter} setSort
 * @property {function(string) : GameQueryParameter} setNameHint
 * @property {function(string) : GameQueryParameter} setName
 * @property {function(boolean) : GameQueryParameter} setIsNbAtelierIncluded
 * @property {function(number[]) : GameQueryParameter} setGameID
 * @property {function(number[]) : GameQueryParameter} setExcludingGameID
 * @property {function(number[]) : GameQueryParameter} setTagID
 */

/**
 * @typedef {Object} AtelierQueryFilter
 * @property {(string|undefined)} title -
 * @property {(string|undefined)} titleHint -
 * @property {(number|undefined)} reviewerID -
 * @property {(number|undefined)} candidateReviewerID -
 * @property {(number|undefined)} uploaderID -
 * @property {(number|undefined)} atelierID -
 * @property {(number|undefined)} tagID -
 */

/**
 * @typedef {Object} AtelierQueryTweaker
 * @property {boolean} isPrivateFilteredOut - If set returns only the public atelier
 * @property {boolean} isTagFilteredOut - If set atelier tags wont be retrieved
 * @property {boolean} isNbRowIncluded - If set, returns the nb of rows satisfying this filter
 * @property {boolean} isIdOnly - If set returned only the ID of the selected atelier
 * @property {boolean} isCandidateReviewIncluded - If set the reviewerID will also be used to get candidate reviews
 * @property {number} requestUserID - userID doing this request, useful to get even private atelier from uploader
 */

/**
 * @typedef {Object} QuerySortField
 * @property {string} field -
 * @property {boolean} isAsc -
 */

/**
 * @typedef {Object} AtelierQueryParameter
 * @property {AtelierQueryFilter} filter -
 * @property {AtelierQueryTweaker} tweaker -
 * @property {QuerySortField} sort -
 * @property {function(string) : AtelierQueryParameter} setTitleHint -
 * @property {function(number) : AtelierQueryParameter} setUploaderID -
 * @property {function(number) : AtelierQueryParameter} setTagID -
 * @property {function(string) : AtelierQueryParameter} setReviewerID -
 * @property {function(string) : AtelierQueryParameter} setCandidateReviewerID -
 * @property {function(number) : AtelierQueryParameter} setGameID -
 * @property {function(number) : AtelierQueryParameter} setAtelierID -
 * @property {function(boolean) : AtelierQueryParameter} setIsNbRowIncluded -
 * @property {function(boolean) : AtelierQueryParameter} setIncludeCandidateReview -
 * @property {function(boolean) : AtelierQueryParameter} setIdOnly -
 * @property {function(string) : AtelierQueryParameter} setTitle -
 * @property {function(number) : AtelierQueryParameter} setCurrentStatus -
 * @property {function(boolean) : AtelierQueryParameter} setFilterPrivate -
 * @property {function(number) : AtelierQueryParameter} setRequestUserID -
 * @property {function(boolean) : AtelierQueryParameter} setFilterTag -
 * @property {function(string, boolean) : AtelierQueryParameter} setSorting -
 */

/**
 * @typedef {Object} NotificationQueryFilter
 * @property {string} sourceUserID
 * @property {string} targetUserID
 * @property {string} startFrom
 * @property {number} activityRefID
 * @property {number|number[]} linkedID
 */

/**
 * @typedef {Object} NotificationQueryTweaker
 * @property {boolean} isActiveOnly
 * @property {boolean} isTransitiveOnly
 * @property {boolean} isIntransitiveOnly
 * @property {boolean} isCountOnly
 * @property {boolean} isIdOnly - If set returned only the ID of the activity
 */

/**
 * @typedef {Object} NotificationQueryParameter
 * @property {NotificationQueryFilter} filter
 * @property {NotificationQueryTweaker} tweaker
 * @property {QuerySortField} sort
 * @property {function(string) : NotificationQueryParameter} setTargetUserID
 * @property {function(string) : NotificationQueryParameter} setSourceUserID
 * @property {function(boolean) : NotificationQueryParameter} setIsActiveOnly
 * @property {function(boolean) : NotificationQueryParameter} setStartFrom
 * @property {function(boolean) : NotificationQueryParameter} setIsCountOnly
 * @property {function(boolean) : NotificationQueryParameter} setIsIDOnly
 * @property {function(number|number[]) : NotificationQueryParameter} setActivityID
 * @property {function(boolean) : NotificationQueryParameter} setIsIntransitiveOnly
 * @property {function(number|number[]) : NotificationQueryParameter} setLinkedID
 * @property {function(boolean) : NotificationQueryParameter} setIsTransitiveOnly
 * @property {function(number, boolean) : NotificationQueryParameter} setSortField
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
 * @property {string} customerID
 * @property {string} saltymotionUserID
 * @property {string} saltymotionUserEmail
 * @property {ChargeDescriptionRedirectURL} redirectURL
 * @property {function(string) : ChargeDescription} setName
 * @property {function(string) : ChargeDescription} setDescription
 * @property {function(string) : ChargeDescription} setCurrency
 * @property {function(string) : ChargeDescription} setImageURL
 * @property {function(number) : ChargeDescription} setQty
 * @property {function(number) : ChargeDescription} setAmount
 * @property {function(string) : ChargeDescription} setSaltymotionUserID
 * @property {function(string) : ChargeDescription} setCustomerID
 * @property {function(string) : ChargeDescription} setSaltymotionEmail
 * @property {function(ChargeDescriptionRedirectURL) : ChargeDescription} setRedirectURL
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
 * @typedef {Object} RawActivity
 * @property {number} activityID
 * @property {string} activityName
 * @property {number} linkedID
 * @property {number} sourceTypeID
 * @property {string} sourceUserID
 * @property {string} sourceUserNickname
 * @property {number} targetTypeID
 * @property {string} targetUserID
 * @property {string} targetUserNickname
 * @property {Date} timestamp - activity timestamp
 * @property {?Date} lastObserved - if not null, the last time the notification was observed by client
 */

/**
 * @typedef {Object} ActivityActor
 * @property {number} typeID
 * @property {Object|undefined} user
 * @property {string} user.ID
 * @property {string} user.name
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
 * @typedef {Object} ReviewerGame
 * @property {number} ID
 * @property {string} name
 * @property {number} score
 * @property {number} nbWorkshops
 * @property {number} minimumBounty
 */

/**
 * @typedef {Object} Language
 * @property {number} isoCode
 * @property {string} name
 */

/**
 * @typedef {Object} SnsAccounts
 * @property {string} youtubeName
 * @property {string} twitchName
 * @property {string} twitterName
 */


/**
 * @typedef {Object} NormalizedAtelierDescription
 * @property {number} ID
 * @property {string} s3Key
 * @property {string} title
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
 * @typedef {Object} Reviewer
 * @property {string} ID
 * @property {string} name
 * @property {string} selfIntroduction
 * @property {Language[]} languages
 * @property {string} timezone
 * @property {string} countryCode
 * @property {Date} registrationDate
 * @property {snsAccounts} snsAccounts
 * @property {ReviewerGame[]} gamePool
 */

/**
 * @typedef {Object} UserProfile
 * @property {string} ID
 * @property {string} name
 * @property {string} email
 * @property {string} selfIntroduction
 * @property {string} stripeCustomerID
 * @property {Language[]} languages
 * @property {string} timezone
 * @property {string} countryCode
 * @property {Date} registrationDate
 * @property {Wallet} wallet
 * @property {number} nbUnreadNotification
 * @property {Reviewer[]} favoriteReviewers
 * @property {{ID: number, name: string}[]} favoriteGames
 * @property {SnsAccounts} snsAccounts
 * @property {boolean} isOauth
 * @property {ReviewerGame[]} gamePool
 * @property {boolean} isStripeAccountLinked
 */

/**
 * @typedef ShortWorkshopDescription
 * @property {object} uploader
 * @property {number} uploader.ID
 * @property {object} game
 * @property {number} game.ID
 * @property {string} game.name
 * @property {Date} creationTimestamp
 * @property {number} ID
 * @property {string} title
 */

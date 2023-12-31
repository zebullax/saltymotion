
// Browse related constants
module.exports.GAME_CATEGORY_LABEL = 'GAME';
module.exports.REVIEWER_CATEGORY_LABEL = 'REVIEWER';
module.exports.CANDIDATE_CATEGORY_LABEL = 'CANDIDATE';
module.exports.USER_CATEGORY_LABEL = 'USER'; // Both reviewer and uploader
module.exports.UPLOADER_CATEGORY_LABEL = 'UPLOADER';
module.exports.TAG_CATEGORY_LABEL = 'TAG';
module.exports.ATELIER_CATEGORY_LABEL = 'ATELIER';
module.exports.EXPLORE_CATEGORY_LABEL = 'EXPLORE';
module.exports.USER_CATEGORY_LABEL = 'USER';

// Redirection URL
module.exports.REDIRECT_URL_AFTER_CASH_BUY = '/';
module.exports.REDIRECT_URL_AFTER_LOGIN_SUCCESS = '/';
module.exports.REDIRECT_URL_AFTER_LOGIN_FAIL = '/login';
module.exports.REDIRECT_URL_AFTER_UNAUTH_ACCESS = '/login';

// top page features
module.exports.FEATURED_REVIEWS_FROM_FAVORITE_LIMIT = 4;
// Limits on some query
module.exports.MAX_SHOWCASE_ATELIER_PER_PAGE = 8; // Maximum nb of atelier thumbnails on paginated containers
module.exports.MAX_SHOWCASE_TOP_REVIEWERS = 3;
module.exports.MAX_SEARCH_RESULT_PER_PAGE = 15;
module.exports.MAX_LAST_NOTIFICATION_LOADED = 10;
module.exports.BROWSE_REVIEWER_INITIAL_LOAD_CHUNK_SIZE = 24;
module.exports.BROWSE_GAME_INITIAL_LOAD_CHUNK_SIZE = 24;
// Password
module.exports.SALT_ROUNDS = 10;
module.exports.MINIMUM_PASSWORD_LENGTH = 8;
// Comment length max used to send excerpt with email
module.exports.MAX_EXCERPT_LENGTH = 50;

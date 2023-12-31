export const AUTO_COMPLETION_THRESHOLD = 3;
export const MAX_CANDIDATE_REVIEWERS = 3;
export const DEFAULT_LOAD_CHUNK_SIZE = 20;
export const DEFAULT_LOAD_NOTIFICATION_SIZE = 10;
export const ATELIER_LIST_LOAD_CHUNK_SIZE = 24;
export const RECOMMENDATION_LOAD_CHUNK_SIZE = 10;
export const STRIPE_PK_KEY = IS_PROD
  ? "pk_live_izHrAM6htXBeRPpCLFLZTnfj005HVjErE5"
  : "pk_test_ANL7q83ImZlKsQ0tI8gK7ddu00wSISpcyB";
export const MAXIMUM_NB_GAMES_REVIEWABLE_POOL = 6;

// Browse related constants
export const GAME_CATEGORY_LABEL = "GAME";
export const REVIEWER_CATEGORY_LABEL = "REVIEWER";
export const UPLOADER_CATEGORY_LABEL = "UPLOADER";
export const USER_CATEGORY_LABEL = "USER"; // Both reviewer and uploader
export const TAG_CATEGORY_LABEL = "TAG";

// Limits on some query
export const MAX_SHOWCASE_ATELIER_PER_PAGE = 8; // Maximum nb of atelier thumbnails on paginated containers
export const REVIEWER_SAMPLE_COUNT = 10;
export const GAME_SAMPLE_COUNT = 10;
export const TOP_PAGE__MAX_GAME_DISPLAYED = 8;
export const TOP_PAGE__MAX_REVIEWERS_DISPLAYED = 8;
export const VISITORS__REVIEWERS__SAMPLE_SIZE = 3;
export const BROWSE_REVIEWER_INITIAL_LOAD_CHUNK_SIZE = 24;
export const BROWSE_GAME_INITIAL_LOAD_CHUNK_SIZE = 24;
export const MINIMUM_PASSWORD_LENGTH = 8;
export const WORKSHOP_LOAD_CHUNK_SIZE = 12;

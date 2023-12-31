// React
import React from "react";
import { Route, Switch } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
// Saltymotion
import ErrorPageContainer from "../errorPage/ErrorPageContainer";
import BrowseGamePageContainer from "../browsePage/browseGamePageContainer";
import BrowseReviewerPageContainer from "../browsePage/browseReviewerPageContainer";
import ReviewerPageLoader from "../reviewerPage/reviewerPageLoader";
import TagPageLoader from "../tagPage/tagPageLoader";
import AtelierListContainer from "../workshopListPage/atelierListContainer";
import ProfilePageContainer from "../userProfilePage/profilePageContainer";
import AboutPageContainer from "../aboutPage/aboutPageContainer";
import TopPageContainer from "../topPage/topPageContainer";
import AtelierPageLoader from "../workshopViewPage/workshopViewPageLoader";
import GamePageLoader from "../gamePage/gamePageLoader";
import CreateWorkshopPageLoader from "../workshopCreatePage/createWorkshopPageLoader";

/**
 * Application private routes
 * @return {JSX.Element}
 * @constructor
 */
function ApplicationRoutes() {
  return (
    <main>
      <ErrorBoundary FallbackComponent={ErrorPageContainer}>
        <Switch>
          <Route path="/browse/game">
            <BrowseGamePageContainer />
          </Route>
          <Route path="/browse/reviewer">
            <BrowseReviewerPageContainer />
          </Route>
          <Route path="/reviewer/:ID">
            <ReviewerPageLoader />
          </Route>
          <Route path="/game/:ID">
            <GamePageLoader />
          </Route>
          <Route path="/tag/:ID">
            <TagPageLoader />
          </Route>
          <Route path="/workshop/create">
            <CreateWorkshopPageLoader />
          </Route>
          <Route exact path="/workshop">
            <AtelierListContainer />
          </Route>
          <Route exact path="/workshop/:ID">
            <AtelierPageLoader />
          </Route>
          <Route path="/profile/:category">
            <ProfilePageContainer />
          </Route>
          <Route exact path="/about/use">
            <AboutPageContainer selectedTabIndex={0} />
          </Route>
          <Route exact path="/about/privacy">
            <AboutPageContainer selectedTabIndex={1} />
          </Route>
          <Route exact path="/about/us">
            <AboutPageContainer selectedTabIndex={2} />
          </Route>
          <Route exact path="/error">
            <ErrorPageContainer />
          </Route>
          <Route path="/">
            <TopPageContainer />
          </Route>
        </Switch>
      </ErrorBoundary>
    </main>
  );
}
export default ApplicationRoutes;

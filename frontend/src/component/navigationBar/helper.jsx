// React
import React from "react";
// MUI
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
// Saltymotion
import { makeS3Link, s3LinkCategory } from "../../lib/utility";
import { ListItemLink, WorkshopListItemLink } from "./navLinkItem";

const reviewersQuickAccessSection = (favorites) => {
  if (favorites.length === 0) {
    return (
      <ListItem alignItems="flex-start">
        <ListItemText
          inset
          primaryTypographyProps={{ variant: "subtitle2", color: "textSecondary" }}
          primary="Empty..."
        />
      </ListItem>
    );
  }
  return favorites.map((reviewer) => (
    <ListItemLink
      primary={reviewer.name}
      key={reviewer.ID}
      to={`/reviewer/${reviewer.ID}`}
      isInset
      icon={
        <ListItemAvatar>
          <Avatar
            imgProps={{ crossOrigin: "anonymous" }}
            src={makeS3Link(s3LinkCategory.profilePicture, reviewer.ID)}
          />
        </ListItemAvatar>
      }
    />
  ));
};

const gamesQuickAccessSection = (favorites) =>
  favorites.length === 0 ? (
    <ListItem alignItems="flex-start">
      <ListItemText
        inset
        primaryTypographyProps={{ variant: "subtitle2", color: "textSecondary" }}
        primary="Empty..."
      />
    </ListItem>
  ) : (
    favorites.map((game) => (
      <ListItemLink
        primary={game.name}
        key={game.ID}
        isInset
        to={`/game/${game.ID}`}
        icon={
          <ListItemAvatar>
            <Avatar imgProps={{ crossOrigin: "anonymous" }} src={makeS3Link(s3LinkCategory.gameCover, game.ID)} />
          </ListItemAvatar>
        }
      />
    ))
  );

/**
 * Build list of workshop item
 * @param {ShortWorkshopDescription[]} workshops
 * @param {function} flagReview
 * @return {JSX.Element}
 */
const workshopQuickAccessSection = ({ workshops, flagReview }) => {
  const workshopElements = workshops.map((workshop) => (
    <WorkshopListItemLink
      isReview={flagReview(workshop)}
      key={workshop.ID}
      creationTimestamp={workshop.creationTimestamp}
      gameName={workshop.game.name}
      title={workshop.title}
      to={`/workshop/${workshop.ID}`}
    />
  ));
  return <>{workshopElements}</>;
};

export { gamesQuickAccessSection, reviewersQuickAccessSection, workshopQuickAccessSection };

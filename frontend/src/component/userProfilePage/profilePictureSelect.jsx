// React
import React from "react";
import PropTypes from "prop-types";
// MUI
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardHeader from "@mui/material/CardHeader";
import IconButton from "@mui/material/IconButton";
import PhotoCamera from "@mui/icons-material//PhotoCamera";
// Saltymotion
import { makeS3Link, s3LinkCategory } from "../../lib/utility";

/**
 * Render a profile picture with support for select and update
 * @param{string} name
 * @param{string} profilePictureFile
 * @param{string} s3Key
 * @param{string} registrationDate
 * @param{function} onChange
 * @return {JSX.Element}
 * @constructor
 */
export default function ProfilePictureSelect({ name, profilePictureFile, s3Key, registrationDate, onChange }) {
  return (
    <Card>
      <CardMedia
        alt={name}
        style={{ height: "250px" }}
        image={
          profilePictureFile
            ? URL.createObjectURL(profilePictureFile)
            : makeS3Link(s3LinkCategory.profilePicture, s3Key)
        }
      />
      <CardHeader
        title={name}
        titleTypographyProps={{ variant: "h6" }}
        subheader={`Registered on ${new Date(registrationDate).toDateString()}`}
        subheaderTypographyProps={{ variant: "subtitle2" }}
        action={
          <label htmlFor="uploadProfilePictureFile">
            <input
              accept="image/*"
              id="uploadProfilePictureFile"
              type="file"
              style={{ display: "none" }}
              onChange={onChange}
            />
            <IconButton component="span" color="primary" aria-label="upload profile picture">
              <PhotoCamera />
            </IconButton>
          </label>
        }
      />
    </Card>
  );
}

ProfilePictureSelect.propTypes = {
  name: PropTypes.string,
  profilePictureFile: PropTypes.oneOfType([PropTypes.instanceOf(Blob), PropTypes.instanceOf(File)]),
  s3Key: PropTypes.string,
  registrationDate: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

ProfilePictureSelect.defaultProps = {
  name: "",
  profilePictureFile: undefined,
  s3Key: "",
};

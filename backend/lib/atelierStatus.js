/**
 * @file Utility related to static Atelier status
 * @author Zebullon
 */

const _ = require('underscore');

/**
 * Mapping between atelier status ID and their description as should be mirrored in atelierStatusRef DB table
 * @type {{Assigned: number, ErrorOnAccept: number, InAuction: number, Complete: number, ErrorOnCreate: number, InProgress: number, ErrorOnMux: number, Cancelled: number, Deleted: number, Created: number, ErrorUnknown: number}}
 */
const atelierStatus = {
  Created: 0,
  InAuction: 10,
  Assigned: 20,
  InProgress: 30,
  Complete: 50,
  Cancelled: 60,
  Deleted: 70,
  ErrorOnCreate: 700,
  ErrorOnMux: 800,
  ErrorOnAccept: 900,
  ErrorUnknown: 999,
};
module.exports.atelierStatus = atelierStatus;

/**
 * Translate the DB atelier status code into their description
 * Note: This does not look like a very fast method, use with care
 * @param {string} statusCode - Numerical string representing the atelier status code
 * @return {string} The description of the atelier status
 */
module.exports.atelierStatusIDToDescription = (statusCode) => {
  const statusCodeIdx = _.indexOf(_.values(atelierStatus), statusCode);
  if (statusCodeIdx === -1) {
    console.error('Could not find status description from ID', statusCode);
    return undefined;
  }
  return _.keys(atelierStatus)[statusCodeIdx];
};

/**
 * Check if an atelier is still in progress
 * @param {number} atelierStatusID - Atelier numerical ID
 * @return {boolean} True if the atelier is in progress, False otherwise
 */
const isAtelierInProgress = (atelierStatusID) => atelierStatusID === atelierStatus.InProgress;
module.exports.isAtelierInProgress = isAtelierInProgress;

/**
 * Check if an atelier is completed
 * @param {number} atelierStatusID - Atelier numerical ID
 * @return {boolean} True if the atelier is complete, False otherwise
 */
const isAtelierComplete = (atelierStatusID) => atelierStatusID === atelierStatus.Complete;
module.exports.isAtelierComplete = isAtelierComplete;

/**
 * Check if an atelier is cancelled
 * @param {number} atelierStatusID - Atelier numerical ID
 * @return {boolean} True if the atelier is cancelled, False otherwise
 */
const isAtelierCancelled = (atelierStatusID) => atelierStatusID === atelierStatus.Cancelled;
module.exports.isAtelierCancelled = isAtelierCancelled;

const isAtelierDeleted = (atelierStatusID) => atelierStatusID === atelierStatus.Deleted;
module.exports.isAtelierDeleted = isAtelierDeleted;

const isAtelierInAuction = (atelierStatusID) => atelierStatusID === atelierStatus.InAuction;
module.exports.isAtelierInAuction = isAtelierInAuction;

/**
 * Check if an atelier is closed (complete or cancelled)
 * @param {number} atelierStatusID - Atelier numerical ID
 * @return {boolean} True if the atelier is closed, False otherwise or if an error occurred
 */
const isAtelierClosed = (atelierStatusID) => isAtelierCancelled(atelierStatusID) || isAtelierComplete(atelierStatusID)
  || isAtelierDeleted(atelierStatusID);
module.exports.isAtelierClosed = isAtelierClosed;

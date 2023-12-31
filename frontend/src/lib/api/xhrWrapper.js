// Saltymotion
import { formatGetParams } from "../utility";
import { recoverJWT } from "../storage";

/**
 * Create a GET call XHR and return fulfilled value
 * @param {string} url
 * @param {object} [queryPayload]
 * @param {string} [jwt]
 * @return {(Promise<any>|XMLHttpRequest)[]}
 */
export function xhrGet(url, queryPayload = undefined, jwt = undefined) {
  const xhr = new XMLHttpRequest();
  return [
    new Promise((resolve, reject) => {
      xhr.open("GET", `${url}${queryPayload !== undefined ? formatGetParams(queryPayload) : ""}`, true);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
      const sentJWT = jwt ?? recoverJWT(window.localStorage);
      if (sentJWT !== undefined) {
        xhr.setRequestHeader("Authorization", `Bearer ${sentJWT}`);
      }
      xhr.onload = () => {
        const { status } = xhr;
        if (status === 0 || (status >= 200 && status < 400)) {
          if (status === 204) {
            // FIXME: Required ?
            resolve({});
            return;
          }
          resolve(JSON.parse(xhr.response));
        } else {
          reject(status);
        }
      };

      xhr.onerror = () => {
        reject(new Error(`Error while sending XHR to ${xhr.url}`));
      };
      xhr.send();
    }),
    xhr,
  ];
}

/**
 * Create a call XHR that passes args in body (POST, PATCH, etc.)
 * @param {string} verb
 * @param {string} url
 * @param {Object|FormData} [queryPayload=undefined]
 * @param {string} [jwt=undefined]
 * @return {(Promise<any>|XMLHttpRequest)[]}
 */
export function xhrPCall(verb, url, queryPayload = undefined, jwt = undefined) {
  const xhr = new XMLHttpRequest();
  return [
    new Promise((resolve, reject) => {
      xhr.open(verb.toUpperCase(), url, true);
      xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
      if (!(queryPayload instanceof FormData)) {
        xhr.setRequestHeader("Content-type", "application/json");
      }
      const sentJWT = jwt ?? recoverJWT(window.localStorage);
      if (sentJWT !== undefined) {
        xhr.setRequestHeader("Authorization", `Bearer ${sentJWT}`);
      }
      xhr.onload = () => {
        const { status } = xhr;
        if (status === 0 || (status >= 200 && status < 400)) {
          resolve(status === 204 ? undefined : JSON.parse(xhr.response));
        } else {
          reject(status);
        }
      };
      xhr.onerror = () => reject(new Error(`Error while sending XHR to ${xhr.url}`));
      if (queryPayload === undefined) {
        xhr.send(undefined);
      } else if (queryPayload instanceof FormData) {
        xhr.send(queryPayload);
      } else {
        xhr.send(JSON.stringify(queryPayload));
      }
    }),
    xhr,
  ];
}

/**
 * @typedef ApiCallStatus
 * @readonly
 * @enum {string}
 */
const ApiCallStatus = {
  IN_PROGRESS: "IN_PROGRESS",
  SUCCESS: "SUCCESS",
  FAILURE: "FAILURE",
  // In some case we don't care if it succeeded or failed, simply that it's complete (idle is considered complete)
  COMPLETE: "COMPLETE",
};

export { ApiCallStatus };

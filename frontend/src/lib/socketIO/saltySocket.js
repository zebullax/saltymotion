import io from "socket.io-client";

/**
 * Class wrapping the ioSocket and relevant methods
 */
export default class SaltySocket {
  /**
   * Build a IOSocket object
   * @param {JWT} token
   */
  constructor(token) {
    this.ioSocket = io({ extraHeaders: { Authorization: `Bearer ${token.raw}` } });
  }

  /**
   * Subscribe our IOSocket to some update type
   * @param {string} updateType the msg type as sent using ioSocket
   * @param {function} callback Callback to use for processing the msg received
   */
  subscribeToMessages(updateType, callback) {
    this.ioSocket.on(updateType, (msg) => callback(msg));
  }

  /**
   * CLose socket
   */
  close() {
    this.ioSocket.disconnect();
  }
}

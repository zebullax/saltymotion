/* eslint-disable no-console */
import { BrowserRouter } from "react-router-dom";

/**
 * Router with debug infos
 */
class DebugRouter extends BrowserRouter {
  /**
   * Construct the component
   * @param {object} props
   */
  constructor(props) {
    super(props);
    console.debug("initial history is: ", JSON.stringify(this.history, null, 2));
    this.history.listen((location, action) => {
      console.debug(`The current URL is ${location.pathname}${location.search}${location.hash}`);
      console.debug(`The last navigation action was ${action}`, JSON.stringify(this.history, null, 2));
    });
  }
}

export default DebugRouter;

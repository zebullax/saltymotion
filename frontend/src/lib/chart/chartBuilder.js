// Saltymotion
import { chipDistributionChartConfig } from "./chartConfig";
// Misc
import Chart from "chart.js";

/**
 * Build the doughnut chart for chip distribution
 * @param {number} freeCoin
 * @param {number} frozenCoin
 * @param {number} redeemableCoin
 * @param {Element} node
 * @return {Chart}
 */
function buildChipDistributionChart({ freeCoin, frozenCoin, redeemableCoin, node }) {
  return new Chart(node, chipDistributionChartConfig({ freeCoin, frozenCoin, redeemableCoin }));
}
export { buildChipDistributionChart as default };

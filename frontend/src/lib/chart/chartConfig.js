import moment from "moment";

export const privacyChartConfig = (stat) => ({
  type: "horizontalBar",
  data: {
    labels: ["Visibility"],
    datasets: [
      {
        label: "public",
        borderSkipped: false,
        data: [stat.public],
        borderWidth: 1,
        barPercentage: 0.7,
        borderColor: "rgb(61, 174, 255)",
        backgroundColor: "rgba(61, 174, 255, 0.2)",
      },
      {
        label: "private",
        borderSkipped: false,
        barPercentage: 0.7,
        borderWidth: 1,
        borderColor: "rgb(123, 239, 117)",
        backgroundColor: "rgba(123, 239, 117, 0.2)",
        data: [stat.private],
      },
    ],
  },
  options: {
    animation: {
      duration: 0,
    },
    responsiveAnimationDuration: 0,
    responsive: true,
    maintainAspectRatio: false,
    legend: {
      display: true,
      position: "bottom",
      labels: {
        fontColor: "#ffffffb3",
      },
    },
    scales: {
      xAxes: [
        {
          gridLines: {
            color: "#ffffff1f",
          },
          ticks: {
            fontColor: "#ffffffb3",
            min: 0,
          },
        },
      ],
      yAxes: [
        {
          gridLines: {
            display: false,
          },
          ticks: {
            fontColor: "#ffffffb3",
            min: 0,
          },
        },
      ],
    },
  },
});

export const statusChartConfig = (stat) => ({
  type: "horizontalBar",
  data: {
    labels: ["Status"],
    datasets: [
      {
        label: "In Auction",
        data: [stat.inAuction],
        borderSkipped: false,
        borderWidth: 1,
        borderColor: "rgb(61, 174, 255)",
        backgroundColor: "rgba(61, 174, 255, 0.2)",
      },
      {
        label: "In Progress",
        borderSkipped: false,
        borderWidth: 1,
        borderColor: "rgb(123, 239, 117)",
        backgroundColor: "rgba(123, 239, 117, 0.2)",
        data: [stat.inProgress],
      },
      {
        label: "Complete",
        borderSkipped: false,
        borderWidth: 1,
        borderColor: "rgb(241, 130, 61)",
        backgroundColor: "rgba(241, 130, 61, 0.2)",
        data: [stat.complete],
      },
    ],
  },
  options: {
    animation: {
      duration: 0,
    },
    responsiveAnimationDuration: 0,
    responsive: true,
    maintainAspectRatio: false,
    legend: {
      display: true,
      position: "bottom",
      labels: {
        fontColor: "#ffffffb3",
      },
    },
    scales: {
      xAxes: [
        {
          gridLines: {
            color: "#ffffff1f",
          },
          ticks: {
            fontColor: "#ffffffb3",
            min: 0,
          },
        },
      ],
      yAxes: [
        {
          gridLines: {
            display: false,
          },
          ticks: {
            fontColor: "#ffffffb3",
            min: 0,
          },
        },
      ],
    },
  },
});

export const chipDistributionChartConfig = ({ freeCoin, frozenCoin, redeemableCoin }) => ({
  type: "doughnut",
  data: {
    datasets: [
      {
        data: [freeCoin, frozenCoin, redeemableCoin],
        backgroundColor: ["#3daaf1", "#7bef75", "#F1823D"],
        hoverBackgroundColor: ["#3daaf1", "#7bef75", "#F1823D"],
      },
    ],
    labels: ["Free", "Frozen", "Redeemable"],
  },
  options: {
    animation: {
      duration: 0,
    },
    responsiveAnimationDuration: 0,
    responsive: true,
    maintainAspectRatio: true,
    layout: {
      padding: {
        top: 16,
        left: 32,
        right: 16,
        bottom: 16,
      },
    },
    legend: {
      display: true,
      labels: {
        fontColor: "rgba(162, 174, 190, 1)",
      },
    },
  },
});

export const cashFlowChartConfig = (charges, transfers) => ({
  type: "bar",
  responsive: false,
  data: {
    datasets: [
      {
        label: "Charge",
        borderWidth: 1,
        borderColor: "#3daaf1",
        backgroundColor: "rgba(61,170,241,0.25)",
        data: charges.map((charge) => ({ x: charge.localDate, y: charge.sum })),
        stack: "chargeStack",
      },
      {
        label: "Transfer",
        borderWidth: 1,
        borderColor: "#7bef75",
        backgroundColor: "rgba(123,239,117,0.25)",
        data: transfers.map((transfer) => ({ x: transfer.localDate, y: transfer.sum })),
        stack: "transferStack",
      },
    ],
  },
  options: {
    animation: {
      duration: 0,
    },
    responsiveAnimationDuration: 0,
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 16,
        left: 16,
        right: 16,
        bottom: 16,
      },
    },
    legend: {
      display: true,
      labels: {
        fontColor: "rgba(162, 174, 190, 1)",
      },
    },
    scales: {
      xAxes: [
        {
          offset: true,
          type: "time",
          distribution: "linear",
          barPercentage: 0.9,
          time: {
            unit: "day",
            stepSize: 30,
            min: moment
              .unix(Date.now() / 1000)
              .subtract(6, "months")
              .valueOf(),
          },
          gridLines: {
            color: "rgba(162, 174, 190, 0.2)",
          },
          ticks: {
            fontColor: "rgba(162, 174, 190, 1)",
          },
        },
      ],
      yAxes: [
        {
          gridLines: {
            display: false,
          },
          ticks: {
            steps: 100,
            stepValue: 50,
            fontColor: "rgba(162, 174, 190, 0.5)",
          },
          scaleLabel: {},
        },
      ],
    },
  },
});

export const combinedStatusVisibilityChartConfig = (stat) => ({
  type: "horizontalBar",
  data: {
    labels: ["Status"],
    datasets: [
      {
        label: "In Auction",
        borderColor: "rgb(61, 174, 255)",
        backgroundColor: "rgba(61, 174, 255, 0.2)",
        borderWidth: 1,
        borderSkipped: false,
        data: [stat.inAuction],
        barPercentage: 0.9,
        categoryPercentage: 1,
      },
      {
        label: "In Progress",
        borderColor: "rgb(252, 90, 90)",
        backgroundColor: "rgba(252, 90, 90, 0.2)",
        borderWidth: 1,
        barPercentage: 0.9,
        categoryPercentage: 1,
        borderSkipped: false,
        data: [stat.inProgress],
      },
      {
        label: "Complete",
        borderColor: "rgb(241, 130, 61)",
        backgroundColor: "rgba(241, 130, 61, 0.2)",
        borderWidth: 1,
        barPercentage: 0.9,
        categoryPercentage: 1,
        borderSkipped: false,
        data: [stat.complete],
      },
      {
        label: "Private",
        borderColor: "rgb(188, 153, 255)",
        backgroundColor: "rgba(188, 153, 255, 0.2)",
        borderWidth: 1,
        borderSkipped: false,
        data: [stat.private],
        barPercentage: 0.9,
        categoryPercentage: 1,
      },
      {
        label: "Public",
        borderColor: "rgb(123, 239, 117)",
        backgroundColor: "rgba(123, 239, 117, 0.2)",
        borderWidth: 1,
        data: [stat.complete],
        borderSkipped: false,
        barPercentage: 0.9,
        categoryPercentage: 1,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      xAxes: [
        {
          ticks: {
            min: 0,
          },
        },
      ],
      yAxes: [
        {
          ticks: {
            min: 0,
          },
        },
      ],
    },
  },
});

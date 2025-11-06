"use strict";

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/dashboard/stats",
      handler: "dashboard.stats",
      config: {
        auth: {
          strategies: ["users-permissions"],
        },
      },
    },
  ],
};

"use strict";

const generateName = (username) =>
  username.trim().toLowerCase().replace(/\s+/g, "-");

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap({ strapi }) {
    strapi.db.lifecycles.subscribe({
      models: ["plugin::users-permissions.user"],
      async beforeCreate(event) {
        const { data } = event.params;

        console.log("Before Create Lifecycle Triggered");
        console.log("Data:", data);

        const name = data.name;
        const username = data.username;

        if (!name && username) {
          data.name = generateName(username);
        }
      },
    });
  },
};

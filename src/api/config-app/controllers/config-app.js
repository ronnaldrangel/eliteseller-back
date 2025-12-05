'use strict';

/**
 * config-app controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::config-app.config-app');

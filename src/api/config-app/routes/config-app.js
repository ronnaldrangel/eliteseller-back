'use strict';

/**
 * config-app router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::config-app.config-app');

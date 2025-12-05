'use strict';

/**
 * config-app service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::config-app.config-app');

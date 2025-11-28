'use strict';

/**
 * remarketing service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::remarketing.remarketing');

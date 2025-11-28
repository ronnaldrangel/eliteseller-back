'use strict';

/**
 * contact controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

const formatContact = (contact) => {
  if (!contact?.attributes) {
    return contact;
  }

  const formatted = { ...contact, attributes: { ...contact.attributes } };
  const { last_message, hotness } = formatted.attributes;
  let lastMessageLabel = last_message ? String(last_message) : 'N/A';

  if (last_message) {
    const parsedDate = new Date(last_message);
    if (!Number.isNaN(parsedDate.getTime())) {
      const hours = parsedDate.getHours().toString().padStart(2, '0');
      const minutes = parsedDate.getMinutes().toString().padStart(2, '0');
      lastMessageLabel = `${hours}:${minutes}`;
      formatted.attributes.last_message = lastMessageLabel;
    }
  }

  formatted.attributes.last_message_label = lastMessageLabel;

  if (hotness) {
    const emojiMap = {
      hot: '\uD83D\uDD25', // fire
      normal: '\uD83C\uDF31', // seedling
      cold: '\u2744\uFE0F', // snowflake
    };
    const key = String(hotness).toLowerCase();
    formatted.attributes.hotness = emojiMap[key] || hotness;
  }

  return formatted;
};

module.exports = createCoreController('api::contact.contact', ({ strapi }) => ({
  async find(ctx) {
    const { data, meta } = await super.find(ctx);
    return { data: data.map(formatContact), meta };
  },

  async findOne(ctx) {
    const response = await super.findOne(ctx);
    return {
      ...response,
      data: response?.data ? formatContact(response.data) : response.data,
    };
  },
}));

'use strict';

const { createCoreController } = require('@strapi/strapi').factories;
const DOCUMENT_ID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const normalizeLocale = (value) =>
  value === undefined ||
  value === null ||
  value === '' ||
  value === 'null' ||
  value === 'undefined'
    ? undefined
    : value;

const buildQueryFromCtx = (ctx, slug, normalizedLocale) => {
  const { populate, publicationState, fields } = ctx.query;
  const filters = {
    ...(ctx.query.filters ?? {}),
    slug,
  };

  const query = {
    filters,
    populate,
    publicationState,
    fields,
  };

  if (normalizedLocale !== undefined) {
    query.locale = normalizedLocale;
  }

  return query;
};

const findEntryBySlug = async (strapi, ctx, slug) => {
  const normalizedLocale = normalizeLocale(ctx.query.locale);
  const query = buildQueryFromCtx(ctx, slug, normalizedLocale);

  const result = await strapi
    .documents('api::chatbot.chatbot')
    .findMany(query);

  const collection = Array.isArray(result)
    ? result
    : Array.isArray(result?.results)
    ? result.results
    : Array.isArray(result?.data)
    ? result.data
    : [];

  const entry = collection[0] ?? null;

  return { entry, normalizedLocale };
};

module.exports = createCoreController('api::chatbot.chatbot', ({ strapi }) => ({
  async findOne(ctx) {
    const { id } = ctx.params;

    if (!DOCUMENT_ID_REGEX.test(id)) {
      const { entry } = await findEntryBySlug(strapi, ctx, id);

      if (!entry) {
        return ctx.notFound(`Chatbot con slug "${id}" no encontrado`);
      }

      const sanitized = await this.sanitizeOutput(entry, ctx);
      return this.transformResponse(sanitized);
    }

    return super.findOne(ctx);
  },

  async update(ctx) {
    const { id } = ctx.params;

    if (!DOCUMENT_ID_REGEX.test(id)) {
      const { entry, normalizedLocale } = await findEntryBySlug(strapi, ctx, id);

      if (!entry) {
        return ctx.notFound(`Chatbot con slug "${id}" no encontrado`);
      }

      const entryId = entry.documentId ?? entry.id;
      if (!entryId) {
        return ctx.notFound(`Chatbot con slug "${id}" no encontrado`);
      }

      ctx.params.id = entryId;

      if (!ctx.request.query) {
        ctx.request.query = {};
      }

      if (normalizedLocale === undefined) {
        delete ctx.query.locale;
        delete ctx.request.query.locale;
      } else {
        ctx.query.locale = normalizedLocale;
        ctx.request.query.locale = normalizedLocale;
      }

      return super.update(ctx);
    }

    return super.update(ctx);
  },

  async delete(ctx) {
    const { id } = ctx.params;

    if (!DOCUMENT_ID_REGEX.test(id)) {
      const { entry, normalizedLocale } = await findEntryBySlug(strapi, ctx, id);

      if (!entry) {
        return ctx.notFound(`Chatbot con slug "${id}" no encontrado`);
      }

      const entryId = entry.documentId ?? entry.id;
      if (!entryId) {
        return ctx.notFound(`Chatbot con slug "${id}" no encontrado`);
      }

      ctx.params.id = entryId;

      if (!ctx.request.query) {
        ctx.request.query = {};
      }

      if (normalizedLocale === undefined) {
        delete ctx.query.locale;
        delete ctx.request.query.locale;
      } else {
        ctx.query.locale = normalizedLocale;
        ctx.request.query.locale = normalizedLocale;
      }

      return super.delete(ctx);
    }

    return super.delete(ctx);
  },
}));

"use strict";

const crypto = require("crypto");

const toStringOrEmpty = (value) =>
  value === undefined || value === null ? "" : String(value);

const normalizeChatbotRecord = (raw = {}) => {
  const attrs = raw?.attributes || {};

  const documentId =
    toStringOrEmpty(raw?.documentId || attrs.documentId || raw?.id || attrs.id);
  const id = toStringOrEmpty(raw?.id || attrs.id || documentId);
  const slug = toStringOrEmpty(attrs.slug || raw?.slug);
  const name = toStringOrEmpty(
    attrs.chatbot_name ||
      raw?.chatbot_name ||
      attrs.name ||
      attrs.title ||
      (slug ? slug : documentId ? `Chatbot #${documentId}` : "")
  );

  return {
    documentId,
    id,
    slug,
    name,
  };
};

const computeChatbotRouteSegment = (raw = {}, userId = "") => {
  const { documentId, slug } = normalizeChatbotRecord(raw);
  if (!documentId) return "";

  if (slug && slug !== documentId) {
    return slug;
  }

  const salt = userId ? String(userId) : "public";
  return crypto.createHash("md5").update(`${salt}:${documentId}`).digest("hex");
};

const matchesChatbotRouteSegment = (segment, raw = {}, userId = "") => {
  if (!segment) return false;

  const candidate = String(segment).toLowerCase();
  const { slug, documentId, id } = normalizeChatbotRecord(raw);

  if (slug && candidate === slug.toLowerCase()) {
    return true;
  }
  if (documentId && candidate === documentId.toLowerCase()) {
    return true;
  }
  if (id && candidate === id.toLowerCase()) {
    return true;
  }

  const safe = computeChatbotRouteSegment(raw, userId);
  return safe && candidate === safe.toLowerCase();
};

const buildChatbotIdentifiers = (raw = {}, userId = "") => {
  const base = normalizeChatbotRecord(raw);
  const routeSegment = computeChatbotRouteSegment(raw, userId);
  return {
    ...base,
    routeSegment,
  };
};

module.exports = {
  normalizeChatbotRecord,
  computeChatbotRouteSegment,
  matchesChatbotRouteSegment,
  buildChatbotIdentifiers,
};

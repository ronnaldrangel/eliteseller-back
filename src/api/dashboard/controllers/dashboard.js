"use strict";

const {
  matchesChatbotRouteSegment,
  buildChatbotIdentifiers,
} = require("../../../utils/chatbot-route");

const formatResponseDuration = (seconds) => {
  if (!seconds || !Number.isFinite(seconds) || seconds <= 0) {
    return "N/A";
  }

  const totalSeconds = Math.round(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;

  if (minutes <= 0) {
    return `${secs}s`;
  }

  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  }

  return `${minutes}m ${secs}s`;
};

module.exports = {
  async stats(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized("Debe iniciar sesion");
    }

    const chatbotSegment = ctx.query.chatbot
      ? String(ctx.query.chatbot)
      : undefined;

    const chatbots = await strapi.db.query("api::chatbot.chatbot").findMany({
      where: {
        users_permissions_user: user.id,
      },
      select: ["id", "documentId", "slug", "chatbot_name"],
    });

    if (!chatbots || chatbots.length === 0) {
      return ctx.notFound("No se encontraron chatbots para el usuario");
    }

    let selected = chatbots[0];
    if (chatbotSegment) {
      const matched =
        chatbots.find((item) =>
          matchesChatbotRouteSegment(chatbotSegment, item, user.id)
        ) ||
        chatbots.find(
          (item) =>
            item.slug === chatbotSegment ||
            item.documentId === chatbotSegment ||
            String(item.id) === chatbotSegment
        );

      if (!matched) {
        return ctx.notFound("Chatbot no valido para el usuario autenticado");
      }

      selected = matched;
    }

    const chatbotId = selected.id;
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [
      totalContacts,
      newLeads,
      closedSales,
      activeCampaigns,
      activeChats,
      contactsForAverage,
    ] = await Promise.all([
      strapi.entityService.count("api::contact.contact", {}),
      strapi.entityService.count("api::contact.contact", {
        filters: {
          createdAt: {
            $gte: sevenDaysAgo.toISOString(),
          },
        },
      }),
      strapi.entityService.count("api::contact.contact", {
        filters: {
          sale_status_flag: true,
        },
      }),
      strapi.entityService.count("api::trigger.trigger", {
        filters: {
          chatbot: {
            id: {
              $eq: chatbotId,
            },
          },
          available: true,
        },
      }),
      strapi.entityService.count("api::contact.contact", {
        filters: {
          sale_status_flag: false,
          updatedAt: {
            $gte: twentyFourHoursAgo.toISOString(),
          },
        },
      }),
      strapi.entityService.findMany("api::contact.contact", {
        fields: ["createdAt", "updatedAt"],
        filters: {
          createdAt: {
            $gte: thirtyDaysAgo.toISOString(),
          },
        },
        limit: 250,
        sort: { createdAt: "desc" },
      }),
    ]);

    let averageResponseSeconds = 0;
    if (Array.isArray(contactsForAverage) && contactsForAverage.length > 0) {
      const totalSeconds = contactsForAverage.reduce((acc, item) => {
        const created = new Date(item.createdAt).getTime();
        const updated = new Date(item.updatedAt).getTime();
        if (Number.isFinite(created) && Number.isFinite(updated)) {
          const diff = Math.max(0, (updated - created) / 1000);
          return acc + diff;
        }
        return acc;
      }, 0);
      averageResponseSeconds =
        totalSeconds / Math.max(contactsForAverage.length, 1);
    }

    const conversionRate =
      totalContacts > 0 ? (closedSales / totalContacts) * 100 : 0;

    const payload = {
      chatbot: buildChatbotIdentifiers(selected, user.id),
      stats: {
        activeChats,
        newLeads,
        conversionRate: Number(conversionRate.toFixed(2)),
        averageResponseSeconds: Number(averageResponseSeconds.toFixed(2)),
        averageResponseLabel: formatResponseDuration(averageResponseSeconds),
        closedSales,
        activeCampaigns,
      },
    };

    ctx.body = { data: payload };
  },
};




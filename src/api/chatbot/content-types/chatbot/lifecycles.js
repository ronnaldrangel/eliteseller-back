//src/api/chatbot/content-types/lifecycles.js
function generateSlug(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

module.exports = {
  async beforeCreate(event) {
    const { data } = event.params;
    const ctx = strapi?.requestContext?.get?.();
    const userId =
      data?.users_permissions_user?.connect?.[0]?.id ?? ctx?.state?.user?.id;

    if (data.chatbot_name) {
      let slug = generateSlug(data.chatbot_name);
      let counter = 1;
      if (userId) {
        // Verificar slug único SOLO para el mismo usuario
        let exists = await strapi.documents("api::chatbot.chatbot").findMany({
          filters: {
            slug,
            users_permissions_user: { id: userId },
          },
        });

        while (exists.length > 0) {
          slug = `${generateSlug(data.chatbot_name)}-${counter}`;
          exists = await strapi.documents("api::chatbot.chatbot").findMany({
            filters: {
              slug,
              users_permissions_user: { id: userId },
            },
          });
          counter++;
        }
      } else {
        // Si no hay usuario (creación desde admin sin asignar usuario),
        // generar slug único globalmente como fallback
        let exists = await strapi.documents("api::chatbot.chatbot").findMany({
          filters: { slug },
        });

        while (exists.length > 0) {
          slug = `${generateSlug(data.chatbot_name)}-${counter}`;
          exists = await strapi.documents("api::chatbot.chatbot").findMany({
            filters: { slug },
          });
          counter++;
        }
      }
      data.slug = slug;
    }
  },

  async beforeUpdate(event) {
    const { data, where } = event.params;

    // Si se está actualizando el nombre del chatbot y no se proporciona slug
    if (data.chatbot_name && !data.slug) {
      let slug = generateSlug(data.chatbot_name);

      // Obtener el chatbot actual para saber su usuario
      const currentChatbot = await strapi
        .documents("api::chatbot.chatbot")
        .findOne({
          documentId: where.documentId,
          populate: ["users_permissions_user"],
        });

      if (currentChatbot) {
        const userId = currentChatbot.users_permissions_user?.id;

        if (userId) {
          let counter = 1;

          // Verificar que no exista otro bot del mismo usuario con ese slug
          // Excluir el chatbot actual de la búsqueda
          let exists = await strapi.documents("api::chatbot.chatbot").findMany({
            filters: {
              slug,
              users_permissions_user: { id: userId },
              documentId: { $ne: where.documentId },
            },
          });

          while (exists.length > 0) {
            slug = `${generateSlug(data.chatbot_name)}-${counter}`;
            exists = await strapi.documents("api::chatbot.chatbot").findMany({
              filters: {
                slug,
                users_permissions_user: { id: userId },
                documentId: { $ne: where.documentId },
              },
            });
            counter++;
          }
        }
      }

      data.slug = slug;
    }
  },
};

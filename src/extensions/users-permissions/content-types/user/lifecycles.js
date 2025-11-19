function generateName(username) {
  return username.trim().toLowerCase().replace(/\s+/g, "-");
}

module.exports = {
  async beforeCreate(event) {
    const { data } = event.params;
    const ctx = strapi?.requestContext?.get?.();
    console.log("Before Create Lifecycle Triggered");
    console.log("Data:", data);
    // Obtenermos el nombre de usuario y verificamos si existe
    const name =
      data?.users_permissions_user?.connect?.[0]?.id ?? ctx?.state?.user?.name;

    const username =
      data?.users_permissions_user?.connect?.[0]?.id ??
      ctx?.state?.user?.username;

    if (!name) {
      if (username) {
        let generatedName = generateName(username);
        data.name = generatedName;
      }
    }
  },
};

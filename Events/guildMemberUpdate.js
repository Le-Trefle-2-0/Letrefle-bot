module.exports = async (Client, oldMember, newMember) => {
  if (oldMember.pending && !newMember.pending) {
    let role = await newMember.guild.roles.fetch("718410052653809664");
    if (role) {
      await newMember.roles.add(role);
    }
  }
};

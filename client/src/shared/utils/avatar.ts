export const getAvatarInitials = (name?: string | null, email?: string | null) => {
  const baseValue = name?.trim() || email?.trim() || "";

  if (!baseValue) {
    return "??";
  }

  const cleanedName = baseValue.includes("@") ? baseValue.split("@")[0] : baseValue;
  const parts = cleanedName
    .split(/[\s._-]+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return cleanedName.slice(0, 2).toUpperCase();
  }

  if (parts.length === 1) {
    const [first] = parts;
    return first.slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
};

import { useMemo } from "react";
import {
  searchableRoutes,
  type SearchRoleContext,
  type SearchableRouteItem,
} from "@shared/config/searchableRoutes";

const normalize = (value: string) =>
  value.trim().toLowerCase().replace(/\s+/g, " ");

const scoreRouteMatch = (route: SearchableRouteItem, rawQuery: string) => {
  const query = normalize(rawQuery);
  if (!query) {
    return 0;
  }

  const label = normalize(route.label);
  const description = normalize(route.description);
  const section = normalize(route.section);
  const keywords = route.keywords.map(normalize);
  const tokens = query.split(" ").filter(Boolean);

  let score = 0;

  if (label === query) {
    score += 160;
  }

  if (label.startsWith(query)) {
    score += 120;
  }

  if (keywords.some((keyword) => keyword === query)) {
    score += 110;
  }

  if (keywords.some((keyword) => keyword.startsWith(query))) {
    score += 95;
  }

  if (description.includes(query)) {
    score += 55;
  }

  if (section.includes(query)) {
    score += 35;
  }

  tokens.forEach((token) => {
    if (label.includes(token)) {
      score += 28;
    }

    if (keywords.some((keyword) => keyword.includes(token))) {
      score += 24;
    }

    if (description.includes(token)) {
      score += 10;
    }
  });

  return score;
};

export const useGlobalSearch = (
  query: string,
  roleContext: SearchRoleContext,
  limit = 8,
) => {
  return useMemo(() => {
    const roleRoutes = searchableRoutes.filter((route) =>
      route.roles.includes(roleContext),
    );

    const trimmedQuery = normalize(query);
    if (!trimmedQuery) {
      return roleRoutes.slice(0, limit);
    }

    return roleRoutes
      .map((route) => ({
        route,
        score: scoreRouteMatch(route, trimmedQuery),
      }))
      .filter((entry) => entry.score > 0)
      .sort((left, right) => {
        if (right.score !== left.score) {
          return right.score - left.score;
        }

        return left.route.label.localeCompare(right.route.label);
      })
      .slice(0, limit)
      .map((entry) => entry.route);
  }, [limit, query, roleContext]);
};

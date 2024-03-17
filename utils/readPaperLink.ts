/**
 * Constructs the Read link URL based on authentication status.
 * If unauthenticated, it attempts to retrieve the last visited node from localStorage.
 * @param {boolean} isAuthenticated - The authentication status.
 * @returns {string} The URL for the Read link.
 */
export const deriveReadLink = (
  status: "authenticated" | "loading" | "unauthenticated"
): string => {
  if (status === "loading") {
    return "/api/redirect/user/read"; // Loading link
  }

  if (status === "authenticated") {
    return "/api/redirect/user/read"; // Authenticated user link
  }

  if (status === "unauthenticated") {
    const lastVisitedNode = localStorage.getItem("lastVisitedNode")
      ? JSON.parse(localStorage.getItem("lastVisitedNode") as string)
      : null;

    if (lastVisitedNode) {
      return `/api/redirect/user/read?paperId=${lastVisitedNode.paperId}&globalId=${lastVisitedNode.globalId}`;
    } else {
      return "/api/redirect/user/read";
    }
  }

  return "/api/redirect/user/read";
};

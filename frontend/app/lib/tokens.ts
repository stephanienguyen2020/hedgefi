/**
 * Functions for fetching token information from the API
 */

/**
 * Fetch a token by its ID
 * @param id The token ID
 * @returns The token data or null if not found
 */
export async function fetchTokenById(id: string) {
  try {
    const response = await fetch(`/api/tokens/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch token: ${response.statusText}`);
    }

    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error("Error fetching token:", error);
    return null;
  }
}

/**
 * Fetch tokens associated with a user
 * @param userId The user ID
 * @returns An array of tokens or an empty array if none found
 */
export async function fetchUserTokens(userId: string) {
  try {
    const response = await fetch(`/api/user-tokens?userId=${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user tokens: ${response.statusText}`);
    }

    const data = await response.json();
    return data.tokens || [];
  } catch (error) {
    console.error("Error fetching user tokens:", error);
    return [];
  }
}

/**
 * Fetch popular tokens
 * @returns An array of popular tokens or an empty array if none found
 */
export async function fetchPopularTokens() {
  try {
    const response = await fetch("/api/popular-tokens", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch popular tokens: ${response.statusText}`);
    }

    const data = await response.json();
    return data.tokens || [];
  } catch (error) {
    console.error("Error fetching popular tokens:", error);
    return [];
  }
}

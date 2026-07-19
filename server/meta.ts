// Facebook Login for Business + Instagram Graph API integration.
// Docs: https://developers.facebook.com/docs/instagram-platform/instagram-api-with-facebook-login

const GRAPH_VERSION = process.env.META_GRAPH_API_VERSION || "v21.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;
const OAUTH_BASE = `https://www.facebook.com/${GRAPH_VERSION}`;

const APP_ID = process.env.META_APP_ID || "";
const APP_SECRET = process.env.META_APP_SECRET || "";
const REDIRECT_URI = process.env.META_REDIRECT_URI || "";
// Configuration ID from Facebook Login for Business > Configurations.
// The permissions requested (instagram_basic, instagram_manage_messages, etc.)
// are defined on that configuration, not passed as a `scope` param here.
const LOGIN_CONFIG_ID = process.env.META_LOGIN_CONFIG_ID || "";

export function isMetaConfigured() {
  return Boolean(APP_ID && APP_SECRET && REDIRECT_URI && LOGIN_CONFIG_ID);
}

export function getLoginUrl(state: string) {
  const params = new URLSearchParams({
    client_id: APP_ID,
    redirect_uri: REDIRECT_URI,
    state,
    response_type: "code",
    config_id: LOGIN_CONFIG_ID,
  });
  return `${OAUTH_BASE}/dialog/oauth?${params.toString()}`;
}

async function graphGet<T>(path: string, params: Record<string, string>): Promise<T> {
  const url = `${GRAPH_BASE}${path}?${new URLSearchParams(params).toString()}`;
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error?.message || `Graph API request failed: ${path}`);
  }
  return json as T;
}

export async function exchangeCodeForUserToken(code: string) {
  return graphGet<{ access_token: string; token_type: string; expires_in?: number }>(
    "/oauth/access_token",
    {
      client_id: APP_ID,
      client_secret: APP_SECRET,
      redirect_uri: REDIRECT_URI,
      code,
    }
  );
}

export async function getLongLivedUserToken(shortLivedToken: string) {
  return graphGet<{ access_token: string; token_type: string; expires_in: number }>(
    "/oauth/access_token",
    {
      grant_type: "fb_exchange_token",
      client_id: APP_ID,
      client_secret: APP_SECRET,
      fb_exchange_token: shortLivedToken,
    }
  );
}

interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
}

export async function getUserPages(userAccessToken: string) {
  const data = await graphGet<{ data: FacebookPage[] }>("/me/accounts", {
    access_token: userAccessToken,
  });
  return data.data;
}

export async function getInstagramBusinessAccountId(pageId: string, pageAccessToken: string) {
  const data = await graphGet<{ instagram_business_account?: { id: string } }>(`/${pageId}`, {
    fields: "instagram_business_account",
    access_token: pageAccessToken,
  });
  return data.instagram_business_account?.id ?? null;
}

export interface InstagramProfile {
  id: string;
  username: string;
  name?: string;
  followers_count?: number;
  profile_picture_url?: string;
}

export async function getInstagramProfile(igUserId: string, pageAccessToken: string) {
  return graphGet<InstagramProfile>(`/${igUserId}`, {
    fields: "username,name,followers_count,profile_picture_url",
    access_token: pageAccessToken,
  });
}

export interface ConnectedIgAccount {
  pageId: string;
  pageAccessToken: string;
  igUserId: string;
  profile: InstagramProfile;
}

// Walks every Facebook Page the user granted access to and returns the
// Instagram Business accounts connected to them, with real profile data.
export async function resolveConnectedInstagramAccounts(userAccessToken: string): Promise<ConnectedIgAccount[]> {
  const pages = await getUserPages(userAccessToken);
  const results: ConnectedIgAccount[] = [];

  for (const page of pages) {
    const igUserId = await getInstagramBusinessAccountId(page.id, page.access_token);
    if (!igUserId) continue;
    const profile = await getInstagramProfile(igUserId, page.access_token);
    results.push({ pageId: page.id, pageAccessToken: page.access_token, igUserId, profile });
  }

  return results;
}

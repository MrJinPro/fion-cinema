import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const KINOAPI_BASE_URL = "https://api.service-kp.com";

type KinoApiItem = {
  id: number;
  title?: string;
  year?: number;
  type?: string;
  [key: string]: unknown;
};

type KinoApiFile = {
  quality?: string;
  quality_id?: number;
  w?: number;
  h?: number;
  file?: string;
  urls?: {
    http?: string;
    hls?: string;
    hls2?: string;
    hls4?: string;
  };
};

let cachedAccessToken: string | null = Deno.env.get("KINOAPI_ACCESS_TOKEN") ?? null;

const normalizeTitle = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[ё]/g, "е")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

const buildUrl = (path: string, params: Record<string, string | number | undefined>): string => {
  const url = new URL(path, KINOAPI_BASE_URL);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
};

const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = Deno.env.get("KINOAPI_REFRESH_TOKEN");
  const clientId = Deno.env.get("KINOAPI_CLIENT_ID");
  const clientSecret = Deno.env.get("KINOAPI_CLIENT_SECRET");

  if (!refreshToken || !clientId || !clientSecret) {
    return null;
  }

  const refreshUrl = buildUrl("/oauth2/token", {
    grant_type: "refresh_token",
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
  });

  const response = await fetch(refreshUrl, {
    method: "POST",
    headers: {
      accept: "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Failed to refresh KinoAPI token:", response.status, errorText);
    return null;
  }

  const data = await response.json();
  const token = data?.access_token as string | undefined;
  if (!token) {
    return null;
  }

  cachedAccessToken = token;
  return token;
};

const getAccessToken = async (): Promise<string> => {
  if (cachedAccessToken) {
    return cachedAccessToken;
  }

  const envToken = Deno.env.get("KINOAPI_ACCESS_TOKEN");
  if (envToken) {
    cachedAccessToken = envToken;
    return envToken;
  }

  const refreshed = await refreshAccessToken();
  if (refreshed) {
    return refreshed;
  }

  throw new Error(
    "KinoAPI access token is not configured. Set KINOAPI_ACCESS_TOKEN or KINOAPI_REFRESH_TOKEN + KINOAPI_CLIENT_ID + KINOAPI_CLIENT_SECRET in Supabase secrets.",
  );
};

const requestKinoApi = async (
  path: string,
  params: Record<string, string | number | undefined>,
  allowRetry = true,
): Promise<any> => {
  const accessToken = await getAccessToken();
  const url = buildUrl(path, { ...params, access_token: accessToken });

  const response = await fetch(url, {
    headers: {
      accept: "application/json",
    },
  });

  if (response.status === 401 && allowRetry) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return requestKinoApi(path, params, false);
    }
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`KinoAPI request failed (${response.status}): ${errorText}`);
  }

  return response.json();
};

const findBestMatch = (items: KinoApiItem[], tmdbTitle: string, year?: number): KinoApiItem | null => {
  if (!items.length) return null;

  const query = normalizeTitle(tmdbTitle);

  const scored = items.map((item) => {
    const candidateTitle = normalizeTitle(item.title || "");
    let score = 0;

    if (candidateTitle === query) score += 120;
    if (candidateTitle.includes(query) || query.includes(candidateTitle)) score += 70;

    if (year && item.year) {
      const diff = Math.abs(item.year - year);
      if (diff === 0) score += 35;
      else if (diff === 1) score += 20;
      else if (diff <= 2) score += 8;
      else score -= diff;
    }

    if (item.type === "movie") score += 10;

    return { item, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.item ?? null;
};

const pickBestFile = (files: KinoApiFile[]): KinoApiFile | null => {
  if (!files.length) return null;

  return [...files].sort((a, b) => {
    const aq = a.quality_id ?? 0;
    const bq = b.quality_id ?? 0;
    if (aq !== bq) return bq - aq;
    const ah = a.h ?? 0;
    const bh = b.h ?? 0;
    return bh - ah;
  })[0];
};

const extractMediaPayload = (detailsResponse: any) => {
  const item = detailsResponse?.item ?? null;
  const videos = detailsResponse?.videos ?? item?.videos ?? [];
  const firstVideo = Array.isArray(videos) && videos.length > 0 ? videos[0] : null;
  const files = Array.isArray(firstVideo?.files) ? firstVideo.files : [];
  const bestFile = pickBestFile(files);

  const streamUrl =
    bestFile?.urls?.http ||
    bestFile?.urls?.hls ||
    bestFile?.urls?.hls4 ||
    bestFile?.urls?.hls2 ||
    null;

  const streamType = bestFile?.urls?.http
    ? "http"
    : bestFile?.urls?.hls || bestFile?.urls?.hls4 || bestFile?.urls?.hls2
      ? "hls"
      : null;

  const mediaId = firstVideo?.id ?? firstVideo?.mid ?? firstVideo?.media_id ?? null;

  return {
    item,
    firstVideo,
    mediaId,
    files,
    bestFile,
    streamUrl,
    streamType,
  };
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, year } = await req.json();

    if (!title || typeof title !== "string") {
      return new Response(
        JSON.stringify({ found: false, error: "Field 'title' is required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const cleanTitle = title.trim();
    const safeYear = typeof year === "number" ? year : undefined;

    const searchResponse = await requestKinoApi("/v1/items/search", {
      q: cleanTitle,
      type: "movie",
      perpage: 20,
      sectioned: 0,
    });

    const items = Array.isArray(searchResponse?.items) ? searchResponse.items as KinoApiItem[] : [];
    const match = findBestMatch(items, cleanTitle, safeYear);

    if (!match) {
      return new Response(
        JSON.stringify({ found: false, query: { title: cleanTitle, year: safeYear } }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const detailsResponse = await requestKinoApi(`/v1/items/${match.id}`, {
      nolinks: 0,
    });

    const mediaPayload = extractMediaPayload(detailsResponse);
    let streamUrl = mediaPayload.streamUrl as string | null;
    let streamType = mediaPayload.streamType as string | null;
    let files = mediaPayload.files as KinoApiFile[];

    if (!streamUrl && mediaPayload.mediaId) {
      const linksResponse = await requestKinoApi("/v1/items/media-links", {
        mid: mediaPayload.mediaId,
      });

      files = Array.isArray(linksResponse?.files) ? linksResponse.files : [];
      const bestFile = pickBestFile(files);
      streamUrl =
        bestFile?.urls?.http ||
        bestFile?.urls?.hls ||
        bestFile?.urls?.hls4 ||
        bestFile?.urls?.hls2 ||
        null;
      streamType = bestFile?.urls?.http
        ? "http"
        : bestFile?.urls?.hls || bestFile?.urls?.hls4 || bestFile?.urls?.hls2
          ? "hls"
          : null;
    }

    const payload = {
      found: true,
      query: {
        title: cleanTitle,
        year: safeYear,
      },
      match: {
        id: match.id,
        title: match.title,
        year: match.year,
        type: match.type,
      },
      player: {
        streamUrl,
        streamType,
        quality: files.map((file) => ({
          quality: file.quality,
          qualityId: file.quality_id,
          width: file.w,
          height: file.h,
        })),
      },
    };

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("kinoapi-proxy error:", error);

    return new Response(
      JSON.stringify({
        found: false,
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});

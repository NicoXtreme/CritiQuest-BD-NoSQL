
const RAWG_BASE_URL = "https://api.rawg.io/api";

type RawgResponse<T> = {
    results: T[];
    count: number;
    next: string | null;
    previous: string | null;
};

type RawgGame = {
    id: number;
    name: string;
    background_image: string | null;
    released: string | null;
    genres?: Array<{ name: string }>;
    platforms?: Array<{ platform: { name: string } }>;
    description_raw?: string;
};

function getApiKey(): string {
    const apiKey = process.env.RAWG_API_KEY;

    if (!apiKey) {
        throw new Error("RAWG_API_KEY is not configured");
    }

    return apiKey;
}

async function rawgRequest<T>(
    endpoint: string,
    params: Record<string, string> = {}
): Promise<T> {
    const url = new URL(`${RAWG_BASE_URL}${endpoint}`);

    url.searchParams.set("key", getApiKey());

    Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
    });

    const response = await fetch(url.toString());

    if (!response.ok) {
        throw new Error(`RAWG API error: ${response.status}`);
    }

    return response.json() as Promise<T>;
}

export async function getRawgGames(
    page = 1,
    pageSize = 20,
    search?: string
): Promise<RawgResponse<RawgGame>> {
    const params: Record<string, string> = {
        page: String(page),
        page_size: String(pageSize),
    };

    if (search) {
        params.search = search;
    }

    return rawgRequest<RawgResponse<RawgGame>>(
        "/games",
        params
    );
}

export async function getRawgGameById(
    id: number
): Promise<RawgGame> {
    return rawgRequest<RawgGame>(`/games/${id}`);
}

export function mapRawgGame(game: RawgGame) {
    return {
        rawgId: game.id,
        name: game.name,
        backgroundImage: game.background_image ?? null,
        released: game.released ?? null,
        genres: game.genres?.map((genre) => genre.name) ?? [],
        platforms:
            game.platforms?.map((item) => item.platform.name) ?? [],
    };
}

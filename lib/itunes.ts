export async function enrichSongWithItunes(
  artist: string,
  title: string
) {
  try {
    const query = encodeURIComponent(`${artist} ${title}`);

    const response = await fetch(
      `https://itunes.apple.com/search?term=${query}&entity=song&limit=10`
    );

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return null;
    }

    const match = data.results.find(
      (song: any) => song.previewUrl
    );

    if (!match) {
      return null;
    }

    return {
      previewUrl: match.previewUrl,
      artwork: match.artworkUrl100 || null,
      artistName: match.artistName || artist,
      trackName: match.trackName || title,
    };
  } catch (error) {
    console.error('iTunes fetch error:', error);
    return null;
  }
}
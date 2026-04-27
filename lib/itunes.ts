import { Song } from './store';

interface iTunesResult {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName: string;
  artworkUrl100: string;
  previewUrl: string;
  releaseDate: string;
}

export async function enrichSongWithItunes(song: Song): Promise<Song> {
  try {
    const query = encodeURIComponent(`${song.artist} ${song.title}`);
    const res = await fetch(
      `https://itunes.apple.com/search?term=${query}&media=music&limit=5&entity=song`
    );
    if (!res.ok) return song;
    const data = await res.json();
    
    if (!data.results || data.results.length === 0) return song;

    // Find best match
    const match: iTunesResult = data.results.find((r: iTunesResult) => {
      const titleMatch = r.trackName.toLowerCase().includes(song.title.toLowerCase()) ||
        song.title.toLowerCase().includes(r.trackName.toLowerCase());
      const artistMatch = r.artistName.toLowerCase().includes(song.artist.toLowerCase()) ||
        song.artist.toLowerCase().includes(r.artistName.toLowerCase());
      return titleMatch && artistMatch;
    }) || data.results[0];

    return {
      ...song,
      previewUrl: match.previewUrl || song.previewUrl,
      albumArt: match.artworkUrl100?.replace('100x100', '300x300') || song.albumArt,
    };
  } catch {
    return song;
  }
}

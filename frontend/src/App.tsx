import { useState, useEffect } from 'react';
import { JobState } from './types';

const API_BASE = 'http://localhost:3001/api/aurora';

function App() {
  const [artistName, setArtistName] = useState('');
  const [albumName, setAlbumName] = useState('');
  const [albumDescription, setAlbumDescription] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [burnCD, setBurnCD] = useState(false);
  const [driveId, setDriveId] = useState('/dev/cdrom');
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobState, setJobState] = useState<JobState | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files || files.length === 0) {
      alert('Please upload at least one track');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('artistName', artistName);
    formData.append('albumName', albumName);
    formData.append('albumDescription', albumDescription);
    formData.append('burnCD', String(burnCD));
    if (burnCD) formData.append('driveId', driveId);
    
    for (let i = 0; i < files.length; i++) {
      formData.append('uploadedTracks', files[i]);
    }

    try {
      const res = await fetch(`${API_BASE}/start`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      setJobId(data.jobId);
    } catch (error) {
      alert('Failed to start job');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!jobId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/status?jobId=${jobId}`);
        const data: JobState = await res.json();
        setJobState(data);

        if (data.state === 'SUCCEEDED' || data.state === 'FAILED') {
          setLoading(false);
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Failed to fetch status', error);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [jobId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-pink-900 text-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">Aurora</h1>
          <p className="text-xl text-gray-300">
            Turn AI-generated tracks into a complete AI artist CD package.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Artist Name</label>
              <input
                type="text"
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Album Name</label>
              <input
                type="text"
                value={albumName}
                onChange={(e) => setAlbumName(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Album Description / Vibe</label>
              <textarea
                value={albumDescription}
                onChange={(e) => setAlbumDescription(e.target.value)}
                required
                rows={3}
                placeholder="e.g. Nostalgic synthwave about driving in LA in 1995"
                className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Upload AI-Generated Tracks</label>
              <input
                type="file"
                multiple
                accept="audio/*,video/*"
                onChange={(e) => setFiles(e.target.files)}
                required
                className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-sm text-gray-300 mt-2">
                Each uploaded file will be turned into a track with consistent titles and durations.
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={burnCD}
                  onChange={(e) => setBurnCD(e.target.checked)}
                  className="w-5 h-5 rounded"
                />
                <span>Create ISO file and mint NFT</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Generating...' : 'Generate CD Package'}
            </button>
          </div>
        </form>

        {jobState && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-4">Status & Results</h2>
            
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-2">
                <div className={`w-3 h-3 rounded-full ${
                  jobState.state === 'RUNNING' ? 'bg-yellow-400 animate-pulse' :
                  jobState.state === 'SUCCEEDED' ? 'bg-green-400' :
                  jobState.state === 'FAILED' ? 'bg-red-400' : 'bg-gray-400'
                }`} />
                <span className="font-medium">{jobState.state}</span>
              </div>
              {jobState.progressMessage && (
                <p className="text-gray-300">{jobState.progressMessage}</p>
              )}
              {jobState.error && (
                <p className="text-red-400 mt-2">Error: {jobState.error}</p>
              )}
            </div>

            {jobState.outputs && jobState.state === 'SUCCEEDED' && (
              <div className="space-y-6">
                {jobState.outputs.artistProfile && (
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Artist Persona</h3>
                    <p className="text-gray-300">{jobState.outputs.artistProfile.personaSummary}</p>
                  </div>
                )}

                {jobState.outputs.albumProfile && (
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Album Concept</h3>
                    <p className="text-gray-300">{jobState.outputs.albumProfile.albumConcept}</p>
                  </div>
                )}

                {jobState.outputs.trackList && (
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Tracks</h3>
                    <ul className="space-y-1">
                      {jobState.outputs.trackList.tracks.map((track) => (
                        <li key={track.id} className="text-gray-300">
                          {track.trackNo}. {track.title} ({Math.floor(track.durationSec / 60)}:{String(track.durationSec % 60).padStart(2, '0')})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {jobState.outputs.coverArtDesign && (
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Cover Art</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {jobState.outputs.coverArtDesign.frontCoverUrl && (
                        <div>
                          <p className="text-sm mb-2">Front Cover</p>
                          <img 
                            src={jobState.outputs.coverArtDesign.frontCoverUrl} 
                            alt="Front Cover" 
                            className="rounded-lg w-full"
                            crossOrigin="anonymous"
                            onError={(e) => {
                              console.error('Failed to load front cover:', jobState.outputs.coverArtDesign?.frontCoverUrl);
                              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%238338EC" width="400" height="400"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="white" font-size="20"%3EFront Cover%3C/text%3E%3C/svg%3E';
                            }}
                          />
                        </div>
                      )}
                      {jobState.outputs.coverArtDesign.backCoverUrl && (
                        <div>
                          <p className="text-sm mb-2">Back Cover</p>
                          <img 
                            src={jobState.outputs.coverArtDesign.backCoverUrl} 
                            alt="Back Cover" 
                            className="rounded-lg w-full"
                            crossOrigin="anonymous"
                            onError={(e) => {
                              console.error('Failed to load back cover:', jobState.outputs.coverArtDesign?.backCoverUrl);
                              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%233A86FF" width="400" height="400"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="white" font-size="20"%3EBack Cover%3C/text%3E%3C/svg%3E';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {jobState.outputs.burnResult && (
                  <div>
                    <h3 className="font-semibold text-lg mb-2">💿 ISO File Created</h3>
                    <p className="text-gray-300">ISO Path: {jobState.outputs.burnResult.isoPath}</p>
                    <p className="text-gray-300">Status: {jobState.outputs.burnResult.isoStatus}</p>
                    {jobState.outputs.burnResult.isoSha256 && (
                      <p className="text-gray-300 text-sm font-mono break-all">SHA-256: {jobState.outputs.burnResult.isoSha256}</p>
                    )}
                  </div>
                )}

                {jobState.outputs.nftResult && (
                  <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">🎨 Album NFT Minted!</h3>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-300">
                        <span className="font-semibold">Collection ID:</span> {jobState.outputs.nftResult.collectionId}
                      </p>
                      <p className="text-gray-300">
                        <span className="font-semibold">Item ID:</span> {jobState.outputs.nftResult.itemId}
                      </p>
                      <p className="text-gray-300">
                        <span className="font-semibold">Metadata CID:</span>{' '}
                        <a 
                          href={`https://ipfs.io/ipfs/${jobState.outputs.nftResult.metadataCid}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 underline"
                        >
                          {jobState.outputs.nftResult.metadataCid}
                        </a>
                      </p>
                      <p className="text-gray-300">
                        <span className="font-semibold">Owner:</span>{' '}
                        <span className="font-mono text-xs">{jobState.outputs.nftResult.owner}</span>
                      </p>
                      <p className="text-gray-300">
                        <span className="font-semibold">Transaction:</span>{' '}
                        <span className="font-mono text-xs">{jobState.outputs.nftResult.transactionHash}</span>
                      </p>
                      <a
                        href={jobState.outputs.nftResult.subscanUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
                      >
                        View on Subscan →
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

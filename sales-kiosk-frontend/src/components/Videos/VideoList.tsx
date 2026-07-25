import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { fetchVideos } from "../../store/slices/videoSlice";
import { sendIntent } from "../../socket/socket";
import { Loader } from "../Common/Loader";
import { ErrorMessage } from "../Common/ErrorMessage";

export function VideoList() {
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading, error } = useSelector((s: RootState) => s.videos);
  const playingVideoId = useSelector((s: RootState) => s.kiosk.playingVideoId);

  useEffect(() => {
    dispatch(fetchVideos());
  }, [dispatch]);

  if (loading) return <Loader label="Loading videos…" />;
  if (error) return <ErrorMessage message={error} />;

  const playingVideo = items.find((v) => v.id === playingVideoId) ?? null;

  return (
    <div className="screen">
      <h1 className="screen__title">Videos</h1>

      {playingVideo && (
        <div className="video-player">
          {/* key forces the <video> element to remount when the video
              changes, so play state stays in sync across devices */}
          <video key={playingVideo.id} src={playingVideo.videoUrl} controls autoPlay />
          <p className="video-player__title">{playingVideo.title}</p>
        </div>
      )}

      <div className="video-list">
        {items.map((video) => (
          <button
            key={video.id}
            className={`video-list__item ${playingVideoId === video.id ? "is-playing" : ""}`}
            onClick={() => sendIntent({ type: "play-video", payload: { videoId: video.id } })}
          >
            <img src={video.thumbnailUrl} alt={video.title} />
            <span>{video.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

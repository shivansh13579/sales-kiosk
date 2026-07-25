import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { fetchGallery } from "../../store/slices/gallerySlice";
import { sendIntent } from "../../socket/socket";
import { Loader } from "../Common/Loader";
import { ErrorMessage } from "../Common/ErrorMessage";
import { ImagePreviewModal } from "./ImagePreviewModal";

export function GalleryGrid() {
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading, error } = useSelector((s: RootState) => s.gallery);
  const openImageId = useSelector((s: RootState) => s.kiosk.openImageId);

  useEffect(() => {
    dispatch(fetchGallery());
  }, [dispatch]);

  if (loading) return <Loader label="Loading gallery…" />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="screen">
      <h1 className="screen__title">Gallery</h1>
      <div className="gallery-grid">
        {items.map((image) => (
          <button
            key={image.id}
            className="gallery-grid__item"
            onClick={() => sendIntent({ type: "open-image", payload: { imageId: image.id } })}
          >
            <img src={image.imageUrl} alt={image.title} loading="lazy" />
            <span className="gallery-grid__caption">{image.title}</span>
          </button>
        ))}
      </div>

      {openImageId !== null && (
        <ImagePreviewModal
          image={items.find((i) => i.id === openImageId) ?? null}
          onClose={() => sendIntent({ type: "close-image" })}
        />
      )}
    </div>
  );
}

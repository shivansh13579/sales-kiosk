import { GalleryImage } from "../../types";

export function ImagePreviewModal({
  image,
  onClose,
}: {
  image: GalleryImage | null;
  onClose: () => void;
}) {
  if (!image) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-overlay__content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-overlay__close" onClick={onClose} aria-label="Close preview">
          ✕
        </button>
        <img src={image.imageUrl} alt={image.title} />
        <p className="modal-overlay__caption">{image.title}</p>
      </div>
    </div>
  );
}

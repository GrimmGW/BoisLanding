import { useEffect, useRef, useState } from "react";

function FramedImage({ src, alt, className = "", ...rest }) {
  const ref = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(false);
    const img = ref.current;
    if (img && img.complete && img.naturalWidth > 0) {
      setReady(true);
    }
  }, [src]);

  return (
    <>
      {ready ? null : <span className="media-skeleton" aria-hidden="true" />}
      <img
        ref={ref}
        src={src}
        alt={alt}
        className={`${className}${ready ? "" : " is-pending"}`.trim()}
        onLoad={() => setReady(true)}
        onError={() => setReady(true)}
        {...rest}
      />
    </>
  );
}

export default FramedImage;

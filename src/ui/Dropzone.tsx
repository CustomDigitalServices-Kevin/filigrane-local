import { useCallback, useRef, useState } from "react";
import type { DragEvent, ReactElement } from "react";
import { useLocale } from "../i18n/locale-context";
import { IconUpload } from "./icons";

interface DropzoneProps {
  onFiles: (files: File[]) => void;
}

const ACCEPT = ".pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/png,image/jpeg,image/webp";

export function Dropzone({ onFiles }: DropzoneProps): ReactElement {
  const { t } = useLocale();
  const [active, setActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (event: DragEvent<HTMLButtonElement>) => {
      event.preventDefault();
      setActive(false);
      const files = Array.from(event.dataTransfer.files);
      if (files.length > 0) onFiles(files);
    },
    [onFiles],
  );

  const openPicker = useCallback(() => {
    inputRef.current?.click();
  }, []);

  return (
    <button
      type="button"
      className={active ? "dropzone dropzone--active" : "dropzone"}
      onClick={openPicker}
      onDragOver={(e) => {
        e.preventDefault();
        setActive(true);
      }}
      onDragLeave={() => {
        setActive(false);
      }}
      onDrop={handleDrop}
      aria-label={t("dropzone.browse")}
    >
      <span className="dropzone__icon" aria-hidden="true">
        <IconUpload />
      </span>
      <span className="dropzone__title">
        {active ? t("dropzone.hintActive") : t("dropzone.title")}
      </span>
      <span className="dropzone__hint">{t("dropzone.hint")}</span>
      <span className="dropzone__accepted">{t("dropzone.accepted")}</span>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        className="visually-hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length > 0) onFiles(files);
          e.target.value = "";
        }}
      />
    </button>
  );
}

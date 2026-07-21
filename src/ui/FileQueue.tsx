import type { ReactElement } from "react";
import { useLocale } from "../i18n/locale-context";
import type { InputFile, WatermarkErrorCode, WatermarkResult } from "../core/types";
import type { MessageKey } from "../i18n/messages";
import { IconDownload, IconFile, IconImage, IconTrash } from "./icons";

export type ItemStatus = "pending" | "processing" | "done" | "error";

export interface QueueItem {
  input: InputFile;
  status: ItemStatus;
  result?: WatermarkResult;
  errorCode?: WatermarkErrorCode;
}

interface FileQueueProps {
  items: QueueItem[];
  onDownload: (item: QueueItem) => void;
  onRemove: (id: string) => void;
  onApply: (id: string) => void;
}

const STATUS_KEY: Record<ItemStatus, MessageKey> = {
  pending: "status.pending",
  processing: "status.processing",
  done: "status.done",
  error: "status.error",
};

export function FileQueue({ items, onDownload, onRemove, onApply }: FileQueueProps): ReactElement {
  const { t } = useLocale();

  if (items.length === 0) {
    return <p className="queue__empty">{t("queue.empty")}</p>;
  }

  return (
    <ul className="queue__list">
      {items.map((item) => (
        <li key={item.input.id} className="queue-item">
          <span className="queue-item__icon" aria-hidden="true">
            {item.input.kind === "pdf" ? <IconFile /> : <IconImage />}
          </span>
          <span className="queue-item__body">
            <span className="queue-item__name" title={item.input.name}>
              {item.input.name}
            </span>
            <span className={`queue-item__status queue-item__status--${item.status}`}>
              {item.status === "error" && item.errorCode !== undefined
                ? t(`error.${item.errorCode}`)
                : t(STATUS_KEY[item.status])}
            </span>
          </span>
          <span className="queue-item__actions">
            {item.status === "done" && item.result !== undefined ? (
              <button
                type="button"
                className="icon-button"
                aria-label={t("queue.download")}
                title={t("queue.download")}
                onClick={() => {
                  onDownload(item);
                }}
              >
                <IconDownload />
              </button>
            ) : item.status === "pending" ? (
              <button
                type="button"
                className="text-button"
                onClick={() => {
                  onApply(item.input.id);
                }}
              >
                {t("queue.applyOne")}
              </button>
            ) : null}
            <button
              type="button"
              className="icon-button"
              aria-label={t("queue.remove")}
              title={t("queue.remove")}
              onClick={() => {
                onRemove(item.input.id);
              }}
            >
              <IconTrash />
            </button>
          </span>
        </li>
      ))}
    </ul>
  );
}

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactElement } from "react";
import { useLocale } from "../i18n/locale-context";
import { DEFAULT_CONFIG, WatermarkError } from "../core/types";
import type { WatermarkConfig, WatermarkErrorCode } from "../core/types";
import { WatermarkBridge } from "../core/worker-bridge";
import { ingestFiles } from "../core/ingest";
import { triggerDownload } from "../core/download";
import { zipFiles } from "../core/zip";
import { Dropzone } from "./Dropzone";
import { Controls } from "./Controls";
import { Preview } from "./Preview";
import { FileQueue, type QueueItem } from "./FileQueue";
import { PrivacyPage } from "./PrivacyPage";
import { LicensesPage } from "./LicensesPage";
import { IconDownload, IconShield } from "./icons";

type Route = "home" | "privacy" | "licenses";

const SOURCE_URL = "https://github.com/CustomDigitalServices-Kevin/filigrane-local";

/** Collect the produced bytes of finished items, skipping any without a result. */
function toNamedBytes(items: readonly QueueItem[]): { name: string; bytes: Uint8Array }[] {
  const out: { name: string; bytes: Uint8Array }[] = [];
  for (const item of items) {
    if (item.result !== undefined) {
      out.push({ name: item.result.name, bytes: item.result.bytes });
    }
  }
  return out;
}

export function Shell(): ReactElement {
  const { t, locale, setLocale } = useLocale();
  const [items, setItems] = useState<QueueItem[]>([]);
  const [config, setConfig] = useState<WatermarkConfig>(DEFAULT_CONFIG);
  const [route, setRoute] = useState<Route>("home");
  const [zipping, setZipping] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const bridgeRef = useRef<WatermarkBridge | null>(null);

  if (bridgeRef.current === null) {
    bridgeRef.current = new WatermarkBridge();
  }
  useEffect(() => {
    return () => {
      bridgeRef.current?.dispose();
      bridgeRef.current = null;
    };
  }, []);

  const addFiles = useCallback(
    (files: File[]) => {
      void (async () => {
        const { inputs, rejected } = await ingestFiles(files);
        if (inputs.length > 0) {
          setItems((prev) => [
            ...prev,
            ...inputs.map((input) => ({ input, status: "pending" as const })),
          ]);
        }
        setNotice(
          rejected.length > 0 ? `${t("error.unsupported-drop")} ${rejected.join(", ")}` : null,
        );
      })();
    },
    [t],
  );

  // Paste-to-add from the clipboard.
  useEffect(() => {
    function onPaste(event: ClipboardEvent): void {
      const files = Array.from(event.clipboardData?.files ?? []);
      if (files.length > 0) addFiles(files);
    }
    window.addEventListener("paste", onPaste);
    return () => {
      window.removeEventListener("paste", onPaste);
    };
  }, [addFiles]);

  const updateConfig = useCallback((patch: Partial<WatermarkConfig>) => {
    setConfig((prev) => ({ ...prev, ...patch }));
  }, []);

  const setItemState = useCallback((id: string, patch: Partial<QueueItem>) => {
    setItems((prev) => prev.map((it) => (it.input.id === id ? { ...it, ...patch } : it)));
  }, []);

  const processOne = useCallback(
    async (item: QueueItem): Promise<QueueItem | null> => {
      const bridge = bridgeRef.current;
      if (bridge === null) return null;
      setItemState(item.input.id, { status: "processing" });
      try {
        const result = await bridge.process(item.input, config);
        const done: QueueItem = { input: item.input, status: "done", result };
        setItemState(item.input.id, { status: "done", result });
        return done;
      } catch (err: unknown) {
        const code: WatermarkErrorCode = err instanceof WatermarkError ? err.code : "internal";
        setItemState(item.input.id, { status: "error", errorCode: code });
        return null;
      }
    },
    [config, setItemState],
  );

  const download = useCallback((item: QueueItem) => {
    if (item.result === undefined) return;
    triggerDownload(item.result.bytes, item.result.name, item.result.mime);
  }, []);

  const applyOne = useCallback(
    (id: string) => {
      const item = items.find((it) => it.input.id === id);
      if (item === undefined) return;
      void processOne(item).then((done) => {
        if (done !== null) download(done);
      });
    },
    [items, processOne, download],
  );

  const applyAll = useCallback(() => {
    const pending = items.filter((it) => it.status === "pending" || it.status === "error");
    if (pending.length === 0) return;
    void (async () => {
      const done: QueueItem[] = [];
      for (const item of pending) {
        const result = await processOne(item);
        if (result !== null) done.push(result);
      }
      const single = done[0];
      if (done.length === 1 && single !== undefined) {
        download(single);
      } else if (done.length > 1) {
        setZipping(true);
        try {
          triggerDownload(zipFiles(toNamedBytes(done)), "filigrane.zip", "application/zip");
        } finally {
          setZipping(false);
        }
      }
    })();
  }, [items, processOne, download]);

  const downloadAllZip = useCallback(() => {
    const named = toNamedBytes(items);
    if (named.length === 0) return;
    setZipping(true);
    try {
      triggerDownload(zipFiles(named), "filigrane.zip", "application/zip");
    } finally {
      setZipping(false);
    }
  }, [items]);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((it) => it.input.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setItems([]);
    setNotice(null);
  }, []);

  const firstFile = items[0]?.input ?? null;
  const hasDone = useMemo(() => items.some((it) => it.status === "done"), [items]);
  const hasActionable = useMemo(
    () => items.some((it) => it.status === "pending" || it.status === "error"),
    [items],
  );

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__brand">
          <span className="app__logo" aria-hidden="true">
            <IconShield />
          </span>
          <div>
            <h1 className="app__title">{t("app.title")}</h1>
            <p className="app__tagline">{t("app.tagline")}</p>
          </div>
        </div>
        <nav className="app__nav" aria-label={t("app.title")}>
          <button
            type="button"
            className={route === "home" ? "nav-link is-active" : "nav-link"}
            onClick={() => {
              setRoute("home");
            }}
          >
            {t("nav.home")}
          </button>
          <button
            type="button"
            className={route === "privacy" ? "nav-link is-active" : "nav-link"}
            onClick={() => {
              setRoute("privacy");
            }}
          >
            {t("nav.privacy")}
          </button>
          <button
            type="button"
            className={route === "licenses" ? "nav-link is-active" : "nav-link"}
            onClick={() => {
              setRoute("licenses");
            }}
          >
            {t("nav.licenses")}
          </button>
          <button
            type="button"
            className="lang-toggle"
            onClick={() => {
              setLocale(locale === "fr" ? "en" : "fr");
            }}
            aria-label={locale === "fr" ? "Switch to English" : "Passer en français"}
          >
            {locale === "fr" ? "EN" : "FR"}
          </button>
        </nav>
      </header>

      <p className="app__banner">
        <IconShield aria-hidden="true" />
        {t("app.localBanner")}
      </p>

      <main className="app__main">
        {route === "home" ? (
          <div className="layout">
            <div className="layout__left">
              <Dropzone onFiles={addFiles} />
              {notice !== null ? <p className="notice">{notice}</p> : null}
              <div className="panel">
                <div className="panel__head">
                  <h2 className="panel__title">{t("queue.heading")}</h2>
                  {items.length > 0 ? (
                    <button type="button" className="text-button" onClick={clearAll}>
                      {t("queue.clear")}
                    </button>
                  ) : null}
                </div>
                <FileQueue
                  items={items}
                  onDownload={download}
                  onRemove={removeItem}
                  onApply={applyOne}
                />
                {items.length > 0 ? (
                  <div className="queue__footer">
                    <button
                      type="button"
                      className="button button--primary"
                      onClick={applyAll}
                      disabled={!hasActionable || zipping}
                    >
                      <IconDownload aria-hidden="true" />
                      {zipping ? t("queue.zipWorking") : t("queue.applyAll")}
                    </button>
                    {hasDone ? (
                      <button
                        type="button"
                        className="button"
                        onClick={downloadAllZip}
                        disabled={zipping}
                      >
                        {t("queue.downloadAllZip")}
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="layout__right">
              <div className="panel">
                <Controls config={config} onChange={updateConfig} />
              </div>
              <div className="panel">
                <Preview file={firstFile} config={config} />
              </div>
            </div>
          </div>
        ) : route === "privacy" ? (
          <BackWrap
            onBack={() => {
              setRoute("home");
            }}
          >
            <PrivacyPage />
          </BackWrap>
        ) : (
          <BackWrap
            onBack={() => {
              setRoute("home");
            }}
          >
            <LicensesPage />
          </BackWrap>
        )}
      </main>

      <footer className="app__footer">
        <span>{t("footer.madeBy")}</span>
        <a href={SOURCE_URL} target="_blank" rel="noreferrer">
          {t("footer.source")}
        </a>
      </footer>
    </div>
  );
}

function BackWrap({
  children,
  onBack,
}: {
  children: ReactElement;
  onBack: () => void;
}): ReactElement {
  const { t } = useLocale();
  return (
    <div>
      <button type="button" className="text-button" onClick={onBack}>
        {"< "}
        {t("nav.back")}
      </button>
      {children}
    </div>
  );
}

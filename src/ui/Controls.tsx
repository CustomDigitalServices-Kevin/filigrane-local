import type { ChangeEvent, ReactElement } from "react";
import { useLocale } from "../i18n/locale-context";
import type { MessageKey } from "../i18n/messages";
import type { SinglePosition, WatermarkConfig } from "../core/types";

interface ControlsProps {
  config: WatermarkConfig;
  onChange: (patch: Partial<WatermarkConfig>) => void;
}

const PRESETS: MessageKey[] = [
  "controls.preset.confidential",
  "controls.preset.copy",
  "controls.preset.draft",
  "controls.preset.specimen",
];

const POSITIONS: SinglePosition[] = [
  "center",
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
];

export function Controls({ config, onChange }: ControlsProps): ReactElement {
  const { t } = useLocale();

  function onLogo(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0];
    if (file === undefined) return;
    const format = file.type === "image/png" ? "png" : "jpeg";
    void file.arrayBuffer().then((buf) => {
      onChange({ imageBytes: new Uint8Array(buf), imageFormat: format });
    });
    event.target.value = "";
  }

  return (
    <section className="controls" aria-label={t("controls.heading")}>
      <h2 className="panel__title">{t("controls.heading")}</h2>

      <div className="control-group">
        <span className="control-label">{t("controls.mode")}</span>
        <div className="segmented" role="group">
          <button
            type="button"
            className={config.mode === "text" ? "segmented__btn is-on" : "segmented__btn"}
            onClick={() => {
              onChange({ mode: "text" });
            }}
          >
            {t("controls.mode.text")}
          </button>
          <button
            type="button"
            className={config.mode === "image" ? "segmented__btn is-on" : "segmented__btn"}
            onClick={() => {
              onChange({ mode: "image" });
            }}
          >
            {t("controls.mode.image")}
          </button>
        </div>
      </div>

      {config.mode === "text" ? (
        <>
          <label className="control-group">
            <span className="control-label">{t("controls.text")}</span>
            <input
              type="text"
              className="text-input"
              value={config.text}
              placeholder={t("controls.textPlaceholder")}
              onChange={(e) => {
                onChange({ text: e.target.value });
              }}
            />
          </label>

          <div className="control-group">
            <span className="control-label">{t("controls.presetHeading")}</span>
            <div className="preset-row">
              {PRESETS.map((key) => (
                <button
                  key={key}
                  type="button"
                  className="preset-chip"
                  onClick={() => {
                    onChange({ text: t(key) });
                  }}
                >
                  {t(key)}
                </button>
              ))}
            </div>
          </div>

          <Range
            label={`${t("controls.fontSize")} (${String(config.fontSize)})`}
            min={8}
            max={120}
            step={1}
            value={config.fontSize}
            onChange={(v) => {
              onChange({ fontSize: v });
            }}
          />

          <label className="control-group control-group--inline">
            <span className="control-label">{t("controls.color")}</span>
            <input
              type="color"
              className="color-input"
              value={config.color}
              onChange={(e) => {
                onChange({ color: e.target.value });
              }}
            />
          </label>
        </>
      ) : (
        <>
          <div className="control-group">
            <span className="control-label">{t("controls.logo")}</span>
            <label className="file-button">
              {t("controls.logoUpload")}
              <input
                type="file"
                accept="image/png,image/jpeg"
                className="visually-hidden"
                onChange={onLogo}
              />
            </label>
            {config.imageBytes === null ? (
              <span className="control-hint">{t("controls.logoMissing")}</span>
            ) : null}
          </div>

          <Range
            label={`${t("controls.logoScale")} (${String(Math.round(config.imageScale * 100))}%)`}
            min={5}
            max={80}
            step={1}
            value={Math.round(config.imageScale * 100)}
            onChange={(v) => {
              onChange({ imageScale: v / 100 });
            }}
          />
        </>
      )}

      <Range
        label={`${t("controls.opacity")} (${String(Math.round(config.opacity * 100))}%)`}
        min={5}
        max={100}
        step={1}
        value={Math.round(config.opacity * 100)}
        onChange={(v) => {
          onChange({ opacity: v / 100 });
        }}
      />

      <Range
        label={`${t("controls.rotation")} (${String(config.rotation)}°)`}
        min={-90}
        max={90}
        step={1}
        value={config.rotation}
        onChange={(v) => {
          onChange({ rotation: v });
        }}
      />

      <div className="control-group">
        <span className="control-label">{t("controls.layout")}</span>
        <div className="segmented" role="group">
          <button
            type="button"
            className={config.layout === "tiled" ? "segmented__btn is-on" : "segmented__btn"}
            onClick={() => {
              onChange({ layout: "tiled" });
            }}
          >
            {t("controls.layout.tiled")}
          </button>
          <button
            type="button"
            className={config.layout === "single" ? "segmented__btn is-on" : "segmented__btn"}
            onClick={() => {
              onChange({ layout: "single" });
            }}
          >
            {t("controls.layout.single")}
          </button>
        </div>
      </div>

      {config.layout === "tiled" ? (
        <Range
          label={`${t("controls.density")} (${String(Math.round(config.tileGap * 100))}%)`}
          min={0}
          max={200}
          step={5}
          value={Math.round(config.tileGap * 100)}
          onChange={(v) => {
            onChange({ tileGap: v / 100 });
          }}
        />
      ) : (
        <label className="control-group">
          <span className="control-label">{t("controls.position")}</span>
          <select
            className="select-input"
            value={config.position}
            onChange={(e) => {
              onChange({ position: e.target.value as SinglePosition });
            }}
          >
            {POSITIONS.map((p) => (
              <option key={p} value={p}>
                {t(`controls.position.${p}`)}
              </option>
            ))}
          </select>
        </label>
      )}
    </section>
  );
}

interface RangeProps {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
}

function Range({ label, min, max, step, value, onChange }: RangeProps): ReactElement {
  return (
    <label className="control-group">
      <span className="control-label">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        className="range-input"
        onChange={(e) => {
          onChange(Number(e.target.value));
        }}
      />
    </label>
  );
}

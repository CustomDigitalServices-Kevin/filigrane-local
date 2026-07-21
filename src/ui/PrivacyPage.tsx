import type { ReactElement } from "react";
import { useLocale } from "../i18n/locale-context";
import { IconShield } from "./icons";

export function PrivacyPage(): ReactElement {
  const { t } = useLocale();
  return (
    <div className="doc-page">
      <h1 className="doc-page__title">
        <span className="doc-page__title-icon" aria-hidden="true">
          <IconShield />
        </span>
        {t("privacy.title")}
      </h1>
      <p className="doc-page__lead">{t("privacy.lead")}</p>
      <p className="doc-page__p">{t("privacy.p1")}</p>
      <p className="doc-page__p">{t("privacy.p2")}</p>
      <p className="doc-page__p">{t("privacy.p3")}</p>
      <p className="doc-page__p">{t("privacy.p4")}</p>
    </div>
  );
}

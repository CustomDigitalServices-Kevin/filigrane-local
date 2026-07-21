import type { ReactElement } from "react";
import { useLocale } from "../i18n/locale-context";
import { LICENSES } from "./licenses-data";

export function LicensesPage(): ReactElement {
  const { t, locale } = useLocale();
  return (
    <div className="doc-page">
      <h1 className="doc-page__title">{t("licenses.title")}</h1>
      <p className="doc-page__lead">{t("licenses.lead")}</p>
      <table className="licenses-table">
        <thead>
          <tr>
            <th>{t("licenses.col.name")}</th>
            <th>{t("licenses.col.license")}</th>
            <th>{t("licenses.col.usage")}</th>
          </tr>
        </thead>
        <tbody>
          {LICENSES.map((entry) => (
            <tr key={entry.name}>
              <td>
                <code>{entry.name}</code>
              </td>
              <td>{entry.license}</td>
              <td>{locale === "fr" ? entry.usageFr : entry.usageEn}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

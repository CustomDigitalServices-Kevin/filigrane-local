import type { ReactElement, SVGProps } from "react";

// Inline stroke icons (currentColor), no icon-font dependency. 24x24 grid.
type IconProps = SVGProps<SVGSVGElement>;

function base(props: IconProps, path: ReactElement): ReactElement {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {path}
    </svg>
  );
}

export function IconUpload(props: IconProps): ReactElement {
  return base(
    props,
    <>
      <path d="M12 15V4" />
      <path d="m7 9 5-5 5 5" />
      <path d="M20 16v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3" />
    </>,
  );
}

export function IconDownload(props: IconProps): ReactElement {
  return base(
    props,
    <>
      <path d="M12 4v11" />
      <path d="m7 10 5 5 5-5" />
      <path d="M20 16v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3" />
    </>,
  );
}

export function IconTrash(props: IconProps): ReactElement {
  return base(
    props,
    <>
      <path d="M4 7h16" />
      <path d="M10 11v6M14 11v6" />
      <path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
      <path d="M9 7V4h6v3" />
    </>,
  );
}

export function IconFile(props: IconProps): ReactElement {
  return base(
    props,
    <>
      <path d="M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7z" />
      <path d="M14 3v4h4" />
    </>,
  );
}

export function IconImage(props: IconProps): ReactElement {
  return base(
    props,
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <circle cx="9" cy="9" r="1.5" />
      <path d="m5 17 4-4 3 3 3-3 4 4" />
    </>,
  );
}

export function IconShield(props: IconProps): ReactElement {
  return base(
    props,
    <>
      <path d="M12 3 5 6v6c0 4 3 6.5 7 9 4-2.5 7-5 7-9V6z" />
      <path d="m9 12 2 2 4-4" />
    </>,
  );
}

export function IconSpinner(props: IconProps): ReactElement {
  return base(
    props,
    <>
      <path d="M12 3a9 9 0 1 0 9 9" />
    </>,
  );
}

import { useId } from "react";
export function PlantIllustration({
  leaves = 0,
  className = "",
}: {
  leaves?: number;
  className?: string;
}) {
  const id = useId();
  return (
    <svg
      className={`plant-art ${className}`}
      viewBox="0 0 300 280"
      aria-hidden="true"
    >
      <defs>
        <clipPath id={id}>
          <path d="M99 193h102l-12 65c-2 8-12 13-39 13s-37-5-39-13z" />
        </clipPath>
      </defs>
      <ellipse cx="150" cy="267" rx="71" ry="8" fill="#173d2c" opacity=".08" />
      <path
        d="M150 202v-93"
        fill="none"
        stroke="#326748"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path d="M148 149C104 153 72 124 83 93c39-1 65 22 65 56" fill="#729878" />
      <path d="M152 123c-4-39 21-70 57-70 13 37-13 68-57 70" fill="#346c4e" />
      <path d="M146 179c-42-2-63-23-62-48 34-4 59 15 62 48" fill="#477d55" />
      {leaves > 0 && (
        <path d="M153 169c-1-38 31-57 64-45-3 34-27 49-64 45" fill="#9abd83" />
      )}
      {leaves > 1 && (
        <path
          d="M148 119c-27-17-40-48-23-70 29 12 38 42 23 70"
          fill="#9fbf87"
        />
      )}
      {leaves > 2 && (
        <path d="M152 97c-2-31 17-48 39-49 8 26-8 46-39 49" fill="#5b8e62" />
      )}
      {leaves > 3 && (
        <path d="M144 151c-52-8-82-43-66-68 35 6 62 32 66 68" fill="#b0c89c" />
      )}
      {leaves > 4 && (
        <path d="M155 187c26-27 60-29 78-6-20 26-52 28-78 6" fill="#638d5d" />
      )}
      {leaves > 5 && (
        <>
          <path d="M149 108V45" stroke="#326748" strokeWidth="4" />
          <circle cx="149" cy="39" r="11" fill="#d8b965" />
          <circle cx="149" cy="39" r="4" fill="#f6e7bb" />
        </>
      )}
      <path
        d="M99 193h102l-12 65c-2 8-12 13-39 13s-37-5-39-13z"
        fill="#e5d3b8"
      />
      <path d="M99 193h44v80H99z" fill="#d4bea0" clipPath={`url(#${id})`} />
      <ellipse cx="150" cy="194" rx="51" ry="9" fill="#af9477" />
      <ellipse cx="150" cy="192" rx="43" ry="5" fill="#715c44" />
      <path
        d="M104 210c24 9 68 10 92 0"
        fill="none"
        stroke="#f0e3d0"
        strokeWidth="2"
      />
      <path d="M149 193v-15" stroke="#326748" strokeWidth="6" />
    </svg>
  );
}
export function BossIllustration({ defeated = false }: { defeated?: boolean }) {
  return (
    <svg
      viewBox="0 0 240 210"
      className={`boss-art ${defeated ? "defeated" : ""}`}
      aria-hidden="true"
    >
      <ellipse cx="120" cy="190" rx="78" ry="9" fill="#223a40" opacity=".08" />
      <circle cx="71" cy="111" r="45" fill="#576c72" />
      <circle cx="169" cy="111" r="45" fill="#576c72" />
      <circle cx="120" cy="76" r="57" fill="#687d80" />
      <circle cx="120" cy="133" r="54" fill="#576c72" />
      <circle cx="87" cy="53" r="19" fill="#7d9190" />
      {defeated ? (
        <>
          <path
            d="m78 104 18 10m-18 0 18-10m48 0 18 10m-18 0 18-10"
            stroke="#d5e4df"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="m101 149 19-4 19 4"
            stroke="#d5e4df"
            fill="none"
            strokeWidth="4"
          />
        </>
      ) : (
        <>
          <path
            d="m78 89 24 9m60-9-24 9"
            stroke="#223d43"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <ellipse cx="92" cy="116" rx="8" ry="11" fill="#efc777" />
          <ellipse cx="148" cy="116" rx="8" ry="11" fill="#efc777" />
          <path
            d="m96 151 12-7 12 8 12-8 12 7"
            stroke="#263f45"
            fill="none"
            strokeWidth="5"
            strokeLinejoin="round"
          />
        </>
      )}
      <circle cx="38" cy="69" r="10" fill="#c0ceca" />
      <circle cx="194" cy="43" r="13" fill="#c0ceca" />
      <circle cx="208" cy="82" r="6" fill="#d4deda" />
    </svg>
  );
}
export function OfficeIllustration() {
  return (
    <svg
      className="office-art"
      viewBox="0 0 620 450"
      role="img"
      aria-label="辦公室中的綠色植物、電腦、差旅與碳魔王"
    >
      <path d="m60 303 250-133 258 137-248 137z" fill="#dae7dc" />
      <path d="M60 303V96l250-68v142z" fill="#eaf0e5" />
      <path d="M310 28v142l258 137V105z" fill="#f1ecdf" />
      <path d="m94 113 170-45v102L94 242z" fill="#fcfdf7" />
      <path d="m108 130 140-37v64l-140 62z" fill="#d3e5e6" />
      <path d="M178 110v79" stroke="#fff" strokeWidth="5" />
      <path d="m108 178 140-48" stroke="#fff" strokeWidth="4" />
      <path d="m342 78 169 50v101l-169-74z" fill="#fffdf6" />
      <path
        d="m363 114 120 37m-120-12 88 30"
        stroke="#ddd9cb"
        strokeWidth="7"
      />
      <path d="m145 283 152-76 145 74-153 77z" fill="#a8b5a0" />
      <path d="m145 283 144 75v12l-144-75z" fill="#82947d" />
      <path d="m289 358 153-77v12l-153 77z" fill="#8e9e85" />
      <path
        d="M165 304v60m250-60v60m-128 9v43"
        stroke="#5a7463"
        strokeWidth="8"
      />
      <path d="m265 206 65 24v63l-65-25z" fill="#335e53" />
      <path d="m272 216 51 19v44l-51-19z" fill="#b3d7cc" />
      <path d="m279 286 30 12-13 7-30-12z" fill="#678674" />
      <path d="m211 293 35-17 43 21-36 18z" fill="#f9faf1" />
      <path d="m218 295 22-10m-14 17 22-11" stroke="#b3c0ad" strokeWidth="3" />
      <g transform="translate(351 205) scale(.28)">
        <path d="M105 193h90l-10 66h-70z" fill="#ddc5a5" />
        <ellipse cx="150" cy="193" rx="45" ry="8" fill="#a68b6b" />
        <path d="M150 193V88" stroke="#46724e" strokeWidth="6" />
        <path d="M146 154c-38-1-56-23-47-46 33 0 48 15 47 46" fill="#769a6a" />
        <path d="M153 125c-2-34 24-57 52-47 1 29-18 47-52 47" fill="#3b7350" />
      </g>
      <path d="m427 327 47-24 23 12-47 25z" fill="#e6c878" />
      <path d="M450 340v49l47-25v-49" fill="#c9aa60" />
      <path d="m427 327 23 13v49l-23-13z" fill="#d7b96d" />
      <path d="M112 270v44l30 15 29-15v-44" fill="#d6bda0" />
      <ellipse cx="142" cy="270" rx="30" ry="11" fill="#e5d2b9" />
      <path d="M142 273V200" stroke="#447255" strokeWidth="5" />
      <path d="M141 235c-31 1-47-18-42-38 28-2 42 14 42 38" fill="#84a47c" />
      <path d="M145 219c-4-28 13-45 37-44 7 24-11 43-37 44" fill="#3b7755" />
      <g transform="translate(425 17) scale(.65)">
        <circle cx="71" cy="111" r="45" fill="#576c72" />
        <circle cx="169" cy="111" r="45" fill="#576c72" />
        <circle cx="120" cy="76" r="57" fill="#687d80" />
        <circle cx="120" cy="133" r="54" fill="#576c72" />
        <circle cx="87" cy="53" r="19" fill="#7d9190" />
        <path
          d="m78 89 24 9m60-9-24 9"
          stroke="#223d43"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <ellipse cx="92" cy="116" rx="8" ry="11" fill="#efc777" />
        <ellipse cx="148" cy="116" rx="8" ry="11" fill="#efc777" />
        <path
          d="m96 151 12-7 12 8 12-8 12 7"
          stroke="#263f45"
          fill="none"
          strokeWidth="5"
          strokeLinejoin="round"
        />
      </g>
      <path d="m381 342 18-8 22 11-18 9z" fill="#f7f8ef" />
      <path d="m389 341 7-3 10 5-7 3z" fill="#6e9c84" />
      <circle cx="319" cy="122" r="12" fill="#e8c77f" />
      <path d="m315 122 3 3 6-7" fill="none" stroke="#fff" strokeWidth="2" />
    </svg>
  );
}

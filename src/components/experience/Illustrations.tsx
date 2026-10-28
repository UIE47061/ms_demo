import { useId } from "react";
import { OfficeWorld } from "./ActionArt";
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
      <g className="plant-face" fill="#203D32">
        <circle cx="133" cy="228" r="3.5" />
        <circle cx="165" cy="228" r="3.5" />
        <path
          d="M143 239q7 7 14 0"
          fill="none"
          stroke="#203D32"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <ellipse cx="123" cy="236" rx="6" ry="3" fill="#DB9777" />
        <ellipse cx="175" cy="236" rx="6" ry="3" fill="#DB9777" />
      </g>
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
  return <OfficeWorld />;
}

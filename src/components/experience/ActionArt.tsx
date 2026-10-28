import { useEffect, useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import { useDemo } from "../../store/demo";
import { growth } from "../../utils/experience";

export type ActionKind = "travel" | "recycle" | "teams" | "insights";
const ink = "#203D32";

function Drawing({ kind }: { kind: ActionKind }) {
  if (kind === "travel")
    return (
      <>
        <path d="M12 145h216M28 156h185" stroke="#B2CBCB" />
        <g className="scene-train">
          <path d="M23 80h127c31 0 51 26 67 48H23z" fill="#FFFDF8" />
          <path d="M23 122h190l4 6H23z" fill="#00A4EF" stroke="none" />
          <path d="M144 88h12c14 6 24 16 33 28h-45z" fill="#B4E0EF" />
          <rect x="38" y="90" width="24" height="22" rx="4" fill="#B4E0EF" />
          <rect x="75" y="90" width="24" height="22" rx="4" fill="#B4E0EF" />
          <rect x="112" y="90" width="20" height="22" rx="4" fill="#B4E0EF" />
          <circle cx="58" cy="132" r="8" fill={ink} />
          <circle cx="165" cy="132" r="8" fill={ink} />
        </g>
        <g transform="translate(143 16) rotate(9 30 35)">
          <path
            d="M0 0h63v24a7 7 0 0 0 0 14v26H0V38a7 7 0 0 0 0-14z"
            fill="#FFCF59"
          />
          <path d="M13 15h37M13 24h24M13 48h37" stroke={ink} />
          <path d="M41 31v10m4-10v10m5-10v10" strokeWidth="2" />
        </g>
        <path
          d="m39 54 6-9 8 9m-8-9v20M78 38l6-9 8 9m-8-9v20"
          stroke="#397DA8"
        />
      </>
    );
  if (kind === "recycle")
    return (
      <>
        <ellipse
          cx="121"
          cy="153"
          rx="80"
          ry="7"
          fill="#C4DAB2"
          stroke="none"
        />
        <path d="M68 66h101l-9 79H78z" fill="#E9F4CD" />
        <path d="M62 56h113v14H62z" fill="#7FBA00" />
        <path d="M91 43h54v13H91z" fill="#93C950" />
        <path
          d="m119 91 9 14-8 1m8-1-16 2m29 17-17 1 3-8m-3 8-7-15m-20 11 8-15 5 6m-5-6 18 1"
          fill="none"
          stroke="#4D7A00"
          strokeWidth="4"
        />
        <g className="scene-bottle" transform="rotate(19 189 65)">
          <path d="M183 28h16v20l8 12v37h-31V60l7-12z" fill="#B4E0EF" />
          <path d="M181 28h20v-8h-20z" fill="#00A4EF" />
          <path d="M176 67h31v17h-31z" fill="#FFFDF8" />
        </g>
        <path
          d="M34 89c-6-20 5-38 23-42m-5-5 7 4-4 8"
          fill="none"
          stroke="#7FBA00"
          strokeWidth="3"
        />
        <circle cx="39" cy="124" r="15" fill="#FFCF59" />
        <path d="m32 124 5 5 9-10" fill="none" />
      </>
    );
  if (kind === "teams")
    return (
      <>
        <rect x="33" y="49" width="163" height="94" rx="9" fill="#FFFDF8" />
        <rect x="43" y="59" width="143" height="71" rx="3" fill="#E9E5F7" />
        <path d="M19 144h190l-12 12H31z" fill="#B3A5D4" />
        <path
          d="M111 81a18 18 0 1 0 20 25 20 20 0 0 1-20-25"
          fill="#7060AA"
          stroke="none"
        />
        <g className="scene-notification">
          <path
            d="M135 14h80a10 10 0 0 1 10 10v40a10 10 0 0 1-10 10h-55l-14 13V74h-11a10 10 0 0 1-10-10V24a10 10 0 0 1 10-10z"
            fill="#7060AA"
          />
          <path
            d="m147 43 9 9 20-21"
            stroke="#FFF"
            strokeWidth="5"
            fill="none"
          />
          <path d="M188 37h19m-19 13h13" stroke="#DCD5F1" strokeWidth="3" />
        </g>
        <path d="M28 97V78m-6 9h12" stroke="#FFB900" strokeWidth="3" />
      </>
    );
  return (
    <>
      <rect x="35" y="28" width="173" height="116" rx="10" fill="#FFFDF8" />
      <path d="M35 53h173" stroke="#CCD7C9" />
      <circle cx="47" cy="41" r="3" fill="#F25022" stroke="none" />
      <circle cx="58" cy="41" r="3" fill="#FFB900" stroke="none" />
      <circle cx="69" cy="41" r="3" fill="#7FBA00" stroke="none" />
      <path d="M53 124V77m0 47h83" stroke="#CAD8CF" />
      <rect
        x="65"
        y="99"
        width="14"
        height="25"
        rx="2"
        fill="#B6D77C"
        stroke="none"
      />
      <rect
        x="88"
        y="85"
        width="14"
        height="39"
        rx="2"
        fill="#7FBA00"
        stroke="none"
      />
      <rect
        x="111"
        y="70"
        width="14"
        height="54"
        rx="2"
        fill="#26734D"
        stroke="none"
      />
      <circle cx="170" cy="92" r="24" fill="#FFCF59" stroke="none" />
      <path d="M170 68a24 24 0 0 1 23 30l-23-6z" fill="#00A4EF" stroke="none" />
      <circle cx="170" cy="92" r="13" fill="#FFFDF8" stroke="none" />
      <path d="M54 154h138" stroke="#B6CBB8" />
      <circle cx="211" cy="146" r="18" fill="#7FBA00" />
      <path d="m204 145 5 5 10-11" fill="none" stroke="#FFF" strokeWidth="3" />
    </>
  );
}

export function ActionArt({
  kind,
  className = "",
}: {
  kind: ActionKind;
  className?: string;
}) {
  return (
    <svg
      className={`action-art ${className}`}
      viewBox="0 0 240 180"
      aria-hidden="true"
      fill="none"
      stroke={ink}
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Drawing kind={kind} />
    </svg>
  );
}

export function OfficeWorld({ animated = false }: { animated?: boolean }) {
  return (
    <svg
      className={`office-world ${animated ? "is-playing" : ""}`}
      viewBox="0 0 640 500"
      role="img"
      aria-label="綠色辦公室：搭車、回收、離座節能與團隊數據，串成一段日常行動"
      fill="none"
      stroke={ink}
      strokeWidth="2.5"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <rect
        x="20"
        y="24"
        width="600"
        height="446"
        rx="32"
        fill="#EDF5DF"
        stroke="none"
      />
      <circle cx="503" cy="99" r="55" fill="#FFCF59" stroke="none" />
      <path d="M49 430h543M75 447h309" stroke="#B7CDA4" />
      <path d="m95 197 218-95 235 99v197l-225 63L95 366z" fill="#FFFDF5" />
      <path d="m95 197 227 95 226-91M322 292v169" stroke="#B7CDA4" />
      <path d="m95 197 218-95 235 99-226 91z" fill="#D4E7B9" />
      <path d="M141 181V96l144-59v111z" fill="#CCE8F0" />
      <path d="m141 181 144-59m-72-56v86" stroke="#FFFDF5" strokeWidth="6" />
      <path d="m143 260 139 53-1 16-138-53z" fill="#EAC8A4" />
      <path d="M157 283v52m112 0v49" strokeWidth="7" />
      <g className="scene-monitor">
        <path d="m185 207 68 26v57l-68-26z" fill="#26734D" />
        <path d="m193 219 52 20v38l-52-20z" fill="#C6E5DC" />
        <path d="m214 276 1 19 18 7" />
        <path d="m169 258 22-10 39 15-21 10z" fill="#FFFDF5" />
      </g>
      <g className="scene-person">
        <path d="m333 295 51 22v57l-51-21z" fill="#00A4EF" />
        <path d="m344 361-9 38m32-28v41" stroke={ink} strokeWidth="9" />
        <path d="m345 306-16-23-24 9" stroke="#E7B394" strokeWidth="12" />
        <circle cx="360" cy="279" r="20" fill="#E7B394" />
        <path
          d="M339 277c-8-26 30-35 41-12l-22-1-6 16z"
          fill={ink}
          stroke="none"
        />
        <path d="m339 399-14 7m42 6 12 6" strokeWidth="7" />
      </g>
      <g transform="translate(424 268)">
        <path d="M0 0h53v74H0z" fill="#7FBA00" />
        <path d="M-5-9h63V4H-5z" fill="#4D7A00" />
        <rect x="12" y="17" width="29" height="27" rx="5" fill="#FFFDF5" />
        <path d="m18 32 5 5 12-14" />
      </g>
      <g className="scene-plant" transform="translate(110 300)">
        <path d="M-23 27h49l-6 45h-36z" fill="#E8B889" />
        <path d="M2 28v-64" strokeWidth="4" />
        <path d="M0-9c-30 2-39-16-34-31 25-2 34 10 34 31" fill="#7FBA00" />
        <path d="M3-23c-2-30 15-43 35-38 3 22-11 36-35 38" fill="#26734D" />
        <path d="m-6 49 4 2m12-2 4-2" />
        <path d="M0 60q6 5 12-1" />
      </g>
      <g className="scene-notification" transform="translate(334 39)">
        <path
          d="M0 0h132a12 12 0 0 1 12 12v53a12 12 0 0 1-12 12H44L23 95V77H0A12 12 0 0 1-12 65V12A12 12 0 0 1 0 0z"
          fill="#FFFDF8"
        />
        <rect
          x="5"
          y="16"
          width="36"
          height="36"
          rx="9"
          fill="#7060AA"
          stroke="none"
        />
        <path d="m15 33 6 6 12-14" stroke="#FFF" strokeWidth="4" />
        <path
          d="M57 25h59m-59 15h42m-42 15h29"
          stroke="#B5C3B9"
          strokeWidth="4"
        />
      </g>
      <g transform="translate(445 155)">
        <path
          d="M0 31c-19-19-1-48 22-39 13-24 45-13 45 9 22-2 34 24 18 39H1z"
          fill="#5E6A75"
        />
        <path d="m22 16 12 4m25-4-12 4" stroke="#22352E" strokeWidth="4" />
        <circle cx="28" cy="27" r="4" fill="#FFCF59" stroke="none" />
        <circle cx="54" cy="27" r="4" fill="#FFCF59" stroke="none" />
        <path d="m31 41 9-5 8 6 7-4" stroke="#D6DFD8" />
      </g>
      <g className="scene-train" transform="translate(22 365) scale(.66)">
        <path d="M0 0h143c27 0 55 24 75 53H0z" fill="#FFFDF8" />
        <path d="M0 42h210v11H0z" fill="#00A4EF" stroke="none" />
        <rect x="17" y="10" width="25" height="24" rx="4" fill="#B4E0EF" />
        <rect x="54" y="10" width="25" height="24" rx="4" fill="#B4E0EF" />
        <rect x="91" y="10" width="25" height="24" rx="4" fill="#B4E0EF" />
        <path d="M139 10h10c15 8 27 18 34 26h-44z" fill="#B4E0EF" />
        <circle cx="36" cy="58" r="8" fill={ink} />
        <circle cx="167" cy="58" r="8" fill={ink} />
      </g>
      <path
        d="M51 218v20m-10-10h20m499 92v18m-9-9h18"
        stroke="#7FBA00"
        strokeWidth="4"
      />
      <circle cx="521" cy="423" r="21" fill="#FFCF59" />
      <path d="m513 423 6 6 12-14" strokeWidth="3" />
    </svg>
  );
}

export function OfficePlayground() {
  const { state } = useDemo();
  const g = growth(state);
  const [playing, setPlaying] = useState(false);
  const [take, setTake] = useState(0);
  useEffect(() => {
    if (!playing) return;
    const timer = setTimeout(() => setPlaying(false), 5200);
    return () => clearTimeout(timer);
  }, [playing, take]);
  return (
    <div className="office-playground">
      <div className="world-caption">
        <span className="live-dot" />
        青禾辦公室 <span>一起，把日常變綠。</span>
      </div>
      <OfficeWorld key={take} animated={playing} />
      <div className="world-controls">
        <div>
          <span>團隊行動挑戰</span>
          <b>
            碳魔王 HP <strong>{g.hp}</strong>
            <small> / 100</small>
          </b>
          <div
            className="world-hp"
            aria-label={`遊戲進度：碳魔王剩餘 ${g.hp}%`}
          >
            <i style={{ width: `${g.hp}%` }} />
          </div>
        </div>
        <button
          type="button"
          className="world-play"
          aria-pressed={playing}
          onClick={() => {
            setTake((t) => t + 1);
            setPlaying(true);
          }}
        >
          {playing ? <RotateCcw size={16} /> : <Play size={16} />}
          <span>{playing ? "重新播放" : "播放行動場景"}</span>
        </button>
      </div>
    </div>
  );
}

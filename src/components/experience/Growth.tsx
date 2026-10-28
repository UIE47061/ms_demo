import { ArrowUpRight, Coins } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useDemo } from "../../store/demo";
import { growth } from "../../utils/experience";
import { BossIllustration, PlantIllustration } from "./Illustrations";
export function GrowthCard() {
  const { state } = useDemo();
  const g = growth(state);
  const prev = useRef(g.claimed);
  const [growing, setGrowing] = useState(false);
  useEffect(() => {
    if (g.claimed > prev.current) setGrowing(true);
    prev.current = g.claimed;
    const t = setTimeout(() => setGrowing(false), 650);
    return () => clearTimeout(t);
  }, [g.claimed]);
  return (
    <section
      className={`growth-card ${growing ? "growing" : ""}`}
      aria-label="我的綠色夥伴"
    >
      <div className="growth-copy">
        <span className="micro-label">我的綠色夥伴</span>
        <h2>
          一點行動，
          <br />
          長成日常。
        </h2>
        <span className="growth-level">Lv.{g.level} 綠色探索家</span>
        <div className="growth-exp">
          <span>{state.exp % 500} / 500 EXP</span>
          <div className="progress">
            <i style={{ width: `${(state.exp % 500) / 5}%` }} />
          </div>
        </div>
      </div>
      <PlantIllustration leaves={g.claimed} />
      <div className="growth-bottom">
        <Link to="/app/profile">
          <Coins size={16} />
          <strong>{state.coins}</strong> 碳幣 <ArrowUpRight size={14} />
        </Link>
        <span data-testid="growth-leaves">
          {g.claimed} / {g.total} 片行動新葉
        </span>
      </div>
    </section>
  );
}
export function BossChallenge() {
  const { state } = useDemo();
  const g = growth(state);
  return (
    <section className="boss-challenge" aria-label="碳魔王挑戰">
      <div>
        <span className="micro-label">本輪行動挑戰</span>
        <h2>{g.hp === 0 ? "這一輪，我們做到了。" : "給碳魔王一點壓力。"}</h2>
        <p>完成任務並領獎，讓挑戰向前一步。</p>
        <div className="boss-hp-label">
          <span>碳魔王 HP</span>
          <b data-testid="boss-hp">{g.hp} / 100</b>
        </div>
        <div
          className="boss-hp"
          role="progressbar"
          aria-label="碳魔王剩餘 HP"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={g.hp}
        >
          <i style={{ width: `${g.hp}%` }} />
        </div>
        <small>
          {g.claimed} / {g.total} 項獎勵已領取 · 遊戲進度，不抵銷排放
        </small>
      </div>
      <BossIllustration defeated={g.hp === 0} />
    </section>
  );
}

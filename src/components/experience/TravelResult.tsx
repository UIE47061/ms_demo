import { DATASET } from "../../data/microsoftDemo";
export function TravelResult({
  from,
  to,
  transport,
  date,
  distance,
  rate,
  emission,
  confirmed = false,
}: {
  from: string;
  to: string;
  transport: string;
  date: string;
  distance: number;
  rate: number;
  emission: number | null;
  confirmed?: boolean;
}) {
  return (
    <section className="travel-result" aria-label="旅程估算結果">
      <div className="travel-result-head">
        <span className="service-kicker azure">旅程摘要</span>
        <span>{confirmed ? "已人工確認" : "待人工確認"}</span>
      </div>
      <h2>
        {from || "起點"} → {to || "終點"}
      </h2>
      <p>
        {date} · {transport}
      </p>
      <div className="travel-result-value">
        <strong data-testid="travel-emission">
          {emission === null ? "—" : emission.toFixed(2)}
        </strong>
        <span>kg CO₂e · 估算排放</span>
      </div>
      <dl>
        <div>
          <dt>計算依據</dt>
          <dd>
            {distance} km × {Number(rate.toFixed(6))} kg CO₂e/km
          </dd>
        </div>
        <div>
          <dt>參考來源</dt>
          <dd>
            {DATASET.name} · {DATASET.version}
          </dd>
        </div>
      </dl>
      <details className="disclosure">
        <summary>估算方式與資料來源</summary>
        <p>
          起始比例由資料集的 165 km、5.8 kg CO₂e
          換算，非官方運具係數。修改里程或比例會重算結果；起訖站改動不會自動查詢里程。確認登錄表示已人工核對，不表示完成官方校驗。
        </p>
      </details>
    </section>
  );
}

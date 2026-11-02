import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { useDemo } from "../../store/demo";
import { Button, Modal } from "../ui";

export const DEMO_BIN = {
  name: "青禾辦公室 3F · 智慧垃圾桶 01",
  id: "bin-01",
  mode: "demo" as const,
};

export function BinConnection() {
  const { state, setState, notify } = useDemo();
  const binding = state.settings.recycleBin;
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [id, setId] = useState("");
  return (
    <>
      <button
        className="setting-row full"
        onClick={() => {
          setName(binding?.name || DEMO_BIN.name);
          setId(binding?.id || DEMO_BIN.id);
          setOpen(true);
        }}
      >
        <span>連接垃圾桶</span>
        <ChevronRight size={16} />
      </button>
      {open && (
        <Modal title="連接垃圾桶" onClose={() => setOpen(false)}>
          <span className="status neutral">Demo 模式 · 未連接實體裝置</span>
          <p>先保存要使用的垃圾桶；掃描後會以示範回應完成回收流程。</p>
          <form
            className="bin-connection-form"
            onSubmit={(event) => {
              event.preventDefault();
              if (!name.trim() || !id.trim()) return;
              setState((s) => ({
                ...s,
                settings: {
                  ...s.settings,
                  recycleBin: { name: name.trim(), id: id.trim(), mode: "demo" },
                },
              }));
              setOpen(false);
              notify("已保存垃圾桶 Demo 綁定");
            }}
          >
            <label>
              垃圾桶名稱
              <input
                required
                maxLength={80}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label>
              垃圾桶識別碼
              <input
                required
                maxLength={80}
                value={id}
                onChange={(e) => setId(e.target.value)}
              />
            </label>
            <p>
              {binding
                ? `目前 Demo 綁定：${binding.name}（${binding.id}）`
                : "尚未綁定，掃描時會使用預設示範垃圾桶。"}
            </p>
            <Button
              type="submit"
              className="full"
              disabled={!name.trim() || !id.trim()}
            >
              保存 Demo 綁定
            </Button>
            {binding && (
              <Button
                secondary
                className="full"
                onClick={() => {
                  setState((s) => {
                    const { recycleBin: _binding, ...settings } = s.settings;
                    return { ...s, settings };
                  });
                  setOpen(false);
                  notify("已解除垃圾桶 Demo 綁定");
                }}
              >
                解除綁定
              </Button>
            )}
          </form>
        </Modal>
      )}
    </>
  );
}

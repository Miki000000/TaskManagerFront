import { Component, For, Show } from "solid-js";
import { formatDate } from "../utils/dateFormatter";

type InfoCardProps = {
  data: Record<string, any> | null;
  onClose: () => void;
};

const InfoCard: Component<InfoCardProps> = (props) => {
  const excludedKeys = ["id", "userId"];

  const formatKey = (key: string) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };

  const formatValue = (value: any) => {
    if (value instanceof Date) {
      return formatDate(value.toISOString());
    }
    if (typeof value === "string") {
      if (value.match(/^\d{4}-\d{2}-\d{2}/)) {
        return formatDate(value);
      }
      return value.split("\n").map((line, i) => (
        <>
          {i > 0 && <br />}
          {line}
        </>
      ));
    }
    return value;
  };

  return (
    <Show when={props.data}>
      <div class="fixed inset-0 bg-base-300 bg-opacity-70 flex items-center justify-center z-50 p-4">
        <div class="card bg-base-100 shadow-xl relative min-w-[320px] w-auto max-w-2xl max-h-[90vh]">
          <button
            onClick={props.onClose}
            class="btn btn-ghost btn-sm absolute right-2 top-2 z-10"
          >
            ✕
          </button>
          <div class="card-body overflow-y-auto p-6">
            <For each={Object.entries(props.data!)}>
              {([key, value]) => {
                if (!excludedKeys.includes(key) && value !== undefined) {
                  return (
                    <div class="mb-6 last:mb-0">
                      <h3 class="text-sm font-semibold text-base-content/70">
                        {formatKey(key)}
                      </h3>
                      <div class="mt-2">
                        <p class="text-base text-base-content whitespace-normal break-words">
                          {formatValue(value)}
                        </p>
                      </div>
                    </div>
                  );
                }
              }}
            </For>
          </div>
        </div>
      </div>
    </Show>
  );
};

export default InfoCard;

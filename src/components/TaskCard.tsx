import { Component, For, Show } from "solid-js";
import { formatDate } from "../utils/dateFormatter";
import type { Task } from "../types";

type TaskCardProps = {
  data: Task | null;
  onClose: () => void;
};

const TaskCard: Component<TaskCardProps> = (props) => {
  const excludedKeys = ["id", "companies", "attributedUser", "completed"];

  const formatKey = (key: string) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };

  const formatValue = (key: string, value: any) => {
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
            <h2 class="card-title">{props.data!.title}</h2>

            <div class="mb-4">
              <h3 class="text-sm font-semibold text-base-content/70">Status</h3>
              <div class="mt-1">
                {props.data!.completed ? (
                  <div class="badge badge-success">Completed</div>
                ) : (
                  <div class="badge badge-warning">In Progress</div>
                )}
              </div>
            </div>

            <div class="mb-4">
              <h3 class="text-sm font-semibold text-base-content/70">
                Assigned To
              </h3>
              <div class="mt-1">
                <div class="badge badge-outline badge-primary">
                  {props.data!.attributedUser}
                </div>
              </div>
            </div>

            <div class="mb-4">
              <h3 class="text-sm font-semibold text-base-content/70">
                Companies
              </h3>
              <div class="mt-1 flex flex-wrap gap-1">
                <For each={props.data!.companies}>
                  {(company) => (
                    <div class="badge badge-outline badge-accent">
                      {company}
                    </div>
                  )}
                </For>
              </div>
            </div>

            <For each={Object.entries(props.data!)}>
              {([key, value]) => {
                if (
                  !excludedKeys.includes(key) &&
                  value !== undefined &&
                  key !== "title"
                ) {
                  return (
                    <div class="mb-4">
                      <h3 class="text-sm font-semibold text-base-content/70">
                        {formatKey(key)}
                      </h3>
                      <div class="mt-1">
                        <p class="text-base text-base-content whitespace-normal break-words">
                          {formatValue(key, value)}
                        </p>
                      </div>
                    </div>
                  );
                }
              }}
            </For>

            {props.data!.completedDate && (
              <div class="mb-4">
                <h3 class="text-sm font-semibold text-base-content/70">
                  Completed Date
                </h3>
                <div class="mt-1">
                  <p>{formatDate(props.data!.completedDate)}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Show>
  );
};

export default TaskCard;

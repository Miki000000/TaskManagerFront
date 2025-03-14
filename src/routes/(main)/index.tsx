import { createSignal, type Component } from "solid-js";
import type { Call, Note } from "../../types";
import CallTable from "../../components/CallTable";
import NoteTable from "../../components/NoteTable";
import TaskTable from "../../components/TaskTable";

const Home: Component = () => {
  const [activeTab, setActiveTab] = createSignal("calls");

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div class="container mx-auto p-4 max-w-[2000px]">
      <div class="tabs tabs-bordered mb-4 relative">
        <div class="tab-container w-full flex">
          <div
            class="tab-indicator absolute bottom-0 h-0.5 bg-base-content transition-all duration-300"
            style={{
              width: "33.33%",
              transform: `translateX(${
                activeTab() === "calls"
                  ? "0%"
                  : activeTab() === "notes"
                  ? "100%"
                  : "200%"
              })`,
            }}
          ></div>
          <input
            type="radio"
            name="content_tabs"
            class="tab tab-bordered w-1/3"
            checked={activeTab() === "calls"}
            aria-label="Calls"
            onChange={() => handleTabChange("calls")}
          />
          <input
            type="radio"
            name="content_tabs"
            class="tab tab-bordered w-1/3"
            checked={activeTab() === "notes"}
            aria-label="Notes"
            onChange={() => handleTabChange("notes")}
          />
          <input
            type="radio"
            name="content_tabs"
            class="tab tab-bordered w-1/3"
            checked={activeTab() === "tasks"}
            aria-label="Tasks"
            onChange={() => handleTabChange("tasks")}
          />
        </div>
      </div>

      <div class="overflow-x-auto overflow-y-auto">
        {activeTab() === "calls" ? (
          <CallTable />
        ) : activeTab() === "notes" ? (
          <NoteTable />
        ) : (
          <TaskTable />
        )}
      </div>
    </div>
  );
};

export default Home;

import { createSignal, type Component } from "solid-js";
import type { Call, Note } from "../../types";
import CallTable from "../../components/CallTable";
import NoteTable from "../../components/NoteTable";

const Home: Component = () => {
  const [activeTab, setActiveTab] = createSignal("calls");

  return (
    <div class="container mx-auto p-4">
      <div class="tabs tabs-bordered mb-4 relative">
        <div
          class={`absolute bottom-0 left-0 h-1 bg-white transition-all duration-300 ease-in ${
            activeTab() === "calls"
              ? "w-1/2 translate-x-0"
              : "w-1/2 translate-x-full"
          }`}
        />
        <input
          type="radio"
          name="content_tabs"
          class="tab tab-bordered w-1/2"
          checked={activeTab() === "calls"}
          aria-label="Calls"
          onChange={() => setActiveTab("calls")}
        />
        <input
          type="radio"
          name="content_tabs"
          class={`tab tab-bordered w-1/2 ${
            activeTab() === "notes" ? "border-b-2 border-white" : ""
          }`}
          aria-label="Notes"
          onChange={() => setActiveTab("notes")}
        />
      </div>

      <div class="overflow-x-auto overflow-y-auto">
        {activeTab() === "calls" ? <CallTable /> : <NoteTable />}
      </div>
    </div>
  );
};

export default Home;

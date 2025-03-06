import { type Component, createSignal, createMemo, onMount } from "solid-js";
import { useDecode } from "../hooks/useDecode";
import type { Call } from "../types";
import CallModal from "./CallModal";
import ErrorModal from "./ErrorModal";
import InfoCard from "./InfoCard";
import { useTableData } from "../hooks/useTableData";
import { formatDate } from "../utils/dateFormatter";

const CallTable: Component = () => {
  const [decoder] = useDecode();
  const [isAdmin, setAdmin] = createSignal(false);
  const [endpoint, setEndpoint] = createSignal("api/call");
  let dropdownRef: HTMLDetailsElement | undefined;

  const {
    data: calls,
    errorMessage,
    fetchData: fetchCalls,
    setEndpoint: updateEndpoint,
  } = useTableData<Call>(endpoint());
  const [currentPage, setCurrentPage] = createSignal(1);
  const [searchQuery, setSearchQuery] = createSignal("");
  const [selectedItem, setSelectedItem] = createSignal<Call | null>(null);
  const itemsPerPage = 20;

  onMount(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setAdmin(decoder(token).info.role === "ADMIN");
      fetchCalls();
    }
  });

  const handleEndpointChange = (newEndpoint: string) => {
    setEndpoint(newEndpoint);
    updateEndpoint(newEndpoint);
    fetchCalls();
    dropdownRef?.removeAttribute("open"); // Close dropdown
  };

  const filteredItems = createMemo(() => {
    const callsData = calls();
    if (!callsData || !Array.isArray(callsData)) return [];

    return callsData.filter((call) => {
      const query = searchQuery().toLowerCase();
      return (
        call.name.toLowerCase().includes(query) ||
        call.company.toLowerCase().includes(query) ||
        call.username?.toLowerCase().includes(query) ||
        formatDate(call.creationDate || Date.now().toString())
          .toLowerCase()
          .includes(query)
      );
    });
  });

  const getCurrentItems = () => {
    const startIndex = (currentPage() - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredItems().slice(startIndex, endIndex);
  };

  const totalPages = () => {
    return filteredItems()?.length
      ? Math.ceil(filteredItems().length / itemsPerPage)
      : 1;
  };

  const truncateText = (text: string, limit: number) => {
    if (text.length <= limit) return text;
    return text.substring(0, limit) + "...";
  };

  return (
    <>
      <ErrorModal message={errorMessage()} />
      {selectedItem() && (
        <InfoCard data={selectedItem()} onClose={() => setSelectedItem(null)} />
      )}
      <div class="flex flex-col h-[calc(100vh-12rem)]">
        <div class="mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <input
            type="text"
            placeholder="Search by name, company, username or date..."
            class="input input-bordered w-full sm:w-[25rem]"
            value={searchQuery()}
            onInput={(e) => {
              setSearchQuery(e.currentTarget.value);
              setCurrentPage(1);
            }}
          />
          {isAdmin() && (
            <details class="dropdown dropdown-end" ref={dropdownRef}>
              <summary role="button" class="btn w-[10rem]">
                View Options
              </summary>
              <ul class="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow-sm">
                <li>
                  <a onClick={() => handleEndpointChange("api/call")}>
                    My Calls
                  </a>
                </li>
                <li>
                  <a onClick={() => handleEndpointChange("api/call/all")}>
                    All Calls
                  </a>
                </li>
              </ul>
            </details>
          )}
        </div>
        <div class="flex-1 overflow-y-auto overflow-x-auto">
          <table class="table table-pin-rows w-full min-w-[800px]">
            <thead>
              <tr>
                <th>Name</th>
                <th>Company</th>
                <th>Problem</th>
                <th>Solution</th>
                <th>Date</th>
                <th>Created By</th>
                <th>Edit</th>
              </tr>
            </thead>
            <tbody>
              {getCurrentItems().map((item) => (
                <tr
                  class="hover:bg-base-200 cursor-pointer"
                  onClick={() => setSelectedItem(item)}
                >
                  <td>{truncateText(item.name, 20)}</td>
                  <td>{truncateText(item.company, 20)}</td>
                  <td>{truncateText(item.problem, 30)}</td>
                  <td>{truncateText(item.solution, 30)}</td>
                  <td>{formatDate(item.creationDate!)}</td>
                  <td>{item.username || "N/A"}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <CallModal item={item} onSuccess={fetchCalls} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div class="flex justify-between items-center">
          <div class="join mt-4 flex justify-center">
            <button
              class="join-item btn"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage() === 1 || !filteredItems()?.length}
            >
              «
            </button>
            <button class="join-item btn">
              {filteredItems()?.length ? `Page ${currentPage()}` : "No items"}
            </button>
            <button
              class="join-item btn"
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages(), p + 1))
              }
              disabled={
                currentPage() === totalPages() || !filteredItems()?.length
              }
            >
              »
            </button>
          </div>
          <CallModal onSuccess={fetchCalls} />
        </div>
      </div>
    </>
  );
};

export default CallTable;

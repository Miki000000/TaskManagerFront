import { type Component, createSignal, createMemo, onMount } from "solid-js";
import { useDecode } from "../hooks/useDecode";
import type { Call } from "../types";
import CallModal from "./CallModal";
import ErrorModal from "./ErrorModal";
import InfoCard from "./InfoCard";
import { useTableData } from "../hooks/useTableData";
import { formatDate } from "../utils/dateFormatter";
import AdminViewOptions, { ViewOption } from "./AdminViewOptions";

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
      const isUserAdmin = decoder(token).info.role === "ADMIN";
      console.log("CallTable - User is admin:", isUserAdmin); // Add debug log
      setAdmin(isUserAdmin);
      fetchCalls();
    }
  });

  const handleEndpointChange = (newEndpoint: string) => {
    setEndpoint(newEndpoint);
    updateEndpoint(newEndpoint);
    fetchCalls();
    dropdownRef?.removeAttribute("open"); // Close dropdown
  };

  const adminViewOptions: ViewOption[] = [
    { label: "My Calls", endpoint: "api/call" },
    { label: "All Calls", endpoint: "api/call/all" },
  ];

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
          <AdminViewOptions
            isAdmin={isAdmin()}
            options={adminViewOptions}
            onEndpointChange={handleEndpointChange}
            dropdownRef={(el) => (dropdownRef = el)}
          />
        </div>
        <div class="flex-1 overflow-y-auto overflow-x-auto">
          <table class="table table-pin-rows">
            <thead>
              <tr>
                <th class="w-[15%]">Name</th>
                <th class="w-[15%]">Company</th>
                <th class="w-[20%]">Problem</th>
                <th class="w-[20%]">Solution</th>
                <th class="w-[10%]">Date</th>
                <th class="w-[12%]">Created By</th>
                <th class="w-[8%]">Edit</th>
              </tr>
            </thead>
            <tbody>
              {getCurrentItems().map((item) => (
                <tr
                  class="hover:bg-base-200 cursor-pointer"
                  onClick={() => setSelectedItem(item)}
                >
                  <td class="max-w-[200px] truncate">{item.name || "N/A"}</td>
                  <td class="max-w-[200px] truncate">
                    {item.company || "N/A"}
                  </td>
                  <td class="max-w-[250px] truncate">
                    {item.problem || "N/A"}
                  </td>
                  <td class="max-w-[250px] truncate">
                    {item.solution || "N/A"}
                  </td>
                  <td class="whitespace-nowrap">
                    {item.creationDate ? formatDate(item.creationDate) : "N/A"}
                  </td>
                  <td class="max-w-[150px] truncate">
                    {item.username || "N/A"}
                  </td>
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
              class="join-item btn btn-sm min-w-[40px]"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage() === 1 || !filteredItems()?.length}
            >
              «
            </button>
            <button class="join-item btn btn-sm min-w-[100px]">
              {filteredItems()?.length ? `Page ${currentPage()}` : "No items"}
            </button>
            <button
              class="join-item btn btn-sm min-w-[40px]"
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

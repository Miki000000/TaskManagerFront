import { type Component, createSignal, createMemo, onMount } from "solid-js";
import type { Note } from "../types";
import NoteModal from "./NoteModal";
import ErrorModal from "./ErrorModal";
import InfoCard from "./InfoCard";
import { useTableData } from "../hooks/useTableData";
import { useDecode } from "../hooks/useDecode";
import { formatDate } from "../utils/dateFormatter";
import AdminViewOptions, { ViewOption } from "./AdminViewOptions";

const NoteTable: Component = () => {
  const [decoder] = useDecode();
  const [isAdmin, setAdmin] = createSignal(false);
  const [endpoint, setEndpoint] = createSignal("api/note");
  let dropdownRef: HTMLDetailsElement | undefined;
  const [selectedItem, setSelectedItem] = createSignal<Note | null>(null);

  const {
    data: notes,
    errorMessage,
    fetchData: fetchNotes,
    setEndpoint: updateEndpoint,
  } = useTableData<Note>(endpoint());

  // Add a debug log to check the data
  createMemo(() => {
    console.log("Notes data:", notes());
  });

  const [currentPage, setCurrentPage] = createSignal(1);
  const [searchQuery, setSearchQuery] = createSignal("");
  const itemsPerPage = 20;

  onMount(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      const isUserAdmin = decoder(token).info.role === "ADMIN";
      console.log("NoteTable - User is admin:", isUserAdmin); // Add debug log
      setAdmin(isUserAdmin);
      fetchNotes();
    }
  });

  const handleEndpointChange = (newEndpoint: string) => {
    setEndpoint(newEndpoint);
    updateEndpoint(newEndpoint);
    fetchNotes();
    dropdownRef?.removeAttribute("open"); // Close dropdown
  };

  const adminViewOptions: ViewOption[] = [
    { label: "My Notes", endpoint: "api/note" },
    { label: "All Notes", endpoint: "api/note/all" },
  ];

  const filteredItems = createMemo(() => {
    const notesData = notes();
    if (!notesData) return [];

    try {
      return notesData.filter((note) => {
        const query = searchQuery().toLowerCase();
        return (
          note.title?.toLowerCase().includes(query) ||
          note.company?.toLowerCase().includes(query) ||
          note.username?.toLowerCase().includes(query) ||
          (note.creationDate &&
            formatDate(note.creationDate).toLowerCase().includes(query))
        );
      });
    } catch (error) {
      console.error("Error filtering notes:", error);
      return [];
    }
  });

  // Modify getCurrentItems to be more defensive
  const getCurrentItems = () => {
    const items = filteredItems();
    if (!items || !Array.isArray(items)) return [];

    const startIndex = (currentPage() - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
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
            placeholder="Search by title, company, username or date..."
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
                <th class="w-[15%]">Title</th>
                <th class="w-[15%]">Company</th>
                <th class="w-[20%]">Contact</th>
                <th class="w-[20%]">Situation</th>
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
                  <td class="max-w-[200px] truncate">{item.title || "N/A"}</td>
                  <td class="max-w-[200px] truncate">
                    {item.company || "N/A"}
                  </td>
                  <td class="max-w-[250px] truncate">
                    {item.contact || "N/A"}
                  </td>
                  <td class="max-w-[250px] truncate">
                    {item.situation || "N/A"}
                  </td>
                  <td class="whitespace-nowrap">
                    {item.creationDate ? formatDate(item.creationDate) : "N/A"}
                  </td>
                  <td class="max-w-[150px] truncate">
                    {item.username || "N/A"}
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <NoteModal item={item} onSuccess={fetchNotes} />
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
          <NoteModal onSuccess={fetchNotes} />
        </div>
      </div>
    </>
  );
};

export default NoteTable;

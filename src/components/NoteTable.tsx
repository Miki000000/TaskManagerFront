import { type Component, createSignal, createMemo, onMount } from "solid-js";
import type { Note } from "../types";
import NoteModal from "./NoteModal";
import ErrorModal from "./ErrorModal";
import InfoCard from "./InfoCard"; // Add this import
import { useTableData } from "../hooks/useTableData";
import { useDecode } from "../hooks/useDecode";
import { formatDate } from "../utils/dateFormatter";

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

  const [currentPage, setCurrentPage] = createSignal(1);
  const [searchQuery, setSearchQuery] = createSignal("");
  const itemsPerPage = 20;

  onMount(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setAdmin(decoder(token).info.role === "ADMIN");
      fetchNotes();
    }
  });

  const handleEndpointChange = (newEndpoint: string) => {
    setEndpoint(newEndpoint);
    updateEndpoint(newEndpoint);
    fetchNotes();
    dropdownRef?.removeAttribute("open"); // Close dropdown
  };

  const filteredItems = createMemo(() => {
    return notes().filter((note) => {
      const query = searchQuery().toLowerCase();
      return (
        note.title.toLowerCase().includes(query) ||
        note.company.toLowerCase().includes(query) ||
        note.username?.toLowerCase().includes(query) ||
        formatDate(note.creationDate || Date.now().toString())
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

  const totalPages = () => Math.ceil(filteredItems().length / itemsPerPage);
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
      <div class="mb-4 flex justify-between items-center">
        <div class="flex gap-4 items-center justify-between">
          <input
            type="text"
            placeholder="Search by title, company or date..."
            class="input input-bordered w-full max-w-xs"
            value={searchQuery()}
            onInput={(e) => {
              setSearchQuery(e.currentTarget.value);
              setCurrentPage(1);
            }}
          />
          {isAdmin() && (
            <details
              class="dropdown dropdown-start absolute right-[12rem]"
              ref={dropdownRef}
            >
              <summary role="button" class="btn m-1">
                View Options
              </summary>
              <ul class="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow-sm">
                <li>
                  <a onClick={() => handleEndpointChange("api/note")}>
                    My Notes
                  </a>
                </li>
                <li>
                  <a onClick={() => handleEndpointChange("api/note/all")}>
                    All Notes
                  </a>
                </li>
              </ul>
            </details>
          )}
        </div>
      </div>
      <div class="h-[65vh] overflow-y-auto overflow-x-auto">
        <table class="table table-pin-rows w-full">
          <thead>
            <tr>
              <th>Title</th>
              <th>Company</th>
              <th>Contact</th>
              <th>Situation</th>
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
                <td>{truncateText(item.title, 30)}</td>
                <td>{truncateText(item.company, 30)}</td>
                <td>{truncateText(item.contact, 30)}</td>
                <td>{truncateText(item.situation, 30)}</td>
                <td>{formatDate(item.creationDate!)}</td>
                <td>{item.username || "N/A"}</td>
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
            class="join-item btn"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage() === 1}
          >
            «
          </button>
          <button class="join-item btn">Page {currentPage()}</button>
          <button
            class="join-item btn"
            onClick={() => setCurrentPage((p) => Math.min(totalPages(), p + 1))}
            disabled={currentPage() === totalPages()}
          >
            »
          </button>
        </div>
        <NoteModal onSuccess={fetchNotes} />
      </div>
    </>
  );
};

export default NoteTable;

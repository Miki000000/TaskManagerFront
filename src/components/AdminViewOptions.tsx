import { Component, JSX, Show } from "solid-js";

export interface ViewOption {
  label: string;
  endpoint: string;
}

interface AdminViewOptionsProps {
  isAdmin: boolean;
  options: ViewOption[];
  onEndpointChange: (endpoint: string) => void;
  dropdownRef?: (el: HTMLDetailsElement) => void;
  buttonLabel?: string;
  buttonClass?: string;
}

const AdminViewOptions: Component<AdminViewOptionsProps> = (props) => {
  return (
    <Show when={props.isAdmin}>
      <details class="dropdown dropdown-end" ref={props.dropdownRef}>
        <summary role="button" class={props.buttonClass || "btn w-[10rem]"}>
          {props.buttonLabel || "View Options"}
        </summary>
        <ul class="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow-sm">
          {props.options.map((option) => (
            <li>
              <a onClick={() => props.onEndpointChange(option.endpoint)}>
                {option.label}
              </a>
            </li>
          ))}
        </ul>
      </details>
    </Show>
  );
};

export default AdminViewOptions;

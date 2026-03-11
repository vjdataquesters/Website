import { useState, useEffect, useRef, useMemo } from "react";

interface DropdownOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

interface DropdownComboboxProps {
  options?: (string | DropdownOption)[];
  value: string | number;
  onChange?: (value: string | number) => void;
  placeholder?: string;
  onOtherSelected?: (isOther: boolean) => void;
  filterFunction?: (option: DropdownOption, inputValue: string) => boolean;
  disableSearch?: boolean;
  disabled?: boolean;
}

const DropdownCombobox = ({
  options = [],
  value,
  onChange,
  placeholder = "Select an option",
  onOtherSelected,
  filterFunction,
  disableSearch = false,
  disabled = false,
}: DropdownComboboxProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [filteredOptions, setFilteredOptions] = useState<DropdownOption[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isUserTyping, setIsUserTyping] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const comboboxRef = useRef<HTMLDivElement>(null);

  // Convert 1D array to format expected by component - memoized to prevent unnecessary re-renders
  const normalizedOptions = useMemo(() => {
    return options.map(option => {
      if (typeof option === 'string' || typeof option === 'number') {
        return { label: String(option), value: option, disabled: false };
      }
      return { ...option, disabled: option.disabled || false };
    });
  }, [options]);

  // Only update inputValue from external value when not actively typing
  useEffect(() => {
    if (!isUserTyping) {
      if (value !== undefined && value !== null && value !== "") {
        const selectedOption = normalizedOptions.find((option) => option.value === value);
        setInputValue(selectedOption ? selectedOption.label : "");
      } else {
        setInputValue("");
      }
    }
  }, [value, normalizedOptions, isUserTyping]);

  // Filter options based on input
  useEffect(() => {
    if (disableSearch || !inputValue.trim()) {
      setFilteredOptions(normalizedOptions);
    } else {
      const input = inputValue.toLowerCase();

      // Filter all options first (using custom filter if provided)
      const allMatches = normalizedOptions.filter((option) =>
        filterFunction
          ? filterFunction(option, inputValue)
          : option.label.toLowerCase().includes(input)
      );

      // Separate matches into starts-with and contains categories for prioritization
      const startsWithMatches: DropdownOption[] = [];
      const containsMatches: DropdownOption[] = [];
      const otherMatches: DropdownOption[] = [];

      allMatches.forEach((option) => {
        const label = option.label.toLowerCase();
        if (label === "other") {
          // "Other" option goes to end for better UX
          otherMatches.push(option);
        } else if (label.startsWith(input)) {
          startsWithMatches.push(option);
        } else {
          containsMatches.push(option);
        }
      });

      setFilteredOptions([...startsWithMatches, ...containsMatches, ...otherMatches]);
    }
    setHighlightedIndex(-1);
  }, [inputValue, normalizedOptions, filterFunction, disableSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disableSearch || disabled) return; // Prevent typing when search or component is disabled

    const newValue = e.target.value;
    setIsUserTyping(true);
    setInputValue(newValue);
    setIsOpen(true);

    // Clear external value when user starts typing manually
    if (newValue !== value) {
      onChange?.("");
    }
  };

  const handleOptionSelect = (option: DropdownOption) => {
    if (option.disabled || disabled) return; // Don't select disabled options or if component is disabled

    setIsUserTyping(false);
    setInputValue(option.label);
    onChange?.(option.value);
    setIsOpen(false);
    setHighlightedIndex(-1);

    // Trigger other selection callback
    if (onOtherSelected && option.value === "Other") {
      onOtherSelected(true);
    } else if (onOtherSelected) {
      onOtherSelected(false);
    }
  };

  const handleInputFocus = () => {
    // Only auto-open on focus when search is enabled and not disabled
    if (!disableSearch && !disabled) {
      setIsOpen(true);
    }
  };

  const handleInputClick = () => {
    if (disabled) return;
    if (disableSearch) {
      setIsOpen(!isOpen);
    }
  };

  const handleInputBlur = () => {
    // Reset typing state when input loses focus
    setTimeout(() => {
      setIsUserTyping(false);
    }, 200); // Small delay to allow option selection
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (!isOpen && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      e.preventDefault();
      setIsOpen(true);
      return;
    }

    if (!isOpen && disableSearch && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      setIsOpen(true);
      return;
    }

    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => {
          let nextIndex = prev + 1;
          if (nextIndex >= filteredOptions.length) nextIndex = 0;
          // Skip disabled options
          while (filteredOptions[nextIndex]?.disabled && nextIndex !== prev) {
            nextIndex = (nextIndex + 1) % filteredOptions.length;
          }
          return nextIndex;
        });
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => {
          let nextIndex = prev - 1;
          if (nextIndex < 0) nextIndex = filteredOptions.length - 1;
          // Skip disabled options
          while (filteredOptions[nextIndex]?.disabled && nextIndex !== prev) {
            nextIndex = nextIndex - 1 < 0 ? filteredOptions.length - 1 : nextIndex - 1;
          }
          return nextIndex;
        });
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleOptionSelect(filteredOptions[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
      case "Tab":
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [highlightedIndex]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (comboboxRef.current && !comboboxRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
        setIsUserTyping(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={comboboxRef}>
      <input
        ref={inputRef}
        type="text"
        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'cursor-pointer'}`}
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        onClick={handleInputClick}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        onKeyDown={handleInputKeyDown}
        readOnly={disableSearch || disabled}
        disabled={disabled}
        autoComplete="off"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-autocomplete={disableSearch ? "none" : "list"}
      />

      {/* Dropdown arrow */}
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
            }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {isOpen && filteredOptions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-400 rounded-lg shadow-lg max-h-60 overflow-auto scrollbar-thin-light">
          <ul ref={listRef} role="listbox" className="py-1">
            {filteredOptions.map((option, index) => (
              <li
                key={`${option.value}-${index}`}
                role="option"
                aria-selected={value === option.value}
                aria-disabled={option.disabled}
                className={`px-3 py-2 text-sm transition-colors duration-150 ${option.disabled
                    ? "text-gray-400 cursor-not-allowed"
                    : `text-gray-900 cursor-pointer ${highlightedIndex === index
                      ? "bg-gray-100"
                      : "hover:bg-gray-50"
                    }`
                  } ${value === option.value ? "bg-gray-50 font-medium" : ""}`}
                onClick={() => handleOptionSelect(option)}
                onMouseEnter={() => !option.disabled && setHighlightedIndex(index)}
              >
                {option.label}
              </li>
            ))}
          </ul>
        </div>
      )}

      {isOpen && filteredOptions.length === 0 && inputValue && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-400 rounded-lg shadow-lg">
          <div className="px-3 py-2 text-sm text-gray-500">
            No results found
          </div>
        </div>
      )}
    </div>
  );
};

export default DropdownCombobox;

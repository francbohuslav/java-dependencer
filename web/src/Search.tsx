import { Autocomplete, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { ajax } from "./functions";

export interface ISearchProps {
  onChange(library: string): void;
}

export default function Search(props: ISearchProps) {
  const [value, setValue] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState<readonly string[]>([]);

  useEffect(() => {
    (async () => {
      if (inputValue.length > 2) {
        const libraries = await ajax<string[]>("searchLibrary?term=" + encodeURIComponent(inputValue));
        setOptions([...libraries]);
      }
    })();
  }, [inputValue]);

  useEffect(() => {
    if (!open) {
      setOptions([]);
    }
  }, [open]);

  return (
    <Autocomplete
      autoComplete
      filterOptions={(x) => x}
      fullWidth
      filterSelectedOptions
      noOptionsText={inputValue.length > 2 ? "Not found" : "Keep writing"}
      value={value}
      options={options}
      onChange={(_event: any, newValue: string | null) => {
        setOptions(newValue ? [newValue, ...options] : options);
        setValue(newValue);
        if (newValue) props.onChange(newValue);
      }}
      onInputChange={(_event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="standard"
          label="Library to analyse"
          placeholder="enter some library name"
          helperText="At least 3 letter must be insterted"
          fullWidth
        />
      )}
    />
  );
}

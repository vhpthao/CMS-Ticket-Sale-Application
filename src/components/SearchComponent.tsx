import React from 'react';
import { Input } from 'antd';

type SearchComponentProps = {
  placeholder: string;
  size: 'large' | 'small';
  onSearch?: (value: string) => void;
  style?: { width: string; marginLeft: string; marginRight: string };
};

const SearchComponent: React.FC<SearchComponentProps> = ({
  placeholder,
  size,
  onSearch,
  style,
}) => {
  const handleSearch = (value: string) => {
    if (onSearch) {
      onSearch(value);
    }
  };

  return (
      <Input.Search
        placeholder={placeholder}
        allowClear
        onSearch={handleSearch}
        style={style}
        size={size}
      />
  );
};

export default SearchComponent;
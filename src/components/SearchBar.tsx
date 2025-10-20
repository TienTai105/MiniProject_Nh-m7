import React from "react";
import { Search } from "lucide-react";
import { useProductStore } from "../store/productStore";

const SearchBar: React.FC = () => {
  const { searchQuery, setSearchQuery } = useProductStore();

  return (
    <div className="flex justify-center mt-4 mb-6">
      <div className="flex items-center border border-gray-300 rounded-full px-4 py-2 w-full sm:w-96 bg-white dark:bg-gray-800">
        <Search className="w-5 h-5 text-gray-500 mr-2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm sản phẩm..."
          className="w-full outline-none text-gray-700 dark:text-gray-200 bg-transparent"
        />
      </div>
    </div>
  );
};

export default SearchBar;

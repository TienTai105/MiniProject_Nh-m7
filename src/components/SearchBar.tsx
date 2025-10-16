import React from "react";
import { Search } from "lucide-react";

const SearchBar = () => {
  return (
    <div className="flex justify-center mt-4 mb-6">
      <div className="flex items-center border border-gray-300 rounded-full px-4 py-2 w-full sm:w-96 bg-white">
        <Search className="w-5 h-5 text-gray-500 mr-2" />
        <input
          type="text"
          placeholder="Search products..."
          className="w-full outline-none text-gray-700"
        />
      </div>
    </div>
  );
};

export default SearchBar;

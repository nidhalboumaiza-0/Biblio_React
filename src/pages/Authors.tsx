import { useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Plus, Search, Edit2, Trash2 } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

interface Author {
  id: number;
  nom: string;
  prenom: string;
}

interface AuthorForm {
  nom: string;
  prenom: string;
}

export default function Authors() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1); // Pagination state
  const [itemsPerPage] = useState(10); // 10 authors per page
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm<AuthorForm>();

  // Fetch authors data from the backend
  const { data: authors, isLoading } = useQuery({
    queryKey: ["authors", searchTerm],
    queryFn: async () => {
      const response = await axios.get(
        searchTerm
          ? `http://localhost:5000/auteur/find/${searchTerm}`
          : "http://localhost:5000/auteur"
      );
      return response.data;
    },
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage; // Index of the last item on the current page
  const indexOfFirstItem = indexOfLastItem - itemsPerPage; // Index of the first item on the current page
  const currentAuthors =
    authors?.slice(indexOfFirstItem, indexOfLastItem) || []; // Authors to display on the current page

  const totalPages = Math.ceil(authors?.length / itemsPerPage); // Total number of pages

  // Function to go to the next page
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Function to go to the previous page
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Mutation for creating a new author
  const createMutation = useMutation({
    mutationFn: (newAuthor: AuthorForm) =>
      axios.post("http://localhost:5000/auteur", newAuthor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authors"] }); // Refresh the authors list
      toast.success("Author created successfully"); // Show success message
      setIsModalOpen(false); // Close the modal
      reset(); // Reset the form
    },
    onError: () => {
      toast.error("Failed to create author"); // Show error message
    },
  });

  // Mutation for updating an author
  const updateMutation = useMutation({
    mutationFn: (author: Author) =>
      axios.put(`http://localhost:5000/auteur/${author.id}`, author),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authors"] }); // Refresh the authors list
      toast.success("Author updated successfully"); // Show success message
      setIsModalOpen(false); // Close the modal
      setEditingAuthor(null); // Clear the editing author
      reset(); // Reset the form
    },
    onError: () => {
      toast.error("Failed to update author"); // Show error message
    },
  });

  // Mutation for deleting an author
  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      axios.delete(`http://localhost:5000/auteur/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authors"] }); // Refresh the authors list
      toast.success("Author deleted successfully"); // Show success message
    },
    onError: () => {
      toast.error("Failed to delete author"); // Show error message
    },
  });

  // Function to handle form submission (create or update)
  const onSubmit = (data: AuthorForm) => {
    if (editingAuthor) {
      updateMutation.mutate({ ...editingAuthor, ...data }); // Update author
    } else {
      createMutation.mutate(data); // Create author
    }
  };

  return (
    <div className="container mx-auto px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Authors Management
        </h1>
        <button
          onClick={() => setIsModalOpen(true)} // Open the modal to add a new author
          className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" />
          Add New Author
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search authors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} // Update search term
            className="w-full px-4 py-2 border border-gray-300 rounded-md pl-10"
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <>
          {/* Authors Table */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    First Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Map through the current authors and display them */}
                {currentAuthors.map((author: Author) => (
                  <tr key={author.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {author.prenom}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {author.nom}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {/* Edit Button */}
                      <button
                        onClick={() => {
                          setEditingAuthor(author); // Set the author to edit
                          setIsModalOpen(true); // Open the modal
                        }}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {/* Delete Button */}
                      <button
                        onClick={() =>
                          deleteMutation.mutate(author.id)
                        } // Delete the author
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-center mt-6 gap-4">
            {/* Previous Button */}
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1} // Disable if on the first page
              className={`px-4 py-2 rounded-md ${
                currentPage === 1
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
            >
              Previous
            </button>
            {/* Page Indicator */}
            <span className="px-4 py-2">
              Page {currentPage} of {totalPages}
            </span>
            {/* Next Button */}
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages} // Disable if on the last page
              className={`px-4 py-2 rounded-md ${
                currentPage === totalPages
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* Modal for Adding/Editing Authors */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingAuthor ? "Edit Author" : "Add New Author"}
            </h2>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
            >
              {/* First Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  {...register("prenom")}
                  defaultValue={editingAuthor?.prenom}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              {/* Last Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  {...register("nom")}
                  defaultValue={editingAuthor?.nom}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              {/* Form Buttons */}
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false); // Close the modal
                    setEditingAuthor(null); // Clear the editing author
                    reset(); // Reset the form
                  }}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  {editingAuthor ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

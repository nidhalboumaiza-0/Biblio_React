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

interface Book {
  id: number;
  titre: string;
  nbre_pages: number;
  code_auteur: number;
  disponible: boolean;
  nbre_exemplaires: number;
  auteur: {
    id: number;
    nom: string;
    prenom: string;
  };
  genres: Array<{
    id: number;
    nom: string;
  }>;
}

interface Author {
  id: number;
  nom: string;
  prenom: string;
}

interface BookForm {
  titre: string;
  nbre_pages: number;
  code_auteur: number;
  nbre_exemplaires: number;
}

export default function Books() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [currentPage, setCurrentPage] = useState(1); // Pagination state
  const [itemsPerPage] = useState(10); // 10 books per page
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm<BookForm>();

  // Fetch books data from the backend
  const { data: books, isLoading: isBooksLoading } = useQuery({
    queryKey: ["books", searchTerm],
    queryFn: async () => {
      const response = await axios.get(
        searchTerm
          ? `http://localhost:5000/livre/find/${searchTerm}`
          : "http://localhost:5000/livre"
      );
      return response.data;
    },
  });

  // Fetch authors data from the backend
  const { data: authors, isLoading: isAuthorsLoading } = useQuery({
    queryKey: ["authors"],
    queryFn: async () => {
      const response = await axios.get(
        "http://localhost:5000/auteur"
      );
      return response.data;
    },
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage; // Index of the last item on the current page
  const indexOfFirstItem = indexOfLastItem - itemsPerPage; // Index of the first item on the current page
  const currentBooks =
    books?.slice(indexOfFirstItem, indexOfLastItem) || []; // Books to display on the current page

  const totalPages = Math.ceil(books?.length / itemsPerPage); // Total number of pages

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

  // Mutation for creating a new book
  const createMutation = useMutation({
    mutationFn: (newBook: BookForm) =>
      axios.post("http://localhost:5000/livre", newBook),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      toast.success("Book created successfully");
      setIsModalOpen(false);
      reset();
    },
    onError: () => {
      toast.error("Failed to create book");
    },
  });

  // Mutation for updating a book
  const updateMutation = useMutation({
    mutationFn: (book: Book) =>
      axios.put(`http://localhost:5000/livre/${book.id}`, book),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      toast.success("Book updated successfully");
      setIsModalOpen(false);
      setEditingBook(null);
      reset();
    },
    onError: () => {
      toast.error("Failed to update book");
    },
  });

  // Mutation for deleting a book
  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      axios.delete(`http://localhost:5000/livre/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      toast.success("Book deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete book");
    },
  });

  // Function to handle form submission (create or update)
  const onSubmit = (data: BookForm) => {
    if (editingBook) {
      updateMutation.mutate({ ...editingBook, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="container mx-auto px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Books Management
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" />
          Add New Book
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search books..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md pl-10"
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Loading State */}
      {isBooksLoading || isAuthorsLoading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <>
          {/* Books Table */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pages
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Copies
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Map through the current books and display them */}
                {currentBooks.map((book: Book) => (
                  <tr key={book.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {book.titre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {book.nbre_pages}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {book.auteur.prenom} {book.auteur.nom}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {book.nbre_exemplaires}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          book.disponible
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {book.disponible
                          ? "Available"
                          : "Unavailable"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {/* Edit Button */}
                      <button
                        onClick={() => {
                          setEditingBook(book);
                          setIsModalOpen(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {/* Delete Button */}
                      <button
                        onClick={() => deleteMutation.mutate(book.id)}
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

      {/* Modal for Adding/Editing Books */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingBook ? "Edit Book" : "Add New Book"}
            </h2>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
            >
              {/* Title Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  {...register("titre")}
                  defaultValue={editingBook?.titre}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              {/* Pages Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Pages
                </label>
                <input
                  type="number"
                  {...register("nbre_pages")}
                  defaultValue={editingBook?.nbre_pages}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              {/* Author Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Author
                </label>
                <select
                  {...register("code_auteur")}
                  defaultValue={editingBook?.code_auteur}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                >
                  {authors?.map((author: Author) => (
                    <option key={author.id} value={author.id}>
                      {author.prenom} {author.nom}
                    </option>
                  ))}
                </select>
              </div>
              {/* Number of Copies Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Number of Copies
                </label>
                <input
                  type="number"
                  {...register("nbre_exemplaires")}
                  defaultValue={editingBook?.nbre_exemplaires}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              {/* Form Buttons */}
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingBook(null);
                    reset();
                  }}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  {editingBook ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

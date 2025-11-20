import { useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

// Define the structure of a Borrowing
interface Borrowing {
  id: number;
  date_debut: string;
  date_retour: string | null;
  adherent_id: number;
  livre_id: number;
  retourner: boolean;
  adherent: {
    id: number;
    nom: string;
  };
  livre: {
    id: number;
    titre: string;
  };
}

// Define the structure of the Borrowing form
interface BorrowingForm {
  date_debut: string;
  adherent_id: number;
  livre_id: number;
}

export default function Borrowings() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); // Pagination state
  const [itemsPerPage] = useState(10); // 10 borrowings per page
  const [searchBookTerm, setSearchBookTerm] = useState(""); // Search term for books
  const [searchMemberTerm, setSearchMemberTerm] = useState(""); // Search term for members
  const [selectedBook, setSelectedBook] = useState<{
    id: number;
    titre: string;
  } | null>(null); // Selected book
  const [selectedMember, setSelectedMember] = useState<{
    id: number;
    nom: string;
  } | null>(null); // Selected member
  const [filterBookName, setFilterBookName] = useState(""); // Filter by book name
  const [filterMemberName, setFilterMemberName] = useState(""); // Filter by member name
  const [filterStatus, setFilterStatus] = useState<
    "all" | "borrowed" | "returned"
  >("all"); // Filter by status
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm<BorrowingForm>();

  // Fetch borrowings data from the backend
  const { data: borrowings, isLoading: isBorrowingsLoading } =
    useQuery({
      queryKey: ["borrowings"],
      queryFn: async () => {
        const response = await axios.get(
          "http://localhost:5000/emprunt"
        );
        return response.data;
      },
    });

  // Fetch books data from the backend
  const { data: books, isLoading: isBooksLoading } = useQuery({
    queryKey: ["books", searchBookTerm],
    queryFn: async () => {
      const response = await axios.get(
        searchBookTerm
          ? `http://localhost:5000/livre/find/${searchBookTerm}`
          : "http://localhost:5000/livre"
      );
      return response.data;
    },
  });

  // Fetch members data from the backend
  const { data: members, isLoading: isMembersLoading } = useQuery({
    queryKey: ["members", searchMemberTerm],
    queryFn: async () => {
      const response = await axios.get(
        searchMemberTerm
          ? `http://localhost:5000/adherent/find/${searchMemberTerm}`
          : "http://localhost:5000/adherent"
      );
      return response.data;
    },
  });

  // Filtered borrowings based on book name, member name, and status
  const filteredBorrowings = borrowings?.filter(
    (borrowing: Borrowing) => {
      const matchesBookName = borrowing.livre.titre
        .toLowerCase()
        .includes(filterBookName.toLowerCase());
      const matchesMemberName = borrowing.adherent.nom
        .toLowerCase()
        .includes(filterMemberName.toLowerCase());
      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "borrowed" && !borrowing.retourner) ||
        (filterStatus === "returned" && borrowing.retourner);

      return matchesBookName && matchesMemberName && matchesStatus;
    }
  );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage; // Index of the last item on the current page
  const indexOfFirstItem = indexOfLastItem - itemsPerPage; // Index of the first item on the current page
  const currentBorrowings =
    filteredBorrowings?.slice(indexOfFirstItem, indexOfLastItem) ||
    []; // Borrowings to display on the current page

  const totalPages = Math.ceil(
    filteredBorrowings?.length / itemsPerPage
  ); // Total number of pages

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

  // Mutation for creating a new borrowing
  const createMutation = useMutation({
    mutationFn: (newBorrowing: BorrowingForm) =>
      axios.post("http://localhost:5000/emprunt", newBorrowing),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["borrowings"] }); // Refresh the borrowings list
      toast.success("Borrowing created successfully"); // Show success message
      setIsModalOpen(false); // Close the modal
      reset(); // Reset the form
      setSelectedBook(null); // Clear selected book
      setSelectedMember(null); // Clear selected member
    },
    onError: () => {
      toast.error("Failed to create borrowing"); // Show error message
    },
  });

  // Mutation for returning a book
  const returnBookMutation = useMutation({
    mutationFn: (id: number) =>
      axios.put(`http://localhost:5000/emprunt/${id}/return`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["borrowings"] }); // Refresh the borrowings list
      toast.success("Book returned successfully"); // Show success message
    },
    onError: () => {
      toast.error("Failed to return book"); // Show error message
    },
  });

  // Mutation for deleting a borrowing
  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      axios.delete(`http://localhost:5000/emprunt/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["borrowings"] }); // Refresh the borrowings list
      toast.success("Borrowing record deleted successfully"); // Show success message
    },
    onError: () => {
      toast.error("Failed to delete borrowing record"); // Show error message
    },
  });

  // Function to handle form submission (create borrowing)
  const onSubmit = (data: BorrowingForm) => {
    if (!selectedBook || !selectedMember) {
      toast.error("Please select a book and a member");
      return;
    }

    const newBorrowing = {
      ...data,
      livre_id: selectedBook.id,
      adherent_id: selectedMember.id,
      date_debut: new Date().toISOString().split("T")[0], // Automatically set to current date
    };

    createMutation.mutate(newBorrowing);
  };

  return (
    <div className="container mx-auto px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Borrowings Management
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" />
          New Borrowing
        </button>
      </div>

      {/* Filter Controls */}
      <div className="mb-6 space-y-4">
        {/* Filter by Book Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Filter by Book Name
          </label>
          <input
            type="text"
            placeholder="Enter book name..."
            value={filterBookName}
            onChange={(e) => setFilterBookName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* Filter by Member Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Filter by Member Name
          </label>
          <input
            type="text"
            placeholder="Enter member name..."
            value={filterMemberName}
            onChange={(e) => setFilterMemberName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* Filter by Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Filter by Status
          </label>
          <select
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(
                e.target.value as "all" | "borrowed" | "returned"
              )
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          >
            <option value="all">All</option>
            <option value="borrowed">Borrowed</option>
            <option value="returned">Returned</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {isBorrowingsLoading || isBooksLoading || isMembersLoading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <>
          {/* Borrowings Table */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Book
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Borrow Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Return Date
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
                {/* Map through the current borrowings and display them */}
                {currentBorrowings.map((borrowing: Borrowing) => (
                  <tr key={borrowing.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {borrowing.adherent.nom}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {borrowing.livre.titre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(
                        borrowing.date_debut
                      ).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {borrowing.date_retour
                        ? new Date(
                            borrowing.date_retour
                          ).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          borrowing.retourner
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {borrowing.retourner
                          ? "Returned"
                          : "Borrowed"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {/* Return Book Button (only shown if not returned) */}
                      {!borrowing.retourner && (
                        <button
                          onClick={() =>
                            returnBookMutation.mutate(borrowing.id)
                          }
                          className="text-green-600 hover:text-green-900 mr-4"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      {/* Delete Button */}
                      <button
                        onClick={() =>
                          deleteMutation.mutate(borrowing.id)
                        }
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

      {/* Modal for Adding Borrowings */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">New Borrowing</h2>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
            >
              {/* Book Search and Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Book
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search books..."
                    value={searchBookTerm}
                    onChange={(e) =>
                      setSearchBookTerm(e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-md pl-10"
                  />
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                </div>
                {books?.length > 0 && (
                  <div className="mt-2 max-h-40 overflow-y-auto">
                    {books.map(
                      (book: { id: number; titre: string }) => (
                        <div
                          key={book.id}
                          onClick={() => setSelectedBook(book)}
                          className={`p-2 cursor-pointer hover:bg-gray-100 ${
                            selectedBook?.id === book.id
                              ? "bg-indigo-100"
                              : ""
                          }`}
                        >
                          {book.titre}
                        </div>
                      )
                    )}
                  </div>
                )}
                {selectedBook && (
                  <div className="mt-2 p-2 bg-gray-100 rounded-md">
                    Selected Book:{" "}
                    <strong>{selectedBook.titre}</strong>
                  </div>
                )}
              </div>

              {/* Member Search and Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Member
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search members..."
                    value={searchMemberTerm}
                    onChange={(e) =>
                      setSearchMemberTerm(e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-md pl-10"
                  />
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                </div>
                {members?.length > 0 && (
                  <div className="mt-2 max-h-40 overflow-y-auto">
                    {members.map(
                      (member: { id: number; nom: string }) => (
                        <div
                          key={member.id}
                          onClick={() => setSelectedMember(member)}
                          className={`p-2 cursor-pointer hover:bg-gray-100 ${
                            selectedMember?.id === member.id
                              ? "bg-indigo-100"
                              : ""
                          }`}
                        >
                          {member.nom}
                        </div>
                      )
                    )}
                  </div>
                )}
                {selectedMember && (
                  <div className="mt-2 p-2 bg-gray-100 rounded-md">
                    Selected Member:{" "}
                    <strong>{selectedMember.nom}</strong>
                  </div>
                )}
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    reset();
                    setSelectedBook(null);
                    setSelectedMember(null);
                  }}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Plus, Edit2, Trash2 } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

interface Class {
  id: number;
  nom: string;
  adherents: Array<{
    id: number;
    nom: string;
  }>;
}

interface ClassForm {
  nom: string;
}

export default function Classes() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1); // Pagination state
  const [itemsPerPage] = useState(10); // 10 classes per page
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm<ClassForm>();

  // Fetch classes data from the backend
  const { data: classes, isLoading } = useQuery({
    queryKey: ["classes"],
    queryFn: async () => {
      const response = await axios.get(
        "http://localhost:5000/classe"
      );
      return response.data;
    },
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage; // Index of the last item on the current page
  const indexOfFirstItem = indexOfLastItem - itemsPerPage; // Index of the first item on the current page
  const currentClasses =
    classes?.slice(indexOfFirstItem, indexOfLastItem) || []; // Classes to display on the current page

  const totalPages = Math.ceil(classes?.length / itemsPerPage); // Total number of pages

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

  // Mutation for creating a new class
  const createMutation = useMutation({
    mutationFn: (newClass: ClassForm) =>
      axios.post("http://localhost:5000/classe", newClass),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] }); // Refresh the classes list
      toast.success("Class created successfully"); // Show success message
      setIsModalOpen(false); // Close the modal
      reset(); // Reset the form
    },
    onError: () => {
      toast.error("Failed to create class"); // Show error message
    },
  });

  // Mutation for updating a class
  const updateMutation = useMutation({
    mutationFn: (classData: Class) =>
      axios.put(
        `http://localhost:5000/classe/${classData.id}`,
        classData
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] }); // Refresh the classes list
      toast.success("Class updated successfully"); // Show success message
      setIsModalOpen(false); // Close the modal
      setEditingClass(null); // Clear the editing class
      reset(); // Reset the form
    },
    onError: () => {
      toast.error("Failed to update class"); // Show error message
    },
  });

  // Mutation for deleting a class
  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      axios.delete(`http://localhost:5000/classe/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] }); // Refresh the classes list
      toast.success("Class deleted successfully"); // Show success message
    },
    onError: () => {
      toast.error("Failed to delete class"); // Show error message
    },
  });

  // Function to handle form submission (create or update)
  const onSubmit = (data: ClassForm) => {
    if (editingClass) {
      updateMutation.mutate({ ...editingClass, ...data }); // Update class
    } else {
      createMutation.mutate(data); // Create class
    }
  };

  return (
    <div className="container mx-auto px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Classes Management
        </h1>
        <button
          onClick={() => setIsModalOpen(true)} // Open the modal to add a new class
          className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" />
          Add New Class
        </button>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <>
          {/* Classes Table */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Students Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Map through the current classes and display them */}
                {currentClasses.map((classItem: Class) => (
                  <tr key={classItem.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {classItem.nom}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {classItem.adherents?.length || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {/* Edit Button */}
                      <button
                        onClick={() => {
                          setEditingClass(classItem); // Set the class to edit
                          setIsModalOpen(true); // Open the modal
                        }}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {/* Delete Button */}
                      <button
                        onClick={() =>
                          deleteMutation.mutate(classItem.id)
                        } // Delete the class
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

      {/* Modal for Adding/Editing Classes */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingClass ? "Edit Class" : "Add New Class"}
            </h2>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
            >
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  {...register("nom")}
                  defaultValue={editingClass?.nom}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              {/* Form Buttons */}
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false); // Close the modal
                    setEditingClass(null); // Clear the editing class
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
                  {editingClass ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

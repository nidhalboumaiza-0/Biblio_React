import { useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Plus, Edit2, Trash2, Search } from "lucide-react"; // Import Search icon
import axios from "axios";
import toast from "react-hot-toast";

interface Member {
  id: number;
  nom: string;
  email: string;
  adresse: string;
  date_naissance: string;
  num_carte_identite: string;
  username: string;
  classe_id: number;
  gender: "G" | "F";
  nbr_emprunts: number;
  classe: {
    id: number;
    nom: string;
  };
}

interface Class {
  id: number;
  nom: string;
}

interface MemberForm {
  nom: string;
  email: string;
  adresse: string;
  date_naissance: string;
  num_carte_identite: string;
  username: string;
  password: string;
  classe_id: number;
  gender: "G" | "F";
}

export default function Members() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1); // Pagination state
  const [itemsPerPage] = useState(10); // 10 members per page
  const [searchTerm, setSearchTerm] = useState(""); // Search term state
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm<MemberForm>();

  // Fetch members data from the backend with search term
  const { data: members, isLoading: isMembersLoading } = useQuery({
    queryKey: ["members", searchTerm], // Include search term in the query key
    queryFn: async () => {
      const response = await axios.get(
        "http://localhost:5000/adherent"
      );
      // Filter members by name on the frontend (or modify the backend to support search)
      return response.data.filter((member: Member) =>
        member.nom.toLowerCase().includes(searchTerm.toLowerCase())
      );
    },
  });

  // Fetch classes data from the backend
  const { data: classes, isLoading: isClassesLoading } = useQuery({
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
  const currentMembers =
    members?.slice(indexOfFirstItem, indexOfLastItem) || []; // Members to display on the current page

  const totalPages = Math.ceil(members?.length / itemsPerPage); // Total number of pages

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

  // Mutation for creating a new member
  const createMutation = useMutation({
    mutationFn: (newMember: MemberForm) =>
      axios.post("http://localhost:5000/adherent", newMember),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast.success("Member created successfully");
      setIsModalOpen(false);
      reset();
    },
    onError: () => {
      toast.error("Failed to create member");
    },
  });

  // Mutation for updating a member
  const updateMutation = useMutation({
    mutationFn: (member: Member) =>
      axios.put(
        `http://localhost:5000/adherent/${member.id}`,
        member
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast.success("Member updated successfully");
      setIsModalOpen(false);
      setEditingMember(null);
      reset();
    },
    onError: () => {
      toast.error("Failed to update member");
    },
  });

  // Mutation for deleting a member
  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      axios.delete(`http://localhost:5000/adherent/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast.success("Member deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete member");
    },
  });

  // Function to handle form submission (create or update)
  const onSubmit = (data: MemberForm) => {
    if (editingMember) {
      updateMutation.mutate({ ...editingMember, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="container mx-auto px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Members Management
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" />
          Add New Member
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search members by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md pl-10"
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Loading State */}
      {isMembersLoading || isClassesLoading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <>
          {/* Members Table */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Borrowings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Map through the current members and display them */}
                {currentMembers.map((member: Member) => (
                  <tr key={member.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {member.nom}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {member.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {member.classe.nom}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {member.nbr_emprunts}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setEditingMember(member);
                          setIsModalOpen(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          deleteMutation.mutate(member.id)
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

      {/* Modal for Adding/Editing Members */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingMember ? "Edit Member" : "Add New Member"}
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
                  defaultValue={editingMember?.nom}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  {...register("email")}
                  defaultValue={editingMember?.email}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              {/* Address Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <input
                  {...register("adresse")}
                  defaultValue={editingMember?.adresse}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              {/* Birth Date Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Birth Date
                </label>
                <input
                  type="date"
                  {...register("date_naissance")}
                  defaultValue={editingMember?.date_naissance}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              {/* ID Card Number Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  ID Card Number
                </label>
                <input
                  {...register("num_carte_identite")}
                  defaultValue={editingMember?.num_carte_identite}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              {/* Username Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  {...register("username")}
                  defaultValue={editingMember?.username}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              {/* Password Field (only shown when adding a new member) */}
              {!editingMember && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    type="password"
                    {...register("password")}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
              )}
              {/* Class Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Class
                </label>
                <select
                  {...register("classe_id")}
                  defaultValue={editingMember?.classe_id}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                >
                  {classes?.map((classItem: Class) => (
                    <option key={classItem.id} value={classItem.id}>
                      {classItem.nom}
                    </option>
                  ))}
                </select>
              </div>
              {/* Gender Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Gender
                </label>
                <select
                  {...register("gender")}
                  defaultValue={editingMember?.gender}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                >
                  <option value="G">Male</option>
                  <option value="F">Female</option>
                </select>
              </div>
              {/* Form Buttons */}
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingMember(null);
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
                  {editingMember ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

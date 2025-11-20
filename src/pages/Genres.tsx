import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Genre {
  id: number;
  nom: string;
  livres: Array<{
    id: number;
    titre: string;
  }>;
}

interface GenreForm {
  nom: string;
}

export default function Genres() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGenre, setEditingGenre] = useState<Genre | null>(null);
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm<GenreForm>();

  const { data: genres, isLoading } = useQuery({
    queryKey: ['genres'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:5000/genre');
      return response.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: (newGenre: GenreForm) => 
      axios.post('http://localhost:5000/genre', newGenre),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['genres'] });
      toast.success('Genre created successfully');
      setIsModalOpen(false);
      reset();
    },
    onError: () => {
      toast.error('Failed to create genre');
    }
  });

  const updateMutation = useMutation({
    mutationFn: (genre: Genre) => 
      axios.put(`http://localhost:5000/genre/${genre.id}`, genre),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['genres'] });
      toast.success('Genre updated successfully');
      setIsModalOpen(false);
      setEditingGenre(null);
      reset();
    },
    onError: () => {
      toast.error('Failed to update genre');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => 
      axios.delete(`http://localhost:5000/genre/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['genres'] });
      toast.success('Genre deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete genre');
    }
  });

  const onSubmit = (data: GenreForm) => {
    if (editingGenre) {
      updateMutation.mutate({ ...editingGenre, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Genres Management</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" />
          Add New Genre
        </button>
      </div>

      {isLoading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Books Count</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {genres?.map((genre: Genre) => (
                <tr key={genre.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{genre.nom}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{genre.livres?.length || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        setEditingGenre(genre);
                        setIsModalOpen(true);
                      }}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(genre.id)}
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
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingGenre ? 'Edit Genre' : 'Add New Genre'}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  {...register('nom')}
                  defaultValue={editingGenre?.nom}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingGenre(null);
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
                  {editingGenre ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
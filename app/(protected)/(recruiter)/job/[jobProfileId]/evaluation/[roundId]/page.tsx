"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  deleteRubric,
  getRubricsList,
  updateRubric,
  addSingleRubric,
} from "@/actions/jobs/rubricsGet";
import LoadingGlobal from "@/components/ui/loading";

const EvaluationPage = () => {
  const { roundId } = useParams<{ roundId: string }>();
  const [rubrics, setRubrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRubric, setEditingRubric] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRubric, setNewRubric] = useState({
    jobRoundId: roundId,
    parameter: "",
    description: "",
    weightage: 0,
    type: "",
    condition: "",
  });

  useEffect(() => {
    if (!roundId) return;

    getRubricsList(roundId).then((res) => {
      if (res.status === "success") setRubrics(res.data);
      setLoading(false);
    });
  }, [roundId]);

  const handleUpdate = async () => {
    if (!editingRubric) return;

    const res = await updateRubric(editingRubric);
    if (res.status === "success") {
      setRubrics((prev) =>
        prev.map((r) => (r.id === editingRubric.id ? editingRubric : r))
      );
      setEditingRubric(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this rubric?")) return;

    const res = await deleteRubric(id);
    if (res.status === "success") {
      setRubrics((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const handleAddRubric = async () => {
    if (!roundId) return;

    const res = await addSingleRubric(newRubric);
    if (res.status === "success") {
      setRubrics((prev) => [...prev, newRubric]);
      setIsModalOpen(false);
      setNewRubric({
        jobRoundId: roundId,
        parameter: "",
        description: "",
        weightage: 0,
        type: "",
        condition: "",
      });
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Job Round Evaluation</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3 py-1 bg-green-600 text-white rounded"
        >
          Add New
        </button>
      </div>

      {loading ? (
      <LoadingGlobal text={""}/>
      ) : rubrics.length === 0 ? (
        <p>No rubrics found.</p>
      ) : (
        <ul className="space-y-4">
          {rubrics.map((rubric) => (
            <li
              key={rubric.id}
              className="p-4 border rounded-lg bg-gray-50 shadow-sm"
            >
              {/* {editingRubric?.id === rubric.id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editingRubric?.parameter}
                    onChange={(e) =>
                      setEditingRubric({
                        ...editingRubric,
                        parameter: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded"
                  />
                  <textarea
                    value={editingRubric?.description}
                    onChange={(e) =>
                      setEditingRubric({
                        ...editingRubric,
                        description: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded"
                  />
                  <input
                    type="number"
                    value={editingRubric?.weightage}
                    onChange={(e) =>
                      setEditingRubric({
                        ...editingRubric,
                        weightage: Number(e.target.value),
                      })
                    }
                    className="w-full p-2 border rounded"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleUpdate}
                      className="px-4 py-2 bg-blue-600 text-white rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingRubric(null)}
                      className="px-4 py-2 bg-gray-400 text-white rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : ( */}
                <>
                  <h3 className="text-lg font-semibold">{rubric.parameter}</h3>
                  <p className="text-sm text-gray-600">{rubric.description}</p>
                  <p className="text-sm text-gray-600">
                    Weightage: {rubric.weightage}%
                  </p>
                  <div className="mt-2 flex space-x-3">
                    <button
                      onClick={() => setEditingRubric(rubric)}
                      className="px-3 py-1 bg-yellow-500 text-white rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(rubric.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded"
                    >
                      Delete
                    </button>
                  </div>
                </>
              {/* )} */}
            </li>
          ))}
        </ul>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-bold mb-4">Add New Rubric</h3>
            <input
              type="text"
              placeholder="Parameter"
              value={newRubric.parameter}
              onChange={(e) =>
                setNewRubric({ ...newRubric, parameter: e.target.value })
              }
              className="w-full p-2 border rounded mb-2"
            />
            <textarea
              placeholder="Description"
              value={newRubric.description}
              onChange={(e) =>
                setNewRubric({ ...newRubric, description: e.target.value })
              }
              className="w-full p-2 border rounded mb-2"
            />
            <input
              type="number"
              placeholder="Weightage"
              value={newRubric.weightage}
              onChange={(e) =>
                setNewRubric({
                  ...newRubric,
                  weightage: Number(e.target.value),
                })
              }
              className="w-full p-2 border rounded mb-2"
            />
            <input
              type="text"
              placeholder="Type"
              value={newRubric.type}
              onChange={(e) =>
                setNewRubric({ ...newRubric, type: e.target.value })
              }
              className="w-full p-2 border rounded mb-2"
            />
            <input
              type="text"
              placeholder="Condition"
              value={newRubric.condition}
              onChange={(e) =>
                setNewRubric({ ...newRubric, condition: e.target.value })
              }
              className="w-full p-2 border rounded mb-2"
            />
            <div className="flex space-x-2">
              <button
                onClick={handleAddRubric}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Add
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluationPage;

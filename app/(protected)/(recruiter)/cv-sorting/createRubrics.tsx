"use client"
import { useEffect, useState } from 'react'
import axios from 'axios'
import { Circles } from 'react-loader-spinner'
import GetEvaluate from './getEvaluate';

interface EvaluationCriteria {
  parameter: string;
  description: string;
  weightage: number;
}

export default function CreateRubrics() {
  const [jobDescription, setJobDescription] = useState('')
  const [criteria, setCriteria] = useState<EvaluationCriteria[]>([])
  const [loading, setLoading] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [jobTitle, setJobTitle] = useState('') 
  const handleSubmit = async () => {
    setLoading(true)
    try {
      const res = await axios.post('http://localhost:5500/get-rubric-evaluation', {
        "job_description": jobDescription
      })
      // console.log(res.data)
      if (res.data.result?.evaluation_criteria) {
        setCriteria(res.data.result.evaluation_criteria)
      }

      if(res.data.result?.job_title) {
        setJobTitle(res.data.result.job_title)
      }

    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
      setJobDescription('')
    }
  }

  const handleAddCriteria = () => {
    setCriteria([...criteria, {
      parameter: '',
      description: '',
      weightage: 1
    }])
    setEditingIndex(criteria.length)
  }

  const updateCriteria = (index: number, updates: Partial<EvaluationCriteria>) => {
    const newCriteria = [...criteria]
    newCriteria[index] = { ...newCriteria[index], ...updates }
    setCriteria(newCriteria)
  }

  useEffect(() => {
    if(criteria.length>0) {
      console.log('criteria:', criteria)
    }
  }, [criteria])

  const removeCriteria = (index: number) => {
    setCriteria(criteria.filter((_, i) => i !== index))
  }

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Criteria</h1>
        <p className="text-gray-400 mb-4">
          Candidates are rated out of 5 on each criterion, following its scoring-guideline.
          The final score is the weighted average of these ratings using the criteria weightage weights.
        </p>

        <button
          onClick={handleAddCriteria}
          className="w-full py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition"
        >
          Add New Criteria
        </button>
      </div>

      <div className=" rounded-lg">
        <div className="grid grid-cols-[1fr,100px] font-semibold p-4 border-b border-gray-700">
          <div>Evaluation Criteria</div>
          <div>weightage</div>
        </div>

        {criteria.length>0 && criteria.map((criterion, index) => (
          <div
            key={index}
            className="grid grid-cols-[1fr,100px] items-center p-4 border-b border-gray-700 last:border-b-0"
          >
            <div className="flex items-center space-x-4">
              <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              <div>
                <input
                  type="text"
                  value={criterion.parameter}
                  onChange={(e) => updateCriteria(index, { parameter: e.target.value })}
                  className="bg-transparent border-b border-gray-600 w-full"
                  placeholder="Criteria Name"
                />
                <textarea
                  value={criterion.description}
                  onChange={(e) => updateCriteria(index, { description: e.target.value })}
                  className="bg-transparent w-full text-sm text-gray-400 mt-2"
                  placeholder="Description"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => updateCriteria(index, { weightage: Math.max(1, criterion.weightage - 1) })}
                className=" px-2 rounded border border-gray-400"
              >
                -
              </button>
              <span>{criterion?.weightage}</span>
              <button
                onClick={() => updateCriteria(index, { weightage: Math.min(5, criterion.weightage + 1) })}
                className=" px-2 rounded border border-gray-400"
              >
                +
              </button>
              <button
                onClick={() => removeCriteria(index)}
                className="text-red-500 ml-2"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <textarea
          placeholder="Paste Job Description Here"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          className="w-full p-4  rounded  min-h-[200px]"
        />
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-4 w-full py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition flex justify-center items-center"
        >
          {loading ? (
            <Circles
              height="20"
              width="20"
              color="white"
              ariaLabel="circles-loading"
              visible={true}
            />
          ) : (
            "Generate Rubrics"
          )}
        </button>
      </div>
      
      {
        criteria.length>0 && (
          <GetEvaluate parameters={{"job_title":jobTitle,"evaluation_criteria":criteria}} />
        )
      }

    </div> 

  )
}


import { getInterviewTemplates } from '@/actions/interviewTemplates/getTemplateActions'
import React, { useEffect, useState } from 'react'
import { Clock, Code, DatabaseIcon, LineChart, LayoutGrid, Briefcase, Users, ArrowRight } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import CreateInterviewComponent from './CreateInterview'

function InterviewTemplates() {
    interface InterviewTemplate {
        id: string;
        category?: string;
        companyName?: string;
        roleTitle?: string;
        expectedDuration?: number;
        difficulty?: string;
        jobDescription?: string;
    }

    const [interviewTemplates, setInterviewTemplates] = useState<InterviewTemplate[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [copiedId, setCopiedId] = useState<string>("")
    const [activeCategory, setActiveCategory] = useState("All")

    const categories = [
        { value: "All", label: "All", icon: <LayoutGrid className="w-5 h-5 mb-1" /> },
        { value: "Software", label: "Software", icon: <Code className="w-5 h-5 mb-1" /> },
        { value: "DataScience", label: "Data science", icon: <DatabaseIcon className="w-5 h-5 mb-1" /> },
        { value: "Finance", label: "Finance", icon: <LineChart className="w-5 h-5 mb-1" /> },
        { value: "Product", label: "Product", icon: <LayoutGrid className="w-5 h-5 mb-1" /> },
        { value: "Business", label: "Business", icon: <Briefcase className="w-5 h-5 mb-1" /> },
        { value: "Consulting", label: "Consulting", icon: <Users className="w-5 h-5 mb-1" /> },
    ]

    useEffect(() => {
        const fetchInterviewTemplates = async () => {
            try {
                const response = await getInterviewTemplates()
                if (response.status !== 200) {
                    throw new Error('Failed to fetch interview templates')
                }
                const data = response.result
                console.log('Fetched interview templates:', data)
                setInterviewTemplates(data)
            } catch (error: any) {
                setError(error.message)
            } finally {
                setLoading(false)
            }
        }
        fetchInterviewTemplates()
    }, [])

    const handleShareClick = (templateId: string, e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        // Prevent the tooltip from closing immediately
        e.preventDefault()
        e.stopPropagation()

        // Get the current URL and append the template ID as a parameter
        const currentUrl = window.location.href
        const shareUrl = new URL(currentUrl)
        shareUrl.searchParams.set('template', templateId)

        // Copy the URL to clipboard
        navigator.clipboard.writeText(shareUrl.toString())
            .then(() => {
                setCopiedId(templateId)
                // Reset the copied state after 3 seconds
                setTimeout(() => {
                    setCopiedId('')
                }, 3000)
            })
            .catch(err => {
                console.error('Failed to copy URL: ', err)
            })
    }

    const getDifficultyLabel = (difficulty: string) => {
        switch (difficulty?.toLowerCase()) {
            case 'easy':
                return 'Easy'
            case 'medium':
                return 'Medium'
            case 'hard':
                return 'Hard'
            default:
                return 'Medium'
        }
    }

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty?.toLowerCase()) {
            case 'easy':
                return 'bg-green-100 text-green-800'
            case 'medium':
                return 'bg-yellow-100 text-yellow-800'
            case 'hard':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-yellow-100 text-yellow-800'
        }
    }

    const formatDuration = (minutes: number) => {
        return `${minutes}m`
    }

    const filteredTemplates = activeCategory === "All"
        ? interviewTemplates
        : interviewTemplates.filter(template =>
            template?.category?.toLowerCase() === activeCategory.toLowerCase())

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading...</div>
    }

    if (error) {
        return <div className="text-red-500 p-4">Error: {error}</div>
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Interview Templates</h1>

            <Tabs defaultValue="All" onValueChange={setActiveCategory} className="mb-8">
                <TabsList className="flex justify-start items-center gap-10 bg-transparent">
                    {categories.map((category) => (
                        <TabsTrigger
                            key={category.value}
                            value={category.value}
                            className="flex flex-col items-center justify-center py-3 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 border-b-2 data-[state=active]:border-purple-500 rounded-none"
                        >
                            {category.icon}
                            <span className="text-xs">{category.label}</span>
                        </TabsTrigger>
                    ))}
                </TabsList>

                {categories.map((category) => (
                    <TabsContent key={category.value} value={category.value} className="mt-6">
                        {filteredTemplates.length === 0 ? (
                            <div className="text-center p-4">No interview templates found for this category.</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {filteredTemplates.map((template: any) => (
                                    <div
                                        key={template?.id}
                                        className="rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 relative group"
                                    >
                                        <div className="bg-purple-100 h-32 p-2 flex items-center justify-start gap-2 relative">
                                            {/* Share button - appears on hover */}
                                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <TooltipProvider delayDuration={0}>
                                                    <Tooltip open={copiedId === template.id}>
                                                        <TooltipTrigger asChild>
                                                            <button
                                                                className="bg-white rounded-sm px-3 py-1 text-gray-700 text-sm shadow-sm hover:bg-gray-50"
                                                                onClick={(e) => handleShareClick(template.id, e)}
                                                            >
                                                                Share
                                                            </button>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="bottom">
                                                            <p className="text-sm">Link copied!</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>

                                            {/* Template logo */}
                                            <div className="bg-white rounded-md p-2 shadow-lg">
                                                <div className="bg-gradient-to-r from-blue-400 to-purple-500 rounded-full w-10 h-10 flex items-center justify-center text-white text-2xl font-bold">
                                                    {template.companyName?.charAt(0) || 'W'}
                                                </div>
                                            </div>

                                            <div className='p-2'>
                                                <h2 className="text-sm font-bold text-clip-3">{template.roleTitle || `New Grad E3: Technical interview #${template.id}`}</h2>
                                                <p className="text-gray-600 mt-1">{template.companyName || 'Software Engineering'}</p>
                                            </div>
                                        </div>
                                        <div className="p-3">
                                            <div className="flex items-center gap-3 mt-3">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    <span className="text-sm">{formatDuration(template.expectedDuration || 20)}</span>
                                                </div>

                                                <div className={`px-3 py-1 rounded-full text-sm ${getDifficultyColor(template.difficulty)}`}>
                                                    {getDifficultyLabel(template.difficulty)}
                                                </div>
                                            </div>

                                            {/* Start interview button - visible on hover */}
                                            <div className="mt-4">
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="link" className="text-purple-600 font-medium flex items-center gap-1 hover:text-purple-800">
                                                            Start New Interview
                                                            <ArrowRight className="w-4 h-4" />
                                                        </Button>
                                                    </DialogTrigger>

                                                    <DialogContent className="max-h-[95vh] max-w-[60vw]">
                                                        <DialogHeader>
                                                            <DialogTitle className="text-lg font-bold mb-4">
                                                                Start Interview for {template.roleTitle || `New Grad E3: Technical interview #${template.id}`}
                                                            </DialogTitle>

                                                        </DialogHeader>
                                                        <CreateInterviewComponent jobDescription={template.jobDescription} />
                                                    </DialogContent>

                                                </Dialog>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    )
}

export default InterviewTemplates
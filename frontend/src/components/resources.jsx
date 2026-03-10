import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardAction,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
	CardContent,
} from "@/components/ui/card";
import PaperDetailsModal from "@/components/paper-details-modal";
import api from "@/api";

const COLORS = [
	"bg-amber-50 text-amber-700 border-amber-200",
	"bg-green-50 text-green-700 border-green-200",
	"bg-blue-50 text-blue-700 border-blue-200",
	"bg-pink-50 text-pink-700 border-pink-200",
	"bg-purple-50 text-purple-700 border-purple-200",
	"bg-cyan-50 text-cyan-700 border-cyan-200",
	"bg-rose-50 text-rose-700 border-rose-200",
];

const MOCK_RESOURCES = [
	{
		id: 1,
		title: "Resource 01 - Machine Learning",
		author: "Dr. Sarah Chen, Prof. James Wilson",
		authors: ["Dr. Sarah Chen", "Prof. James Wilson"],
		abstract:
			"A comprehensive guide to modern machine learning approaches and their applications in real-world scenarios. Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien vitae pellentesque sem placerat in id cursus mi pretium tellus duis convallis tempus leo eu aenean sed diam urna tempor pulvinar vivamus fringilla lacus nec metus bibendum egestas iaculis massa nisl malesuada lacinia integer nunc posuere ut hendrerit.",
		description:
			"A comprehensive guide to modern machine learning approaches and their applications in real-world scenarios. Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien vitae pellentesque sem placerat in id cursus mi pretium tellus duis convallis tempus leo eu aenean sed diam urna tempor pulvinar vivamus fringilla lacus nec metus bibendum egestas iaculis massa nisl malesuada lacinia integer nunc posuere ut hendrerit.",
		year: 2024,
		color: "bg-amber-50 text-amber-700 border-amber-200",
	},
];

export function Resources() {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedPaper, setSelectedPaper] = useState(null);
	const [projects, setProjects] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchProjects();
	}, []);

	const fetchProjects = async () => {
		try {
			const response = await api.get("/projects/");
			const formattedProjects = response.data.map((project, index) => ({
				id: project.project_id,
				title: project.title,
				author: "CiteKit User",
				authors: ["CiteKit User"],
				abstract: project.description,
				description: project.description,
				year: new Date(project.created_at).getFullYear(),
				color: COLORS[index % COLORS.length],
			}));
			setProjects(
				formattedProjects.length > 0 ? formattedProjects : MOCK_RESOURCES,
			);
		} catch (error) {
			console.error("Failed to fetch projects:", error);
			setProjects(MOCK_RESOURCES);
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-lg text-muted-foreground">Loading projects...</div>
			</div>
		);
	}

	return (
		<>
			<div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
				{projects.map((resource) => (
					<Card
						key={resource.id}
						className="group gap-3 relative overflow-hidden bg-gradient-to-br from-primary/5 via-card to-background backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:from-primary/10 hover:via-card hover:to-background border border-border/50 cursor-pointer"
						onClick={() => {
							setSelectedPaper(resource);
							setIsModalOpen(true);
						}}
					>
						<CardHeader className="pb-2">
							<CardTitle className="text-base font-bold leading-tight line-clamp-2 text-foreground">
								{resource.title}
							</CardTitle>
							<div className="flex items-center gap-2 mt-2">
								<span
									className={`px-2 py-1 text-xs font-semibold rounded-md ${resource.color}`}
								>
									{resource.year}
								</span>
							</div>
						</CardHeader>
						<CardContent className="pb-4">
							<p className="text-sm text-muted-foreground line-clamp-4 mb-3">
								{resource.description}
								{resource.description.length > 120 ? "..." : ""}
							</p>
							{/* <div className="flex flex-wrap gap-1.5">
								{resource.authors.map((author) => (
									<Badge
										key={author}
										variant="outline"
										className={`text-xs font-normal ${resource.color}`}
									>
										{author}
									</Badge>
								))}
							</div> */}
						</CardContent>
					</Card>
				))}
			</div>

			<PaperDetailsModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				selectedPaper={selectedPaper}
				allPapers={MOCK_RESOURCES}
				onSelectPaper={(paper) => setSelectedPaper(paper)}
			/>
		</>
	);
}

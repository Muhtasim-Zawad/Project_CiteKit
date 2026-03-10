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
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { X, BookOpen } from "lucide-react";
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

const MOCK_PAPERS = [
	{
		id: 1,
		title: "Project 01 - Machine Learning",
		description:
			"A comprehensive guide to modern machine learning approaches and their applications in real-world scenarios. Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien vitae pellentesque sem placerat in id cursus mi pretium tellus duis convallis tempus leo eu aenean sed diam urna tempor pulvinar vivamus fringilla lacus nec metus bibendum egestas iaculis massa nisl malesuada lacinia integer nunc posuere ut hendrerit.",
		year: 2024,
		authors: ["Dr. Sarah Chen", "Prof. James Wilson"],
		abstract:
			"A comprehensive guide to modern machine learning approaches and their applications in real-world scenarios. Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien vitae pellentesque sem placerat in id cursus mi pretium tellus duis convallis tempus leo eu aenean sed diam urna tempor pulvinar vivamus fringilla lacus nec metus bibendum egestas iaculis massa nisl malesuada lacinia integer nunc posuere ut hendrerit.",
		citations: 8542,
		color: "bg-amber-50 text-amber-700 border-amber-200",
	},
];

// Paper Modal Component
const PaperModal = ({ paper, isOpen, onClose }) => {
	if (!paper) return null;

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent
				showCloseButton={false}
				className="w-[95vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl max-h-[90vh] overflow-y-auto via-card bg-background"
			>
				<div className="space-y-6 py-4">
					<DialogHeader className="space-y-4">
						<div className="flex items-start justify-between gap-4">
							<div className="flex-1">
								<DialogTitle className="text-2xl font-bold text-foreground">
									{paper.title}
								</DialogTitle>
								<Badge className="mt-3 bg-primary/10 text-primary border-primary/20 text-sm">
									{paper.year}
								</Badge>
							</div>
							<DialogClose asChild>
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
								>
									<X className="h-4 w-4" />
								</Button>
							</DialogClose>
						</div>
					</DialogHeader>

					{/* Authors Section */}
					{/* <div>
						<h3 className="text-sm font-semibold text-foreground mb-2">
							Authors
						</h3>
						<div className="flex flex-wrap gap-2">
							{paper.authors.map((author) => (
								<Badge
									key={author}
									variant="outline"
									className="text-sm bg-primary/5 text-primary border-primary/20"
								>
									{author}
								</Badge>
							))}
						</div>
					</div> */}

					{/* Abstract Section */}
					<div>
						<h3 className="text-sm font-semibold text-foreground mb-2">
							Description
						</h3>
						<p className="text-sm text-muted-foreground leading-relaxed bg-primary/5 rounded-lg p-4 border border-primary/10">
							{paper.abstract}
						</p>
					</div>

					{/* Stats Section */}
					{/* <div className="grid grid-cols-2 gap-4">
						<div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-3 border border-primary/20">
							<p className="text-xs text-muted-foreground font-medium">
								Citations
							</p>
							<p className="text-xl font-bold text-primary mt-1">
								{paper.citations.toLocaleString()}
							</p>
						</div>
						<div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-3 border border-primary/20">
							<p className="text-xs text-muted-foreground font-medium">
								Published
							</p>
							<p className="text-xl font-bold text-primary mt-1">
								{paper.year}
							</p>
						</div>
					</div> */}

					{/* Action Buttons */}
					<div className="flex gap-3 pt-4 border-t border-primary/10">
						<Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
							<BookOpen className="h-4 w-4 mr-2" /> Edit
						</Button>
						<Button variant="secondary" className="flex-1">
							Open in Chat
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export function Projects() {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedPaper, setSelectedPaper] = useState(null);
	const [papers, setPapers] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchProjects();
	}, []);

	const fetchProjects = async () => {
		try {
			const response = await api.get("/projects/");
			const formattedPapers = response.data.map((project, index) => ({
				id: project.project_id,
				title: project.title,
				description: project.description,
				year: new Date(project.created_at).getFullYear(),
				authors: ["CiteKit User"],
				abstract: project.description,
				citations: project.references?.length || 0,
				color: COLORS[index % COLORS.length],
			}));
			setPapers(formattedPapers.length > 0 ? formattedPapers : MOCK_PAPERS);
		} catch (error) {
			console.error("Failed to fetch projects:", error);
			setPapers(MOCK_PAPERS);
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
				{papers.map((paper) => (
					<Card
						key={paper.id}
						onClick={() => {
							setSelectedPaper(paper);
							setIsModalOpen(true);
						}}
						className="group gap-3 relative overflow-hidden bg-gradient-to-br from-primary/5 via-card to-background backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:from-primary/10 hover:via-card hover:to-background border border-border/50 cursor-pointer"
					>
						<CardHeader className="pb-2">
							<CardTitle className="text-base font-bold leading-tight line-clamp-2 text-foreground">
								{paper.title}
							</CardTitle>
							<div className="flex items-center gap-2 mt-2">
								<span
									className={`px-2 py-1 text-xs font-semibold rounded-md ${paper.color}`}
								>
									{paper.year}
								</span>
							</div>
						</CardHeader>
						<CardContent className="pb-4">
							<p className="text-sm text-muted-foreground line-clamp-4 mb-3">
								{paper.description}
								{paper.description.length > 120 ? "..." : ""}
							</p>
							{/* <div className="flex flex-wrap gap-1.5">
								{paper.authors.map((author) => (
									<Badge
										key={author}
										variant="outline"
										className={`text-xs font-normal ${paper.color}`}
									>
										{author}
									</Badge>
								))}
							</div> */}
						</CardContent>
					</Card>
				))}
			</div>

			<PaperModal
				paper={selectedPaper}
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
			/>
		</>
	);
}

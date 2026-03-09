import { useState } from "react";
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
	{
		id: 2,
		title: "Project 02 - Quantum Computing Fundamentals",
		description:
			"Explore the principles of quantum mechanics and their application to computational problems. Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien vitae pellentesque sem placerat in id cursus mi pretium tellus duis convallis tempus leo eu aenean sed diam urna tempor pulvinar vivamus fringilla lacus nec metus bibendum egestas iaculis massa nisl malesuada lacinia integer nunc posuere ut hendrerit.",
		year: 2023,
		authors: ["Dr. Michael Torres"],
		abstract:
			"Explore the principles of quantum mechanics and their application to computational problems. Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien vitae pellentesque sem placerat in id cursus mi pretium tellus duis convallis tempus leo eu aenean sed diam urna tempor pulvinar vivamus fringilla lacus nec metus bibendum egestas iaculis massa nisl malesuada lacinia integer nunc posuere ut hendrerit.",
		citations: 6123,
		color: "bg-green-50 text-green-700 border-green-200",
	},
	{
		id: 3,
		title: "Project 03 - Neural Networks in Production",
		description:
			"Best practices for deploying and maintaining neural networks in production environments. Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien vitae pellentesque sem placerat in id cursus mi pretium tellus duis convallis tempus leo eu aenean sed diam urna tempor pulvinar vivamus fringilla lacus nec metus bibendum egestas iaculis massa nisl malesuada lacinia integer nunc posuere ut hendrerit.",
		year: 2024,
		authors: ["Emma Rodriguez", "David Kim"],
		abstract:
			"Best practices for deploying and maintaining neural networks in production environments. Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien vitae pellentesque sem placerat in id cursus mi pretium tellus duis convallis tempus leo eu aenean sed diam urna tempor pulvinar vivamus fringilla lacus nec metus bibendum egestas iaculis massa nisl malesuada lacinia integer nunc posuere ut hendrerit.",
		citations: 4678,
		color: "bg-blue-50 text-blue-700 border-blue-200",
	},
	{
		id: 4,
		title: "Project 04 - Blockchain Technology Overview",
		description:
			"Understanding distributed ledger technology and its various applications beyond cryptocurrency. Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien vitae pellentesque sem placerat in id cursus mi pretium tellus duis convallis tempus leo eu aenean sed diam urna tempor pulvinar vivamus fringilla lacus nec metus bibendum egestas iaculis massa nisl malesuada lacinia integer nunc posuere ut hendrerit.",
		year: 2023,
		authors: ["Prof. Alex Kumar"],
		abstract:
			"Understanding distributed ledger technology and its various applications beyond cryptocurrency. Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien vitae pellentesque sem placerat in id cursus mi pretium tellus duis convallis tempus leo eu aenean sed diam urna tempor pulvinar vivamus fringilla lacus nec metus bibendum egestas iaculis massa nisl malesuada lacinia integer nunc posuere ut hendrerit.",
		citations: 3521,
		color: "bg-pink-50 text-pink-700 border-pink-200",
	},
	{
		id: 5,
		title: "Project 05 - Data Privacy and Security",
		description:
			"Modern approaches to protecting sensitive data and ensuring compliance with international standards. Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien vitae pellentesque sem placerat in id cursus mi pretium tellus duis convallis tempus leo eu aenean sed diam urna tempor pulvinar vivamus fringilla lacus nec metus bibendum egestas iaculis massa nisl malesuada lacinia integer nunc posuere ut hendrerit.",
		year: 2024,
		authors: ["Lisa Anderson", "Marcus Johnson", "Rachel Lee"],
		abstract:
			"Modern approaches to protecting sensitive data and ensuring compliance with international standards. Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien vitae pellentesque sem placerat in id cursus mi pretium tellus duis convallis tempus leo eu aenean sed diam urna tempor pulvinar vivamus fringilla lacus nec metus bibendum egestas iaculis massa nisl malesuada lacinia integer nunc posuere ut hendrerit.",
		citations: 2345,
		color: "bg-purple-50 text-purple-700 border-purple-200",
	},
	{
		id: 6,
		title: "Project 06 - Cloud Architecture Patterns",
		description:
			"Design patterns and best practices for building scalable cloud-native applications. Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien vitae pellentesque sem placerat in id cursus mi pretium tellus duis convallis tempus leo eu aenean sed diam urna tempor pulvinar vivamus fringilla lacus nec metus bibendum egestas iaculis massa nisl malesuada lacinia integer nunc posuere ut hendrerit.",
		year: 2023,
		authors: ["Dr. Robert Zhang"],
		abstract:
			"Design patterns and best practices for building scalable cloud-native applications. Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien vitae pellentesque sem placerat in id cursus mi pretium tellus duis convallis tempus leo eu aenean sed diam urna tempor pulvinar vivamus fringilla lacus nec metus bibendum egestas iaculis massa nisl malesuada lacinia integer nunc posuere ut hendrerit.",
		citations: 1789,
		color: "bg-cyan-50 text-cyan-700 border-cyan-200",
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
					<div>
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
					</div>

					{/* Abstract Section */}
					<div>
						<h3 className="text-sm font-semibold text-foreground mb-2">
							Abstract
						</h3>
						<p className="text-sm text-muted-foreground leading-relaxed bg-primary/5 rounded-lg p-4 border border-primary/10">
							{paper.abstract}
						</p>
					</div>

					{/* Stats Section */}
					<div className="grid grid-cols-2 gap-4">
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
					</div>

					{/* Action Buttons */}
					<div className="flex gap-3 pt-4 border-t border-primary/10">
						<Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
							<BookOpen className="h-4 w-4 mr-2" /> View Full Paper
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

	return (
		<>
			<div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
				{MOCK_PAPERS.map((paper) => (
					<Card
						key={paper.id}
						onClick={() => {
							setSelectedPaper(paper);
							setIsModalOpen(true);
						}}
						className="group relative overflow-hidden bg-gradient-to-br from-primary/5 via-card to-background backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:from-primary/10 hover:via-card hover:to-background border border-border/50 cursor-pointer"
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
							<div className="flex flex-wrap gap-1.5">
								{paper.authors.map((author) => (
									<Badge
										key={author}
										variant="outline"
										className={`text-xs font-normal ${paper.color}`}
									>
										{author}
									</Badge>
								))}
							</div>
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

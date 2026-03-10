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
import PaperDetailsModal from "@/components/paper-details-modal";

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
	{
		id: 2,
		title: "Resource 02 - Quantum Computing Fundamentals",
		author: "Dr. Michael Torres",
		authors: ["Dr. Michael Torres"],
		abstract:
			"Explore the principles of quantum mechanics and their application to computational problems. Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien vitae pellentesque sem placerat in id cursus mi pretium tellus duis convallis tempus leo eu aenean sed diam urna tempor pulvinar vivamus fringilla lacus nec metus bibendum egestas iaculis massa nisl malesuada lacinia integer nunc posuere ut hendrerit.",
		description:
			"Explore the principles of quantum mechanics and their application to computational problems. Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien vitae pellentesque sem placerat in id cursus mi pretium tellus duis convallis tempus leo eu aenean sed diam urna tempor pulvinar vivamus fringilla lacus nec metus bibendum egestas iaculis massa nisl malesuada lacinia integer nunc posuere ut hendrerit.",
		year: 2023,
		color: "bg-green-50 text-green-700 border-green-200",
	},
	{
		id: 3,
		title: "Resource 03 - Neural Networks in Production",
		author: "Emma Rodriguez, David Kim",
		authors: ["Emma Rodriguez", "David Kim"],
		abstract:
			"Best practices for deploying and maintaining neural networks in production environments. Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien vitae pellentesque sem placerat in id cursus mi pretium tellus duis convallis tempus leo eu aenean sed diam urna tempor pulvinar vivamus fringilla lacus nec metus bibendum egestas iaculis massa nisl malesuada lacinia integer nunc posuere ut hendrerit.",
		description:
			"Best practices for deploying and maintaining neural networks in production environments. Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien vitae pellentesque sem placerat in id cursus mi pretium tellus duis convallis tempus leo eu aenean sed diam urna tempor pulvinar vivamus fringilla lacus nec metus bibendum egestas iaculis massa nisl malesuada lacinia integer nunc posuere ut hendrerit.",
		year: 2024,
		color: "bg-blue-50 text-blue-700 border-blue-200",
	},
	{
		id: 4,
		title: "Resource 04 - Blockchain Technology Overview",
		author: "Prof. Alex Kumar",
		authors: ["Prof. Alex Kumar"],
		abstract:
			"Understanding distributed ledger technology and its various applications beyond cryptocurrency. Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien vitae pellentesque sem placerat in id cursus mi pretium tellus duis convallis tempus leo eu aenean sed diam urna tempor pulvinar vivamus fringilla lacus nec metus bibendum egestas iaculis massa nisl malesuada lacinia integer nunc posuere ut hendrerit.",
		description:
			"Understanding distributed ledger technology and its various applications beyond cryptocurrency. Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien vitae pellentesque sem placerat in id cursus mi pretium tellus duis convallis tempus leo eu aenean sed diam urna tempor pulvinar vivamus fringilla lacus nec metus bibendum egestas iaculis massa nisl malesuada lacinia integer nunc posuere ut hendrerit.",
		year: 2023,
		color: "bg-pink-50 text-pink-700 border-pink-200",
	},
	{
		id: 5,
		title: "Resource 05 - Data Privacy and Security",
		author: "Lisa Anderson, Marcus Johnson, Rachel Lee",
		authors: ["Lisa Anderson", "Marcus Johnson", "Rachel Lee"],
		abstract:
			"Modern approaches to protecting sensitive data and ensuring compliance with international standards. Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien vitae pellentesque sem placerat in id cursus mi pretium tellus duis convallis tempus leo eu aenean sed diam urna tempor pulvinar vivamus fringilla lacus nec metus bibendum egestas iaculis massa nisl malesuada lacinia integer nunc posuere ut hendrerit.",
		description:
			"Modern approaches to protecting sensitive data and ensuring compliance with international standards. Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien vitae pellentesque sem placerat in id cursus mi pretium tellus duis convallis tempus leo eu aenean sed diam urna tempor pulvinar vivamus fringilla lacus nec metus bibendum egestas iaculis massa nisl malesuada lacinia integer nunc posuere ut hendrerit.",
		year: 2024,
		color: "bg-purple-50 text-purple-700 border-purple-200",
	},
	{
		id: 6,
		title: "Resource 06 - Cloud Architecture Patterns",
		author: "Dr. Robert Zhang",
		authors: ["Dr. Robert Zhang"],
		abstract:
			"Design patterns and best practices for building scalable cloud-native applications. Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien vitae pellentesque sem placerat in id cursus mi pretium tellus duis convallis tempus leo eu aenean sed diam urna tempor pulvinar vivamus fringilla lacus nec metus bibendum egestas iaculis massa nisl malesuada lacinia integer nunc posuere ut hendrerit.",
		description:
			"Design patterns and best practices for building scalable cloud-native applications. Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien vitae pellentesque sem placerat in id cursus mi pretium tellus duis convallis tempus leo eu aenean sed diam urna tempor pulvinar vivamus fringilla lacus nec metus bibendum egestas iaculis massa nisl malesuada lacinia integer nunc posuere ut hendrerit.",
		year: 2023,
		color: "bg-cyan-50 text-cyan-700 border-cyan-200",
	},
	{
		id: 7,
		title: "Resource 07 - Edge Computing Applications",
		author: "Jennifer White, Carlos Martinez",
		authors: ["Jennifer White", "Carlos Martinez"],
		abstract:
			"Leveraging edge computing for low-latency and offline-capable applications. Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien vitae pellentesque sem placerat in id cursus mi pretium tellus duis convallis tempus leo eu aenean sed diam urna tempor pulvinar vivamus fringilla lacus nec metus bibendum egestas iaculis massa nisl malesuada lacinia integer nunc posuere ut hendrerit.",
		description:
			"Leveraging edge computing for low-latency and offline-capable applications. Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien vitae pellentesque sem placerat in id cursus mi pretium tellus duis convallis tempus leo eu aenean sed diam urna tempor pulvinar vivamus fringilla lacus nec metus bibendum egestas iaculis massa nisl malesuada lacinia integer nunc posuere ut hendrerit.",
		year: 2024,
		color: "bg-rose-50 text-rose-700 border-rose-200",
	},
];

export function Resources() {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedPaper, setSelectedPaper] = useState(null);

	return (
		<>
			<div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
				{MOCK_RESOURCES.map((resource) => (
					<Card
						key={resource.id}
						className="group relative overflow-hidden bg-gradient-to-br from-primary/5 via-card to-background backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:from-primary/10 hover:via-card hover:to-background border border-border/50 cursor-pointer"
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
							<div className="flex flex-wrap gap-1.5">
								{resource.authors.map((author) => (
									<Badge
										key={author}
										variant="outline"
										className={`text-xs font-normal ${resource.color}`}
									>
										{author}
									</Badge>
								))}
							</div>
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

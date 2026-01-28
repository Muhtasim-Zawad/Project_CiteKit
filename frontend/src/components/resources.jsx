import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Card,
	CardAction,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
	CardContent,
} from "@/components/ui/card";
import { X } from "lucide-react";

const MOCK_RESOURCES = [
	{
		id: 1,
		title: "Resource 01 - Machine Learning",
		description:
			"A comprehensive guide to modern machine learning approaches and their applications in real-world scenarios. Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien vitae pellentesque sem placerat in id cursus mi pretium tellus duis convallis tempus leo eu aenean sed diam urna tempor pulvinar vivamus fringilla lacus nec metus bibendum egestas iaculis massa nisl malesuada lacinia integer nunc posuere ut hendrerit.",
		year: 2024,
		authors: ["Dr. Sarah Chen", "Prof. James Wilson"],
		color: "bg-amber-50 text-amber-700 border-amber-200",
	},
	{
		id: 2,
		title: "Resource 02 - Quantum Computing Fundamentals",
		description:
			"Explore the principles of quantum mechanics and their application to computational problems. Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien vitae pellentesque sem placerat in id cursus mi pretium tellus duis convallis tempus leo eu aenean sed diam urna tempor pulvinar vivamus fringilla lacus nec metus bibendum egestas iaculis massa nisl malesuada lacinia integer nunc posuere ut hendrerit.",
		year: 2023,
		authors: ["Dr. Michael Torres"],
		color: "bg-green-50 text-green-700 border-green-200",
	},
	{
		id: 3,
		title: "Resource 03 - Neural Networks in Production",
		description:
			"Best practices for deploying and maintaining neural networks in production environments. Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien vitae pellentesque sem placerat in id cursus mi pretium tellus duis convallis tempus leo eu aenean sed diam urna tempor pulvinar vivamus fringilla lacus nec metus bibendum egestas iaculis massa nisl malesuada lacinia integer nunc posuere ut hendrerit.",
		year: 2024,
		authors: ["Emma Rodriguez", "David Kim"],
		color: "bg-blue-50 text-blue-700 border-blue-200",
	},
	{
		id: 4,
		title: "Resource 04 - Blockchain Technology Overview",
		description:
			"Understanding distributed ledger technology and its various applications beyond cryptocurrency. Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien vitae pellentesque sem placerat in id cursus mi pretium tellus duis convallis tempus leo eu aenean sed diam urna tempor pulvinar vivamus fringilla lacus nec metus bibendum egestas iaculis massa nisl malesuada lacinia integer nunc posuere ut hendrerit.",
		year: 2023,
		authors: ["Prof. Alex Kumar"],
		color: "bg-pink-50 text-pink-700 border-pink-200",
	},
	{
		id: 5,
		title: "Resource 05 - Data Privacy and Security",
		description:
			"Modern approaches to protecting sensitive data and ensuring compliance with international standards. Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien vitae pellentesque sem placerat in id cursus mi pretium tellus duis convallis tempus leo eu aenean sed diam urna tempor pulvinar vivamus fringilla lacus nec metus bibendum egestas iaculis massa nisl malesuada lacinia integer nunc posuere ut hendrerit.",
		year: 2024,
		authors: ["Lisa Anderson", "Marcus Johnson", "Rachel Lee"],
		color: "bg-purple-50 text-purple-700 border-purple-200",
	},
	{
		id: 6,
		title: "Resource 06 - Cloud Architecture Patterns",
		description:
			"Design patterns and best practices for building scalable cloud-native applications. Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien vitae pellentesque sem placerat in id cursus mi pretium tellus duis convallis tempus leo eu aenean sed diam urna tempor pulvinar vivamus fringilla lacus nec metus bibendum egestas iaculis massa nisl malesuada lacinia integer nunc posuere ut hendrerit.",
		year: 2023,
		authors: ["Dr. Robert Zhang"],
		color: "bg-cyan-50 text-cyan-700 border-cyan-200",
	},
	{
		id: 7,
		title: "Resource 07 - Edge Computing Applications",
		description:
			"Leveraging edge computing for low-latency and offline-capable applications. Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien vitae pellentesque sem placerat in id cursus mi pretium tellus duis convallis tempus leo eu aenean sed diam urna tempor pulvinar vivamus fringilla lacus nec metus bibendum egestas iaculis massa nisl malesuada lacinia integer nunc posuere ut hendrerit.",
		year: 2024,
		authors: ["Jennifer White", "Carlos Martinez"],
		color: "bg-rose-50 text-rose-700 border-rose-200",
	},
];

export function Resources() {
	const [selectedResource, setSelectedResource] = useState(null);

	return (
		<>
			<div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
				{MOCK_RESOURCES.map((resource) => (
					<Card
						key={resource.id}
						className="group relative overflow-hidden bg-gradient-to-br from-primary/5 via-card to-background backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:from-primary/10 hover:via-card hover:to-background border border-border/50 cursor-pointer"
						onClick={() => setSelectedResource(resource)}
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

			{/* Modal */}
			<Dialog
				open={!!selectedResource}
				onOpenChange={() => setSelectedResource(null)}
			>
				<DialogContent
					showCloseButton={false}
					className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-card via-card to-background"
				>
					{selectedResource && (
						<>
							<DialogHeader className="space-y-4">
								<div className="flex items-start justify-between gap-4">
									<div className="flex-1">
										<DialogTitle className="text-2xl font-bold text-foreground">
											{selectedResource.title}
										</DialogTitle>
										<div className="flex items-center gap-3 mt-3 flex-wrap">
											<span
												className={`px-3 py-1.5 text-sm font-semibold rounded-lg ${selectedResource.color}`}
											>
												{selectedResource.year}
											</span>
										</div>
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

							<div className="space-y-6 py-4">
								{/* Authors Section */}
								<div>
									<h3 className="text-sm font-semibold text-foreground mb-2">
										Authors
									</h3>
									<div className="flex flex-wrap gap-2">
										{selectedResource.authors.map((author) => (
											<Badge
												key={author}
												className={`text-sm font-medium py-1.5 px-3 ${selectedResource.color}`}
												variant="outline"
											>
												{author}
											</Badge>
										))}
									</div>
								</div>

								{/* Description Section */}
								<div>
									<h3 className="text-sm font-semibold text-foreground mb-2">
										Description
									</h3>
									<p className="text-sm text-muted-foreground leading-relaxed">
										{selectedResource.description}
									</p>
								</div>

								{/* Action Buttons */}
								<div className="flex gap-3 pt-4 border-t border-border/30">
									<Button asChild className="flex-1" size="sm">
										<a href="#" onClick={() => setSelectedResource(null)}>
											View Full Paper
										</a>
									</Button>
									<Button
										variant="outline"
										size="sm"
										className="flex-1"
										onClick={() => setSelectedResource(null)}
									>
										Save for Later
									</Button>
									{/* <DialogClose asChild>
										<Button variant="ghost" size="sm" className="flex-1">
											Close
										</Button>
									</DialogClose> */}
								</div>
							</div>
						</>
					)}
				</DialogContent>
			</Dialog>
		</>
	);
}

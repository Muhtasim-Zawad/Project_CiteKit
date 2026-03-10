import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";
import { Group, Panel, Separator } from "react-resizable-panels";

export default function PaperDetailsModal({
	isOpen,
	onClose,
	selectedPaper,
	allPapers,
	onSelectPaper,
}) {
	const [viewMode, setViewMode] = useState("refs"); // "refs" or "citedBy"

	if (!isOpen || !selectedPaper) return null;

	return (
		<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
			<div className="bg-background rounded-lg shadow-lg w-11/12 h-11/12 flex flex-col">
				{/* Header with Close Button */}
				<div className="flex justify-between items-center p-2 pl-4 border-b">
					<h2 className="text-lg font-semibold">Paper Details</h2>
					<button
						onClick={onClose}
						className="p-2 hover:bg-muted rounded-md transition-colors"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				{/* Three-Panel Layout */}
				<div className="flex-1 overflow-hidden">
					<Group direction="horizontal" className="flex-1 h-full">
						{/* Left Panel: Papers List */}
						<Panel defaultSize={25} minSize={15}>
							<div className="h-full flex flex-col bg-muted/30 border-r">
								<div className="p-3 border-b">
									<Badge variant="secondary" className="text-xs">
										Saved Papers
									</Badge>
								</div>
								<div className="flex-1 overflow-y-auto p-3">
									<div className="space-y-2">
										{allPapers.map((paper) => (
											<Card
												key={paper.doi}
												onClick={() => onSelectPaper(paper)}
												className={`p-3 cursor-pointer transition-all ${
													paper.doi === selectedPaper.doi
														? "bg-primary text-primary-foreground shadow-md"
														: "hover:shadow-md hover:bg-muted"
												}`}
											>
												<h4 className="font-semibold text-xs line-clamp-2">
													{paper.title || "Untitled"}
												</h4>
												<p className="text-xs opacity-80 mt-1">
													{paper.author || "Unknown Author"}
												</p>
											</Card>
										))}
									</div>
								</div>
							</div>
						</Panel>

						<Separator className="group w-1 cursor-col-resize bg-border">
							<div className="mx-auto h-full w-0.5 bg-muted-foreground/40 group-hover:bg-primary transition-colors" />
						</Separator>

						{/* Middle Panel: Graph View */}
						<Panel defaultSize={45} minSize={15}>
							<div className="h-full flex flex-col border-r">
								<div className="p-2 border-b flex gap-2">
									<Button
										variant={viewMode === "refs" ? "default" : "outline"}
										size="sm"
										className="text-xs h-8"
										onClick={() => setViewMode("refs")}
									>
										Refs
									</Button>
									<Button
										variant={viewMode === "citedBy" ? "default" : "outline"}
										size="sm"
										className="text-xs h-8"
										onClick={() => setViewMode("citedBy")}
									>
										Cited By
									</Button>
								</div>
								<div className="flex-1 flex items-center justify-center text-muted-foreground">
									<p className="text-sm">
										{viewMode === "refs"
											? "References graph"
											: "Citations graph"}
									</p>
								</div>
							</div>
						</Panel>

						<Separator className="group w-1 cursor-col-resize bg-border">
							<div className="mx-auto h-full w-0.5 bg-muted-foreground/40 group-hover:bg-primary transition-colors" />
						</Separator>

						{/* Right Panel: Paper Details */}
						<Panel defaultSize={30} minSize={20}>
							<div className="h-full flex flex-col overflow-hidden">
								<div className="flex-1 overflow-y-auto p-4">
									<div className="space-y-4">
										<div>
											<h3 className="text-xl font-bold mb-2">
												{selectedPaper.title || "Untitled"}
											</h3>
											<p className="text-sm text-muted-foreground">
												By: {selectedPaper.author || "Unknown Author"}
											</p>
										</div>

										{selectedPaper.abstract && (
											<div>
												<h4 className="font-semibold text-sm mb-2">Abstract</h4>
												<p className="text-sm text-muted-foreground leading-relaxed">
													{selectedPaper.abstract}
												</p>
											</div>
										)}

										{selectedPaper.year && (
											<div>
												<h4 className="font-semibold text-sm mb-2">Year</h4>
												<p className="text-sm text-muted-foreground">
													{selectedPaper.year}
												</p>
											</div>
										)}

										{selectedPaper.score !== null &&
											selectedPaper.score !== undefined && (
												<div>
													<h4 className="font-semibold text-sm mb-2">
														Relevance Score
													</h4>
													<div className="flex items-center gap-2">
														<div className="flex-1 bg-muted rounded-full h-2">
															<div
																className="bg-primary h-2 rounded-full"
																style={{
																	width: `${Math.min(
																		(selectedPaper.score / 100) * 100,
																		100,
																	)}%`,
																}}
															/>
														</div>
														<span className="text-sm font-semibold">
															{selectedPaper.score.toFixed(2)}
														</span>
													</div>
												</div>
											)}

										{selectedPaper.critic_reasoning && (
											<div>
												<h4 className="font-semibold text-sm mb-2">
													Critic Notes
												</h4>
												<p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
													{selectedPaper.critic_reasoning}
												</p>
											</div>
										)}

										{selectedPaper.doi && (
											<div>
												<h4 className="font-semibold text-sm mb-2">DOI</h4>
												<p className="text-sm text-muted-foreground break-all">
													{selectedPaper.doi}
												</p>
											</div>
										)}
									</div>
								</div>

								{/* Bottom Action Buttons */}
								<div className="border-t p-4 flex justify-end gap-2">
									{selectedPaper.download_url && (
										<Button
											variant="outline"
											onClick={() =>
												window.open(selectedPaper.download_url, "_blank")
											}
										>
											View Full Paper
										</Button>
									)}
									<Button variant="destructive">Remove</Button>
								</div>
							</div>
						</Panel>
					</Group>
				</div>
			</div>
		</div>
	);
}

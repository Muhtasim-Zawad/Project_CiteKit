import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Plus } from "lucide-react";
import { Group, Panel, Separator } from "react-resizable-panels";
import ForceGraph2D from "react-force-graph-2d";
import api from "@/api";

export default function PaperDetailsModal({
	isOpen,
	onClose,
	selectedPaper,
	allPapers,
	onSelectPaper,
	projectId,
}) {
	const [viewMode, setViewMode] = useState("refs"); // "refs" or "citedBy"
	const [graphData, setGraphData] = useState(null);
	const [loadingGraph, setLoadingGraph] = useState(false);
	const [nodeDetails, setNodeDetails] = useState(null);
	const [savingPaper, setSavingPaper] = useState(false);
	const [hoveredNode, setHoveredNode] = useState(null);
	// const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
	const forceGraphRef = useRef();
	const graphContainerRef = useRef();
	const [graphDimensions, setGraphDimensions] = useState({
		width: 0,
		height: 0,
	});

	// Measure the graph container and keep dimensions in sync
	useEffect(() => {
		if (!graphContainerRef.current) return;

		const observer = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const { width, height } = entry.contentRect;
				setGraphDimensions({ width, height });
			}
		});
		observer.observe(graphContainerRef.current);
		return () => observer.disconnect();
	}, [isOpen]);

	// Check if a paper is in saved papers
	const isPaperSaved = (doi) => {
		return allPapers.some((p) => p.doi === doi);
	};

	// Fetch paper data and build graph
	useEffect(() => {
		if (!selectedPaper?.doi || !isOpen) return;

		const fetchAndBuildGraph = async () => {
			setLoadingGraph(true);
			setNodeDetails(null); // Reset node details when switching papers
			try {
				const response = await api.get("/research-network/by-doi", {
					params: { doi: selectedPaper.doi },
				});

				if (!response.data.success) {
					throw new Error(response.data.error);
				}

				const paperData = response.data;
				const nodes = [];
				const links = [];
				const nodeMap = new Map();

				// Add main paper as central node
				const mainNode = {
					id: paperData.doi || paperData.paper_id,
					label: paperData.title || "Unknown",
					title: paperData.title,
					doi: paperData.doi,
					paper_id: paperData.paper_id,
					authors: paperData.authors,
					abstract: paperData.abstract,
					year: paperData.year,
					venue: paperData.venue,
					fx: 0,
					fy: 0,
					isMain: true,
					// val: 30,
					val: 10,
				};
				nodes.push(mainNode);
				nodeMap.set(mainNode.id, mainNode);

				// Add references or citations based on viewMode
				const dataList =
					viewMode === "refs" ? paperData.references : paperData.citations;
				const limitedList = dataList ? dataList.slice(0, 50) : [];

				limitedList.forEach((item, idx) => {
					const nodeId = item.doi || item.paper_id;
					if (nodeId && !nodeMap.has(nodeId)) {
						const angle = (idx / limitedList.length) * 2 * Math.PI;
						const radius = 200;
						const node = {
							id: nodeId,
							label: item.title || "Unknown",
							title: item.title,
							doi: item.doi,
							paper_id: item.paper_id,
							authors: item.authors,
							year: item.year,
							venue: item.venue,
							x: Math.cos(angle) * radius,
							y: Math.sin(angle) * radius,
							val: 5,
						};
						nodes.push(node);
						nodeMap.set(nodeId, node);

						// Create link from main paper to this paper
						links.push({
							source: mainNode.id,
							target: nodeId,
						});
					}
				});

				setGraphData({ nodes, links });

				// After a short delay, release all pinned nodes so they become draggable
				// setTimeout(() => {
				// 	if (forceGraphRef.current) {
				// 		nodes.forEach((node) => {
				// 			if (!node.isMain) {
				// 				node.fx = undefined;
				// 				node.fy = undefined;
				// 			}
				// 		});
				// 	}
				// }, 1000); // let simulation settle, then unpin
			} catch (error) {
				console.error("Error fetching paper data:", error);
				setGraphData(null);
			} finally {
				setLoadingGraph(false);
			}
		};

		fetchAndBuildGraph();
	}, [selectedPaper?.doi, viewMode, isOpen]);

	// After graph data loads, zoom to fit so everything is visible
	useEffect(() => {
		if (!graphData || !forceGraphRef.current) return;
		const timer = setTimeout(() => {
			forceGraphRef.current.zoomToFit(400, 40);
		}, 800); // wait for simulation to settle a bit
		return () => clearTimeout(timer);
	}, [graphData]);

	// Handle node click
	const handleNodeClick = async (node) => {
		if (node.isMain) return; // Don't click on main paper node

		try {
			// setLoadingGraph(true);
			const response = await api.get("/research-network/reference-details", {
				params: { paper_id: node.paper_id },
			});

			if (response.data.success) {
				setNodeDetails({
					...node,
					...response.data,
				});
			}
		} catch (error) {
			console.error("Error fetching node details:", error);
			setNodeDetails(node);
		} finally {
			setLoadingGraph(false);
		}
	};

	// Handle save paper
	const handleSavePaper = async () => {
		if (!nodeDetails || !projectId) return;

		try {
			setSavingPaper(true);
			await api.post(`/projects/${projectId}/references`, {
				doi: nodeDetails.doi,
				title: nodeDetails.title,
				author: nodeDetails.authors?.[0]?.name || "Unknown",
				abstract: nodeDetails.abstract,
				year: nodeDetails.year,
			});

			// Update the nodeDetails to mark it as saved locally
			// This ensures the "Saved" indicator appears immediately
			const newPaper = {
				doi: nodeDetails.doi,
				title: nodeDetails.title,
				author: nodeDetails.authors?.[0]?.name || "Unknown",
				abstract: nodeDetails.abstract,
				year: nodeDetails.year,
				...nodeDetails,
			};

			// Update nodeDetails state to show it's now saved
			setNodeDetails(newPaper);

			// Also update the selected paper in case user navigates
			onSelectPaper(newPaper);
		} catch (error) {
			console.error("Error saving paper:", error);
		} finally {
			setSavingPaper(false);
		}
	};

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

						{/* <PanelResizeHandle className="w-1 bg-border hover:bg-primary transition-colors cursor-col-resize" /> */}

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
										References
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
								{/* <div className="flex-1 flex items-center justify-center text-muted-foreground overflow-hidden relative"> */}
								<div
									ref={graphContainerRef}
									className="flex-1 flex items-center justify-center relative overflow-hidden"
								>
									{loadingGraph ? (
										<p className="text-sm">Loading graph...</p>
									) : graphData && graphData.nodes.length > 0 ? (
										<div className="w-full h-full relative">
											<ForceGraph2D
												ref={forceGraphRef}
												graphData={graphData}
												// Explicit dimensions prevent the canvas from overflowing
												width={graphDimensions.width}
												height={graphDimensions.height}
												nodeAutoColorBy="group"
												nodeCanvasObject={(node, ctx) => {
													const size = node.val || 10;
													const color = node.isMain ? "#3b82f6" : "#8b5cf6";

													// Draw node circle
													ctx.fillStyle = color;
													ctx.beginPath();
													ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
													ctx.fill();

													// Draw label
													if (node.isMain) {
														const fontSize = 5;
														ctx.font = `bold ${fontSize}px Arial`;
														ctx.fillStyle = "#ffffff";
														ctx.textAlign = "center";
														ctx.textBaseline = "middle";
														ctx.fillText(
															node.label.substring(0, 20),
															node.x,
															node.y,
														);
													}
												}}
												nodePointerAreaPaint={(node, color, ctx) => {
													ctx.fillStyle = color;
													ctx.beginPath();
													ctx.arc(node.x, node.y, node.val + 4, 0, 2 * Math.PI);
													ctx.fill();
												}}
												onNodeClick={handleNodeClick}
												onNodeHover={(node) => {
													setHoveredNode(node);
												}}
												linkWidth={2}
												linkColor={() => "#8b5cf68a"}
												// Strong repulsion + longer links so nodes spread out
												d3AlphaDecay={0.02}
												d3VelocityDecay={0.3}
												d3Force="charge"
												d3ForceStrength={-400}
												dagLevelDistance={120}
												// d3AlphaDecay={0.02}
												// d3VelocityDecay={0.3}
												// d3Force="charge"
												// d3ForceParameters={{
												// 	charge: {
												// 		strength: -150,
												// 		distanceMax: 2000,
												// 	},
												// 	link: {
												// 		distance: 120,
												// 	},
												// }}
											/>

											{/* Hover Tooltip */}
											{hoveredNode && !hoveredNode.isMain && (
												<div
													className="absolute bg-slate-900 text-white text-xs rounded-lg p-3 max-w-xs shadow-lg border border-slate-700 z-10 pointer-events-none"
													style={{
														left: "10px",
														top: "10px",
													}}
												>
													<p className="font-semibold text-sm line-clamp-2 mb-1">
														{hoveredNode.title || hoveredNode.label}
													</p>
													{hoveredNode.authors &&
														hoveredNode.authors.length > 0 && (
															<p className="text-slate-300 line-clamp-1 mb-1">
																{hoveredNode.authors
																	.slice(0, 2)
																	.map((a) => a.name)
																	.join(", ")}
																{hoveredNode.authors.length > 2 && " ..."}
															</p>
														)}
													{hoveredNode.year && (
														<p className="text-slate-400">
															Year: {hoveredNode.year}
														</p>
													)}
													{hoveredNode.citations_count !== undefined && (
														<p className="text-slate-400">
															Citations: {hoveredNode.citations_count}
														</p>
													)}
												</div>
											)}
										</div>
									) : (
										<p className="text-sm">
											{viewMode === "refs"
												? "No references graph available"
												: "No citations graph available"}
										</p>
									)}
								</div>
							</div>
						</Panel>
						{/* <PanelResizeHandle className="w-1 bg-border hover:bg-primary transition-colors cursor-col-resize" /> */}

						<Separator className="group w-1 cursor-col-resize bg-border">
							<div className="mx-auto h-full w-0.5 bg-muted-foreground/40 group-hover:bg-primary transition-colors" />
						</Separator>

						{/* Right Panel: Paper Details */}
						<Panel defaultSize={30} minSize={20}>
							<div className="h-full flex flex-col overflow-hidden">
								<div className="flex-1 overflow-y-auto p-4">
									<div className="space-y-4">
										{nodeDetails ? (
											// Display details of clicked node
											<>
												<div>
													<h3 className="text-xl font-bold mb-2">
														{nodeDetails.title || "Untitled"}
													</h3>
													<p className="text-sm text-muted-foreground">
														By:{" "}
														{nodeDetails.authors?.length > 0
															? nodeDetails.authors[0].name
															: "Unknown Author"}
													</p>
												</div>

												{nodeDetails.abstract && (
													<div>
														<h4 className="font-semibold text-sm mb-2">
															Abstract
														</h4>
														<p className="text-sm text-muted-foreground leading-relaxed">
															{nodeDetails.abstract}
														</p>
													</div>
												)}

												{nodeDetails.year && (
													<div>
														<h4 className="font-semibold text-sm mb-2">Year</h4>
														<p className="text-sm text-muted-foreground">
															{nodeDetails.year}
														</p>
													</div>
												)}

												{nodeDetails.venue && (
													<div>
														<h4 className="font-semibold text-sm mb-2">
															Venue
														</h4>
														<p className="text-sm text-muted-foreground">
															{nodeDetails.venue}
														</p>
													</div>
												)}

												{nodeDetails.citations_count !== undefined && (
													<div>
														<h4 className="font-semibold text-sm mb-2">
															Citation Count
														</h4>
														<p className="text-sm text-muted-foreground">
															{nodeDetails.citations_count}
														</p>
													</div>
												)}

												{nodeDetails.references_count !== undefined && (
													<div>
														<h4 className="font-semibold text-sm mb-2">
															Reference Count
														</h4>
														<p className="text-sm text-muted-foreground">
															{nodeDetails.references_count}
														</p>
													</div>
												)}

												{nodeDetails.doi && (
													<div>
														<h4 className="font-semibold text-sm mb-2">DOI</h4>
														<p className="text-sm text-muted-foreground break-all">
															{nodeDetails.doi}
														</p>
													</div>
												)}
											</>
										) : (
											// Display details of original selected paper
											<>
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
														<h4 className="font-semibold text-sm mb-2">
															Abstract
														</h4>
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
											</>
										)}
									</div>
								</div>

								{/* Bottom Action Buttons */}
								<div className="border-t p-4 flex justify-end gap-2">
									{nodeDetails && !isPaperSaved(nodeDetails.doi) && (
										<Button
											onClick={handleSavePaper}
											disabled={savingPaper}
											className="gap-2"
										>
											<Plus className="w-4 h-4" />
											{savingPaper ? "Saving..." : "Save Paper"}
										</Button>
									)}
									{nodeDetails && isPaperSaved(nodeDetails.doi) && (
										<p className="text-xs text-muted-foreground">Saved</p>
									)}
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
									{!nodeDetails && (
										<Button variant="destructive">Remove</Button>
									)}
								</div>
							</div>
						</Panel>
					</Group>
				</div>
			</div>
		</div>
	);
}

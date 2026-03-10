import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/api";

export function NewProject({ trigger, onSave }) {
	const navigate = useNavigate();
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [open, setOpen] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			const response = await api.post("/projects/", {
				title,
				description,
			});
			const projectId = response.data.project_id;
			setOpen(false);
			setTitle("");
			setDescription("");
			onSave?.(projectId);
			// Navigate to the new project workspace
			navigate(`/workspace/${projectId}`);
		} catch (err) {
			setError(err.response?.data?.detail || "Failed to create project");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{trigger}</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<form onSubmit={handleSubmit}>
					<DialogHeader className="mb-2">
						<DialogTitle>Create New Project</DialogTitle>
						<DialogDescription>
							Enter project details below. Click save when you&apos;re done.
						</DialogDescription>
					</DialogHeader>
					{error && (
						<div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm mb-4">
							{error}
						</div>
					)}
					<div className="grid gap-4">
						<div className="grid gap-3">
							<Label htmlFor="name-1">Project Title</Label>
							<Input
								id="name-1"
								name="name"
								placeholder="Project name"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								required
							/>
						</div>
						<div className="grid gap-3">
							<Label htmlFor="description-1">Description</Label>
							<Input
								id="description-1"
								name="description"
								placeholder="Project description"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								required
							/>
						</div>
					</div>
					<DialogFooter className="mt-4">
						<DialogClose asChild>
							<Button variant="outline" type="button" disabled={loading}>
								Cancel
							</Button>
						</DialogClose>
						<Button type="submit" disabled={loading}>
							{loading ? "Creating..." : "Create project"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

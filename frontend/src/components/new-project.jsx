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

export function NewProject({ trigger, onSave }) {
	const handleSubmit = (e) => {
		e.preventDefault();
		onSave?.();
	};

	return (
		<Dialog>
			<DialogTrigger asChild>{trigger}</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<form onSubmit={handleSubmit}>
					<DialogHeader className="mb-2">
						<DialogTitle>Create New Project</DialogTitle>
						<DialogDescription>
							Enter project details below. Click save when you&apos;re done.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4">
						<div className="grid gap-3">
							<Label htmlFor="name-1">Project Title</Label>
							<Input id="name-1" name="name" placeholder="Project name" />
						</div>
						<div className="grid gap-3">
							<Label htmlFor="description-1">Description</Label>
							<Input
								id="description-1"
								name="description"
								placeholder="Project description"
							/>
						</div>
					</div>
					<DialogFooter className="mt-4">
						<DialogClose asChild>
							<Button variant="outline" type="button">
								Cancel
							</Button>
						</DialogClose>
						<DialogClose asChild>
							<Button type="submit">Create project</Button>
						</DialogClose>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

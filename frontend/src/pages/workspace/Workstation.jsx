import { AppSidebar } from "@/components/app-sidebar";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

// import { Group, Panel, Separator } from "react-resizable-panels";
import { Group, Panel, Separator } from "react-resizable-panels";

import data from "./data.json";
import Editor from "@/components/rich-text-editor/editor";

export default function Workstation() {
	return (
		<SidebarProvider
			style={{
				"--sidebar-width": "calc(var(--spacing) * 72)",
				"--header-height": "calc(var(--spacing) * 12)",
			}}
		>
			<AppSidebar variant="inset" />

			<SidebarInset className="flex h-screen flex-col">
				<SiteHeader />

				<div className="flex-1 overflow-hidden">
					<Group direction="horizontal" className="flex-1 h-full">
						<Panel defaultSize={70} minSize={20}>
							<div className="h-full min-h-0 p-4">
								<Editor />
							</div>
						</Panel>

						<Separator className="group w-1 cursor-col-resize bg-border">
							<div className="mx-auto h-full w-0.5 bg-muted-foreground/40 group-hover:bg-primary transition-colors" />
						</Separator>

						<Panel defaultSize={30} minSize={20}>
							<div className="h-full p-4 min-h-0">
								<Editor />
							</div>
						</Panel>
					</Group>
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}

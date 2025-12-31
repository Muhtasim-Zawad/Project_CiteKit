import { AppSidebar } from "@/components/app-sidebar";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

// import { Group, Panel, Separator } from "react-resizable-panels";
import { Group, Panel, Separator } from "react-resizable-panels";

import data from "./data.json";
import Editor from "@/components/rich-text-editor/editor";

// export default function Workstation() {
// 	return (
// 		<SidebarProvider
// 			style={{
// 				"--sidebar-width": "calc(var(--spacing) * 72)",
// 				"--header-height": "calc(var(--spacing) * 12)",
// 			}}
// 		>
// 			<AppSidebar variant="inset" />
// 			<SidebarInset className="flex h-screen flex-col">
// 				<SiteHeader />
// 				{/* <div className="flex flex-1 flex-col">
// 					<div className="@container/main flex flex-1 gap-2">
// 						<div className="flex flex-col gap-4 py-4 md:gap-6 md:px-6">
// 							<div className="max-2-3xl mx-auto py-8">
// 								<Editor />
// 							</div>
// 						</div>
// 					</div>
// 				</div> */}

// 				<div className="flex-1 overflow-hidden">
// 					<Group direction="horizontal" className="flex-1 h-full">
// 						{/* Left pane */}
// 						<Panel defaultSize={50} minSize={20}>
// 							<div className="h-full p-4">
// 								<Editor />
// 							</div>
// 						</Panel>

// 						{/* Drag handle */}
// 						{/* <Separator className="w-1 bg-border hover:bg-primary/40 transition-colors cursor-col-resize" /> */}
// 						<Separator className="group w-1 bg-border cursor-col-resize">
// 							<div className="mx-auto h-full w-0.5 bg-muted-foreground/40 group-hover:bg-primary transition-colors" />
// 						</Separator>

// 						{/* Right pane */}
// 						<Panel defaultSize={50} minSize={20}>
// 							<div className="h-full p-4">
// 								<Editor />
// 							</div>
// 						</Panel>
// 					</Group>
// 				</div>
// 			</SidebarInset>
// 		</SidebarProvider>
// 	);
// }

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
							<div className="h-full p-4 min-w-0">
								<Editor />
							</div>
						</Panel>

						<Separator className="group w-1 cursor-col-resize bg-border">
							<div className="mx-auto h-full w-0.5 bg-muted-foreground/40 group-hover:bg-primary transition-colors" />
						</Separator>

						<Panel defaultSize={30} minSize={20}>
							<div className="h-full p-4 min-w-0">
								<Editor />
							</div>
						</Panel>
					</Group>
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}

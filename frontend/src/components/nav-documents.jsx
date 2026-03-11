"use client";

import {
	IconDots,
	IconFolder,
	IconShare3,
	IconTrash,
} from "@tabler/icons-react";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuAction,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";

export function NavDocuments({
	items,
	title = "Recent Projects",
	isScrollable = false,
	isLoading = false,
	onItemClick = null,
}) {
	const { isMobile } = useSidebar();

	if (isLoading) {
		return (
			<SidebarGroup className="group-data-[collapsible=icon]:hidden">
				<SidebarGroupLabel>{title}</SidebarGroupLabel>
				<div className="px-2 py-2 text-sm text-muted-foreground">
					Loading...
				</div>
			</SidebarGroup>
		);
	}

	if (items.length === 0) {
		return (
			<SidebarGroup className="group-data-[collapsible=icon]:hidden">
				<SidebarGroupLabel>{title}</SidebarGroupLabel>
				<div className="px-2 py-2 text-sm text-muted-foreground">No items</div>
			</SidebarGroup>
		);
	}

	return (
		<SidebarGroup
			className={`group-data-[collapsible=icon]:hidden ${isScrollable ? "flex-shrink max-h-64 overflow-y-auto" : ""}`}
		>
			<SidebarGroupLabel>{title}</SidebarGroupLabel>
			<SidebarMenu>
				{items.map((item) => (
					<SidebarMenuItem key={item.name}>
						<SidebarMenuButton asChild>
							<button
								onClick={() => onItemClick?.(item)}
								className="w-full flex items-center gap-2 px-2 py-1.5 text-left"
							>
								<item.icon />
								<span>{item.name}</span>
							</button>
						</SidebarMenuButton>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<SidebarMenuAction
									showOnHover
									className="data-[state=open]:bg-accent rounded-sm"
								>
									<IconDots />
									<span className="sr-only">More</span>
								</SidebarMenuAction>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								className="w-24 rounded-lg"
								side={isMobile ? "bottom" : "right"}
								align={isMobile ? "end" : "start"}
							>
								<DropdownMenuItem variant="destructive">
									<IconTrash />
									<span>Delete</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				))}
				<SidebarMenuItem>
					<SidebarMenuButton className="text-sidebar-foreground/70">
						<IconDots className="text-sidebar-foreground/70" />
						<span>More</span>
					</SidebarMenuButton>
				</SidebarMenuItem>
			</SidebarMenu>
		</SidebarGroup>
	);
}

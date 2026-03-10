import * as React from "react";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import {
	IconCamera,
	IconChartBar,
	IconDashboard,
	IconDatabase,
	IconFileAi,
	IconFileDescription,
	IconFileWord,
	IconFolder,
	IconHelp,
	IconInnerShadowTop,
	IconListDetails,
	IconReport,
	IconSearch,
	IconSettings,
	IconUsers,
	IconMessage,
} from "@tabler/icons-react";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import { useView } from "@/context/ViewContext";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { X } from "lucide-react";
import { SettingsProfile1 } from "@/components/settings-profile1";

const defaultData = {
	user: {
		name: "Muhtasim Zawad",
		email: "muhtaismzawad@iut-dhaka.edu",
		avatar: "/avatars/shadcn.jpg",
	},
	navMain: [
		{
			title: "Projects",
			url: "#",
			icon: IconFolder,
			viewType: "projects",
		},
		{
			title: "Resources",
			url: "#",
			icon: IconListDetails,
			viewType: "resources",
		},
		{
			title: "Team",
			url: "#",
			icon: IconUsers,
			viewType: "team",
		},
	],
	navClouds: [
		{
			title: "Capture",
			icon: IconCamera,
			isActive: true,
			url: "#",
			items: [
				{
					title: "Active Proposals",
					url: "#",
				},
				{
					title: "Archived",
					url: "#",
				},
			],
		},
		{
			title: "Proposal",
			icon: IconFileDescription,
			url: "#",
			items: [
				{
					title: "Active Proposals",
					url: "#",
				},
				{
					title: "Archived",
					url: "#",
				},
			],
		},
		{
			title: "Prompts",
			icon: IconFileAi,
			url: "#",
			items: [
				{
					title: "Active Proposals",
					url: "#",
				},
				{
					title: "Archived",
					url: "#",
				},
			],
		},
	],
	navSecondary: [
		{
			title: "Settings",
			url: "#",
			icon: IconSettings,
		},
		{
			title: "Get Help",
			url: "#",
			icon: IconHelp,
		},
	],
	documents: [
		{
			name: "Project_01",
			url: "#",
			icon: IconFileDescription,
		},
		{
			name: "Project_02",
			url: "#",
			icon: IconFileDescription,
		},
		{
			name: "Project_03",
			url: "#",
			icon: IconFileDescription,
		},
	],
};

const workspaceData = {
	user: {
		name: "Muhtasim Zawad",
		email: "muhtaismzawad@iut-dhaka.edu",
		avatar: "/avatars/shadcn.jpg",
	},
	navMain: [
		{
			title: "Saved",
			url: "#",
			icon: IconListDetails,
			viewType: "saved",
		},
	],
	navSecondary: [
		{
			title: "Settings",
			url: "#",
			icon: IconSettings,
		},
		{
			title: "Get Help",
			url: "#",
			icon: IconHelp,
		},
	],
	chats: [
		{
			name: "Chat_01",
			url: "#",
			icon: IconMessage,
		},
		{
			name: "Chat_02",
			url: "#",
			icon: IconMessage,
		},
		{
			name: "Chat_03",
			url: "#",
			icon: IconMessage,
		},
	],
};

// Settings Modal Component
const SettingsModal = ({ isOpen, onClose, user }) => {
	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0 [&>button:last-child]:hidden">
				<div className="p-6">
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-2xl font-bold">Settings & Profile</h2>
						<DialogClose asChild>
							<Button variant="ghost" size="icon" className="h-8 w-8">
								<X className="h-4 w-4" />
							</Button>
						</DialogClose>
					</div>
					<SettingsProfile1
						defaultValues={{
							name: user.name,
							email: user.email,
							username: user.name.toLowerCase().replace(/\s+/g, ""),
							avatar: user.avatar,
							bio: "Update your profile information here.",
						}}
						className="border-0 shadow-none"
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export function AppSidebar({ ...props }) {
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);
	const { setActiveView, activeView } = useView();
	const location = useLocation();
	const isWorkspace = location.pathname.includes("/workspace");

	const data = isWorkspace ? workspaceData : defaultData;

	const handleNavClick = (viewType) => {
		if (viewType) {
			setActiveView(viewType);
		}
	};

	return (
		<Sidebar collapsible="offcanvas" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							asChild
							className="data-[slot=sidebar-menu-button]:p-1.5!"
						>
							<a href="#">
								<IconInnerShadowTop className="size-5!" />
								<span className="text-base font-semibold">CiteKit</span>
							</a>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain
					items={data.navMain}
					onItemClick={handleNavClick}
					isWorkspace={isWorkspace}
					activeView={activeView}
				/>
				{isWorkspace ? (
					<NavDocuments items={data.chats} title="Recent Chats" />
				) : (
					<NavDocuments items={data.documents} />
				)}
				<NavSecondary
					items={data.navSecondary}
					className="mt-auto"
					onSettingsClick={() => setIsSettingsOpen(true)}
				/>
			</SidebarContent>
			<SidebarFooter>
				<NavUser
					user={data.user}
					onAccountClick={() => setIsSettingsOpen(true)}
				/>
			</SidebarFooter>
			<SettingsModal
				isOpen={isSettingsOpen}
				onClose={() => setIsSettingsOpen(false)}
				user={data.user}
			/>
		</Sidebar>
	);
}

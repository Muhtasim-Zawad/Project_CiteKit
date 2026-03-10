import { IconCirclePlusFilled, IconMail } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { NewProject } from "@/components/new-project";

import { Button } from "@/components/ui/button";
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavMain({ items, onItemClick, isWorkspace, activeView }) {
	const navigate = useNavigate();
	const openProject = () => {
		// navigate(`/workspace/${projectId}`);
		navigate("/workspace");
	};

	const handleNewChat = () => {
		// TODO: Implement new chat creation
		console.log("New chat creation");
	};

	return (
		<SidebarGroup>
			<SidebarGroupContent className="flex flex-col gap-2">
				<SidebarMenu>
					<SidebarMenuItem className="flex items-center gap-2">
						{isWorkspace ? (
							<Button
								onClick={handleNewChat}
								className="hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground transition-colors duration-100 ease-linear w-full justify-start gap-2"
								variant="outline"
							>
								<IconCirclePlusFilled className="size-4" />
								<span>New Chat</span>
							</Button>
						) : (
							<NewProject
								trigger={
									<SidebarMenuButton
										tooltip="Quick Create"
										className="hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground transition-colors min-w-8 duration-100 ease-linear"
									>
										<IconCirclePlusFilled />
										<span>New Project</span>
									</SidebarMenuButton>
								}
							/>
						)}
					</SidebarMenuItem>
				</SidebarMenu>
				<SidebarMenu>
					{items.map((item) => (
						<SidebarMenuItem key={item.title}>
							<SidebarMenuButton
								tooltip={item.title}
								isActive={item.viewType === activeView}
								onClick={() => {
									onItemClick?.(item.viewType);
								}}
							>
								{item.icon && <item.icon />}
								<span>{item.title}</span>
							</SidebarMenuButton>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}

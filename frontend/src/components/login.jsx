import { IconInnerShadowTop } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

export default function LoginPage() {
	const navigate = useNavigate();
	const { login } = useAuth();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			await login(email, password);
			navigate("/dashboard");
		} catch (err) {
			setError(err.response?.data?.detail || "Login failed. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<section className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-16 dark:bg-transparent">
			<form
				onSubmit={handleSubmit}
				className="bg-muted m-auto h-fit w-full max-w-sm overflow-hidden rounded-[calc(var(--radius)+.125rem)] border shadow-md shadow-zinc-950/5 dark:[--color-muted:var(--color-zinc-900)]"
			>
				<div className="bg-card -m-px rounded-[calc(var(--radius)+.125rem)] border p-8 pb-6">
					<div className="text-center">
						<a href="/" aria-label="go home" className="mx-auto block w-fit">
							<IconInnerShadowTop />
						</a>
						<h1 className="mb-1 mt-4 text-xl font-semibold">
							Sign In to CiteKit
						</h1>
						<p className="text-sm">Welcome back! Sign in to continue</p>
					</div>

					{error && (
						<div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
							{error}
						</div>
					)}

					<div className="mt-6 space-y-6 ">
						<div className="space-y-2">
							<Label htmlFor="email" className="block text-sm">
								Email
							</Label>
							<Input
								type="email"
								required
								name="email"
								id="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="shadow-sm"
							/>
						</div>

						<div className="space-y-0.5">
							<div className="flex items-center justify-between">
								<Label htmlFor="pwd" className="text-sm">
									Password
								</Label>
								<Button asChild variant="link" size="sm">
									<a
										href="#"
										className="link intent-info variant-ghost text-sm"
									>
										Forgot your Password ?
									</a>
								</Button>
							</div>
							<Input
								type="password"
								required
								name="pwd"
								id="pwd"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="input sz-md variant-mixed shadow-sm"
							/>
						</div>
						<Button type="submit" className="w-full" disabled={loading}>
							{loading ? "Signing In..." : "Sign In"}
						</Button>
					</div>
				</div>

				<div className="p-3">
					<p className="text-accent-foreground text-center text-sm">
						Don't have an account ?
						<Button asChild variant="link" className="px-2">
							<RouterLink to="/auth/signup">Create account</RouterLink>
						</Button>
					</p>
				</div>
			</form>
		</section>
	);
}

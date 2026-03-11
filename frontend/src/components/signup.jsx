import { IconInnerShadowTop } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

export default function SignupPage() {
	const navigate = useNavigate();
	const { signup } = useAuth();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");

		// Validation
		if (!name.trim()) {
			setError("Name is required");
			return;
		}
		if (password !== confirmPassword) {
			setError("Passwords do not match");
			return;
		}
		if (password.length < 6) {
			setError("Password must be at least 6 characters");
			return;
		}

		setLoading(true);

		try {
			await signup(email, password, name);
			navigate("/dashboard");
		} catch (err) {
			setError(
				err.response?.data?.detail || "Signup failed. Please try again.",
			);
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
							Create CiteKit Account
						</h1>
						<p className="text-sm">Join us to get started</p>
					</div>

					{error && (
						<div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
							{error}
						</div>
					)}

					<div className="mt-6 space-y-4">
						<div className="space-y-2">
							<Label htmlFor="name" className="block text-sm">
								Full Name
							</Label>
							<Input
								type="text"
								required
								name="name"
								id="name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								className="shadow-sm"
								placeholder="John Doe"
							/>
						</div>

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
								placeholder="your@email.com"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="pwd" className="text-sm">
								Password
							</Label>
							<Input
								type="password"
								required
								name="pwd"
								id="pwd"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="input sz-md variant-mixed shadow-sm"
								placeholder="At least 6 characters"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="confirm-pwd" className="text-sm">
								Confirm Password
							</Label>
							<Input
								type="password"
								required
								name="confirm-pwd"
								id="confirm-pwd"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								className="input sz-md variant-mixed shadow-sm"
								placeholder="Confirm password"
							/>
						</div>

						<Button type="submit" className="w-full mt-6" disabled={loading}>
							{loading ? "Creating Account..." : "Create Account"}
						</Button>
					</div>
				</div>

				<div className="p-3">
					<p className="text-accent-foreground text-center text-sm">
						Already have an account ?
						<Button asChild variant="link" className="px-2">
							<RouterLink to="/auth/login">Sign in</RouterLink>
						</Button>
					</p>
				</div>
			</form>
		</section>
	);
}

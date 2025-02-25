// Node modules
import React from "react";
import { useNavigate } from "react-router-dom";

//shadcn
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSeparator,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";

// Local
import { SERVER_IP } from "@/const";
import { useAppProvider } from "providers/AppProvider";

const OTP_Page = (): React.ReactElement => {
	const { appState } = useAppProvider();
	const navigate = useNavigate();
	const [value, setValue] = React.useState("");

	const verify_otp = () => {
		console.log(value);
		fetch(`${SERVER_IP}/otp/verify?user_id=${appState.user_id}&otp=${value}`, {
			method: "GET",
			credentials: "include",
		})
			.then((res) => {
				if (res.ok) {
					navigate("/home");
				} else {
					throw res.text();
				}
			})
			.catch((err) => {
				console.error(err);
			});
	};

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-primary p-4">
			<div className="bg-secondary p-8 rounded-lg shadow-lg w-full max-w-md flex flex-col items-center gap-8">
				<h1 className="text-2xl font-bold text-primary_fg mb-4">
					Verification Code
				</h1>

				<InputOTP
					maxLength={6}
					value={value}
					onChange={setValue}
					className="gap-4"
				>
					<InputOTPGroup className="gap-2">
						<InputOTPSlot index={0} className="h-16 w-12 text-xl" />
						<InputOTPSlot index={1} className="h-16 w-12 text-xl" />
						<InputOTPSlot index={2} className="h-16 w-12 text-xl" />
					</InputOTPGroup>
					<InputOTPSeparator className="text-primary_fg" />
					<InputOTPGroup className="gap-2">
						<InputOTPSlot index={3} className="h-16 w-12 text-xl" />
						<InputOTPSlot index={4} className="h-16 w-12 text-xl" />
						<InputOTPSlot index={5} className="h-16 w-12 text-xl" />
					</InputOTPGroup>
				</InputOTP>

				<Button
					onClick={verify_otp}
					className="mt-4 w-full bg-secondary_fg text-primary hover:bg-hoverEffect"
				>
					Verify Code
				</Button>
			</div>
		</div>
	);
};

export default OTP_Page;

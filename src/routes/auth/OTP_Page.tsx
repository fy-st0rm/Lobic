// Node modules
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

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
	const { route, userId } = useParams<{ route: string, userId: string }>();

	const { updateAppState } = useAppProvider();
	const navigate = useNavigate();
	const [value, setValue] = useState<string>("");
	const [resMsg, setMsg] = useState<string>("");
	const [color, setColor] = useState<string>("");

	const verify_otp = async () => {
		let payload = {
			user_id: userId,
			otp: value,
			for: "otp",
		};

		if (route === "home") {
			payload.for = "email";
		} else if (route === "changepassword") {
			payload.for = "otp";
		} else {
			console.log(`Invalid route: ${route}`);
		}

		let response = await fetch(`${SERVER_IP}/otp/verify`, {
			method: "POST",
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		});
		
		if (response.ok) {
			// NOTE: Keeping the user id in app state even if the user is not logged in and i dont give a shit
			updateAppState({ user_id: userId });
			navigate(`/${route}`);
		} else {
			let msg = await response.text();
			setMsg(msg);
			setColor("text-red-500");
		};
	};

	const resend_otp = async () => {
		let response = await fetch(`${SERVER_IP}/otp/resend/${userId}`, {
			method: "GET",
			credentials: "include",
		});

		let msg = await response.text();
		setMsg(msg);
		if (response.ok) {
			setColor("text-green-500");
		} else {
			setColor("text-red-500");
		}
	}

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

				<div className="flex flex-row space-x-2">
					<p> Didn't receive code? </p>
					<a onClick={resend_otp} className="text-blue-500 underline hover:text-blue-700">
						Request again
					</a>
				</div>

				{
					resMsg &&
					<div className={`text-sm ${color}`}>
						{ resMsg }
					</div>
				}
			</div>
		</div>
	);
};

export default OTP_Page;

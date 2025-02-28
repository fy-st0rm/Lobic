/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				primary: "#0B0E15",
				secondary: "#1E212A",
				primary_fg: "#E7E7E7",
				secondary_fg: "#E0E1DD",
				hoverEffect: "#D9D9D9",
				darker:"#13171E",
				outgoing:"2C6377",
				vivid: '#9BB9FF',
				button: '#2C6377',
				button_hover: '#214A58',

				// for shadcn/ui
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				},
			},

			animation: {
				"scroll-on-hover": "scroll-on-hover 5s linear infinite",
				"caret-blink": "caret-blink 1.25s ease-out infinite",
			},
			keyframes: {
				"scroll-on-hover": {
					"0%": {
						transform: "translateX(0%)",
					},
					"100%": {
						transform: "translateX(-100%)",
					},
				},
				"caret-blink": {
					"0%,70%,100%": { opacity: "1" },
					"20%,50%": { opacity: "0" },
				},
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
			},
		},
	},
	fontFamily: {
		DM_Sans: "DM Sans",
	},

	plugins: [require("tailwindcss-animate")],
};

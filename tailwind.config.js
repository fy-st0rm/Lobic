/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				primary: '#0B0E15',
				secondary: '#1E212A',
				primary_fg: '#E7E7E7',
				secondary_fg:'#E0E1DD',
				hoverEffect: '#D9D9D9'
			},
			fontFamily: {
				DM_Sans: 'DM Sans'
			}
		},
	},
	plugins: [require("tailwindcss-animate")],
};

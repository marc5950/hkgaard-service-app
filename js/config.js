/* ============================================================================
   KONFIGURATION · HESTKØBGAARD
   ----------------------------------------------------------------------------
   Alle konstanter og standard-værdier. Ingen funktioner, ingen state.
   ============================================================================ */

export const firebaseConfig = {
	apiKey: "AIzaSyDbJPv3shtCSQ4ncWeVv8mt005_v6kSpfY",
	authDomain: "hkgaard-service-app.firebaseapp.com",
	databaseURL: "https://hkgaard-service-app-default-rtdb.europe-west1.firebasedatabase.app",
	projectId: "hkgaard-service-app",
	storageBucket: "hkgaard-service-app.firebasestorage.app",
	messagingSenderId: "835254363556",
	appId: "1:835254363556:web:63da290addf0481c334d31",
};

export const TIME_SLOTS = ["11:45", "12:30", "13:30", "14:15", "17:30", "19:45"];

export const statuses = {
	empty: { label: "Ikke ankommet", card: "border-slate-300 bg-slate-200", badge: "bg-slate-200 text-slate-700", dot: "bg-slate-400" },
	arrived: { label: "Ankommet", card: "border-rose-200 bg-rose-50", badge: "bg-rose-100 text-rose-800", dot: "bg-rose-500" },
	drinks_served: {
		label: "Drikkevarer serveret - kør forret",
		card: "border-rose-200 bg-rose-50",
		badge: "bg-rose-100 text-rose-800",
		dot: "bg-rose-500",
	},
	starter_served: {
		label: "Forret serveret",
		card: "border-amber-200 bg-amber-50",
		badge: "bg-amber-100 text-amber-800",
		dot: "bg-amber-500",
	},
	main_ordered: { label: "Hovedret bestilt", card: "border-sky-200 bg-sky-50", badge: "bg-sky-100 text-sky-800", dot: "bg-sky-500" },
	main_ready: { label: "Hovedret klar", card: "border-sky-200 bg-sky-50", badge: "bg-sky-100 text-sky-800", dot: "bg-sky-500" },
	main_served: {
		label: "Hovedret serveret",
		card: "border-sky-200 bg-sky-50",
		badge: "bg-sky-100 text-sky-800",
		dot: "bg-sky-500",
	},
	dessert_ordered: {
		label: "Dessert bestilt",
		card: "border-emerald-200 bg-emerald-50",
		badge: "bg-emerald-100 text-emerald-800",
		dot: "bg-emerald-500",
	},
	dessert_ready: {
		label: "Dessert klar",
		card: "border-emerald-200 bg-emerald-50",
		badge: "bg-emerald-100 text-emerald-800",
		dot: "bg-emerald-500",
	},
	dessert_served: {
		label: "Dessert serveret",
		card: "border-emerald-200 bg-emerald-50",
		badge: "bg-emerald-100 text-emerald-800",
		dot: "bg-emerald-500",
	},
};

export const nextStatusByStatus = {
	empty: "arrived",
	arrived: "drinks_served",
	drinks_served: "starter_served",
	starter_served: "main_ordered",
	main_ordered: null,
	main_ready: "main_served",
	main_served: "dessert_ordered",
	dessert_ordered: null,
	dessert_ready: "dessert_served",
	dessert_served: "empty",
};

export const waitingTextByStatus = {
	empty: "Marker bordet ankommet via reservationslisten (📅), eller klik 'Drikkevarer serveret', når gæsterne er ankommet.",
	arrived: "Server velkomstdrinken og klik 'Drikkevarer serveret'.",
	drinks_served: "Forretten er sendt til runner. Klik 'Forret serveret', når den er sat på bordet.",
	starter_served: "Bestil hovedretten, når bordet er klar til det.",
	main_ordered: "Hovedretten er sendt til køkkenet. Vent på at køkkenet trykker den ud.",
	main_ready: "Hovedretten er klar i køkkenet – runneren kører den ud. Klik på den blinkende prik på bordkortet, når den er serveret.",
	main_served: "Bestil desserten, når bordet er klar til det.",
	dessert_ordered: "Desserten er sendt til køkkenet. Vent på at køkkenet trykker den ud.",
	dessert_ready: "Desserten er klar i køkkenet – runneren kører den ud. Klik på den blinkende prik på bordet, når den er serveret.",
	dessert_served: "Bordet har fået alle retter. Gør bordet ledigt, når gæsterne er gået.",
};

export const courseByStatus = {
	main_ordered: { course: "Hovedret", readyStatus: "main_ready" },
	dessert_ordered: { course: "Dessert", readyStatus: "dessert_ready" },
};

export const servedStatusByCourse = {
	starter: "starter_served",
	main: "main_served",
	dessert: "dessert_served",
};
export const courseKeyByServedStatus = {
	starter_served: "starter",
	main_served: "main",
	dessert_served: "dessert",
};

export const DEFAULT_DRINK_CATEGORIES = [
	{ id: "soda", name: "Sodavand" },
	{ id: "lemonade", name: "Lemonade" },
	{ id: "juice", name: "Juice" },
	{ id: "noda", name: "Noda" },
	{ id: "beer", name: "Øl" },
	{ id: "water", name: "Vand/Danskvand" },
	{ id: "wine", name: "Vin" },
];
export const SELF_ITEM_ID = "_self";

// Alle borde fra restaurantens bordkort.
export const PREDEFINED_TABLES = [
	{ id: "96", maxPax: 1 },
	{ id: "97", maxPax: 1 },
	{ id: "98", maxPax: 1 },
	{ id: "99", maxPax: 1 },
	{ id: "101", maxPax: 2 },
	{ id: "102", maxPax: 2 },
	{ id: "103", maxPax: 2 },
	{ id: "104", maxPax: 2 },
	{ id: "105", maxPax: 2 },
	{ id: "106", maxPax: 2 },
	{ id: "107", maxPax: 2 },
	{ id: "108", maxPax: 2 },
	{ id: "109", maxPax: 2 },
	{ id: "110", maxPax: 2 },
	{ id: "111", maxPax: 2 },
	{ id: "112", maxPax: 2 },
	{ id: "113", maxPax: 2 },
	{ id: "114", maxPax: 2 },
	{ id: "115", maxPax: 2 },
	{ id: "116", maxPax: 4 },
	{ id: "117", maxPax: 4 },
	{ id: "118", maxPax: 4 },
	{ id: "119", maxPax: 4 },
	{ id: "120", maxPax: 4 },
	{ id: "121", maxPax: 4 },
	{ id: "122", maxPax: 4 },
	{ id: "123", maxPax: 4 },
	{ id: "124", maxPax: 4 },
	{ id: "125", maxPax: 4 },
	{ id: "126", maxPax: 8 },
	{ id: "127", maxPax: 8 },
	{ id: "128", maxPax: 8 },
	{ id: "129", maxPax: 9 },
	{ id: "130", maxPax: 9 },
	{ id: "131", maxPax: 10 },
	{ id: "132", maxPax: 10 },
	{ id: "133", maxPax: 12 },
	{ id: "134", maxPax: 12 },
	{ id: "201", maxPax: 4 },
	{ id: "202", maxPax: 4 },
	{ id: "203", maxPax: 4 },
	{ id: "204", maxPax: 4 },
	{ id: "205", maxPax: 4 },
	{ id: "206", maxPax: 6 },
	{ id: "207", maxPax: 6 },
	{ id: "208", maxPax: 8 },
	{ id: "209", maxPax: 8 },
	{ id: "210", maxPax: 10 },
	{ id: "211", maxPax: 10 },
];

export const DEFAULT_COMBINED_TABLES = [{ id: "101102", label: "101+102", tables: ["101", "102"], maxPax: 4 }];

export const roomColors = {
	rose: { label: "Rød", accent: "text-rose-700", line: "bg-rose-600", nav: "bg-rose-100 text-rose-800" },
	sky: { label: "Blå", accent: "text-sky-700", line: "bg-sky-600", nav: "bg-sky-100 text-sky-800" },
	amber: { label: "Gul", accent: "text-amber-700", line: "bg-amber-500", nav: "bg-amber-100 text-amber-800" },
	emerald: { label: "Grøn", accent: "text-emerald-700", line: "bg-emerald-600", nav: "bg-emerald-100 text-emerald-800" },
	violet: { label: "Lilla", accent: "text-violet-700", line: "bg-violet-600", nav: "bg-violet-100 text-violet-800" },
	slate: { label: "Grå", accent: "text-slate-700", line: "bg-slate-500", nav: "bg-slate-200 text-slate-700" },
	brown: { label: "Brun", accent: "text-amber-900", line: "bg-amber-800", nav: "bg-amber-100 text-amber-900" },
};

export const emptyTable = {
	status: "empty",
	guests: 0,
	name: "",
	phone: "",
	note: "",
	extras: { pescetarianQuantity: 0, wineQuantity: 0, pescetarianWineQuantity: 0, welcomeDrinkQuantity: 0 },
	seatedAt: null,
	readySince: null,
	completedAt: null,
};

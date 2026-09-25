/* ============================================================================
						   BORDSTYRING · HESTKØBGAARD
						   ============================================================================ */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, onValue, push, ref, update } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
	apiKey: "AIzaSyDbJPv3shtCSQ4ncWeVv8mt005_v6kSpfY",
	authDomain: "hkgaard-service-app.firebaseapp.com",
	databaseURL: "https://hkgaard-service-app-default-rtdb.europe-west1.firebasedatabase.app",
	projectId: "hkgaard-service-app",
	storageBucket: "hkgaard-service-app.firebasestorage.app",
	messagingSenderId: "835254363556",
	appId: "1:835254363556:web:63da290addf0481c334d31",
};

/* ----------------------------------------------------------------------------
						   KONSTANTER
						---------------------------------------------------------------------------- */

const TIME_SLOTS = ["11:45", "12:30", "13:30", "14:15", "17:30", "19:45"];
function slotKey(label) {
	return String(label || "")
		.replace(":", "")
		.trim();
}

const statuses = {
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

const nextStatusByStatus = {
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

const waitingTextByStatus = {
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

const courseByStatus = {
	main_ordered: { course: "Hovedret", readyStatus: "main_ready" },
	dessert_ordered: { course: "Dessert", readyStatus: "dessert_ready" },
};

const servedStatusByCourse = {
	starter: "starter_served",
	main: "main_served",
	dessert: "dessert_served",
};
const courseKeyByServedStatus = {
	starter_served: "starter",
	main_served: "main",
	dessert_served: "dessert",
};

const DEFAULT_DRINK_CATEGORIES = [
	{ id: "soda", name: "Sodavand" },
	{ id: "lemonade", name: "Lemonade" },
	{ id: "juice", name: "Juice" },
	{ id: "noda", name: "Noda" },
	{ id: "beer", name: "Øl" },
	{ id: "water", name: "Vand/Danskvand" },
	{ id: "wine", name: "Vin" },
];
const SELF_ITEM_ID = "_self";

// Alle borde fra restaurantens bordkort.
const PREDEFINED_TABLES = [
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

const DEFAULT_COMBINED_TABLES = [{ id: "101102", label: "101+102", tables: ["101", "102"], maxPax: 4 }];

const roomColors = {
	rose: { label: "Rød", accent: "text-rose-700", line: "bg-rose-600", nav: "bg-rose-100 text-rose-800" },
	sky: { label: "Blå", accent: "text-sky-700", line: "bg-sky-600", nav: "bg-sky-100 text-sky-800" },
	amber: { label: "Gul", accent: "text-amber-700", line: "bg-amber-500", nav: "bg-amber-100 text-amber-800" },
	emerald: { label: "Grøn", accent: "text-emerald-700", line: "bg-emerald-600", nav: "bg-emerald-100 text-emerald-800" },
	violet: { label: "Lilla", accent: "text-violet-700", line: "bg-violet-600", nav: "bg-violet-100 text-violet-800" },
	slate: { label: "Grå", accent: "text-slate-700", line: "bg-slate-500", nav: "bg-slate-200 text-slate-700" },
	brown: { label: "Brun", accent: "text-amber-900", line: "bg-amber-800", nav: "bg-amber-100 text-amber-900" },
};

const emptyTable = {
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

/* ----------------------------------------------------------------------------
						   APPENS TILSTAND
						---------------------------------------------------------------------------- */
let tables = Object.fromEntries(TIME_SLOTS.map((slot) => [slotKey(slot), {}]));
let kitchenOrders = {};
let barOrders = {};
let runnerOrders = {};
let barPickerSnapshot = null;
let activeTableId = null;
let activeView = "tables";
let selectedSlotKey = slotKey(TIME_SLOTS[0]);
let hasAutoSelectedSlot = false;

let settingsRooms = [
	{ id: "cafe", name: "Cafe", accent: "text-rose-700", line: "bg-rose-600", nav: "bg-rose-100 text-rose-800" },
	{ id: "festsal", name: "Festsal", accent: "text-sky-700", line: "bg-sky-600", nav: "bg-sky-100 text-sky-800" },
	{ id: "gul-stue", name: "Gul stue", accent: "text-amber-700", line: "bg-amber-500", nav: "bg-amber-100 text-amber-800" },
	{ id: "terrase", name: "Terrase", accent: "text-emerald-700", line: "bg-emerald-600", nav: "bg-emerald-100 text-emerald-800" },
];
let tableRoomAssignments = {};
let tableDisplayNumbers = {};
let tableMaxPax = Object.fromEntries(PREDEFINED_TABLES.map((t) => [t.id, t.maxPax]));
let combinedTables = [...DEFAULT_COMBINED_TABLES];
let drinkCategories = DEFAULT_DRINK_CATEGORIES.map((category) => ({ ...category }));
let drinkCatalog = {};
let expandedDrinkCategory = null;

let currentRoomGroups = [];
const collapsedRooms = new Set();

let reservationsSlotFilter = null;

/* ----------------------------------------------------------------------------
						   DOM-REFERENCER
						---------------------------------------------------------------------------- */

const connectionDot = document.querySelector("#connectionDot");
const connectionLabel = document.querySelector("#connectionLabel");
const tableCount = document.querySelector("#tableCount");
const timeSlotTabs = document.querySelector("#timeSlotTabs");
const statusLegend = document.querySelector("#statusLegend");
const welcomeDrinkTotal = document.querySelector("#welcomeDrinkTotal");
const tablesGrid = document.querySelector("#tablesGrid");
const roomHotbar = document.querySelector("#roomHotbar");
const hotbarButtons = document.querySelector("#roomHotbarButtons");

const kitchenView = document.querySelector("#kitchenView");
const kitchenToggle = document.querySelector("#kitchenToggle");
const kitchenOrdersElement = document.querySelector("#kitchenOrders");
const kitchenCount = document.querySelector("#kitchenCount");
const kitchenSummary = document.querySelector("#kitchenSummary");
const emptyKitchen = document.querySelector("#emptyKitchen");
const starterMissing = document.querySelector("#starterMissing");
const mainMissingClassic = document.querySelector("#mainMissingClassic");
const mainMissingPescetarian = document.querySelector("#mainMissingPescetarian");
const dessertMissing = document.querySelector("#dessertMissing");
const dayTotalPax = document.querySelector("#dayTotalPax");

const barView = document.querySelector("#barView");
const barToggle = document.querySelector("#barToggle");
const barOrdersElement = document.querySelector("#barOrders");
const barCount = document.querySelector("#barCount");
const emptyBar = document.querySelector("#emptyBar");
const barSummary = document.querySelector("#barSummary");
const barInfo = document.querySelector("#barInfo");

const runnerView = document.querySelector("#runnerView");
const runnerToggle = document.querySelector("#runnerToggle");
const runnerOrdersElement = document.querySelector("#runnerOrders");
const runnerCount = document.querySelector("#runnerCount");
const emptyRunner = document.querySelector("#emptyRunner");

const modal = document.querySelector("#tableModal");
const modalTitle = document.querySelector("#modalTitle");
const modalStatus = document.querySelector("#modalStatus");
const statusHint = document.querySelector("#statusHint");
const bookingInfo = document.querySelector("#bookingInfo");
const bookingEditForm = document.querySelector("#bookingEditForm");
const bookingEditActions = document.querySelector("#bookingEditActions");
const bookingEditMessage = document.querySelector("#bookingEditMessage");
const editBookingToggle = document.querySelector("#editBookingToggle");
const drinksSummary = document.querySelector("#drinksSummary");
const drinksPickerModal = document.querySelector("#drinksPickerModal");
const drinksPickerBody = document.querySelector("#drinksPickerBody");
const drinkCatalogModal = document.querySelector("#drinkCatalogModal");
const drinkCatalogSections = document.querySelector("#drinkCatalogSections");
const reservationsToggle = document.querySelector("#reservationsToggle");
const reservationsModal = document.querySelector("#reservationsModal");
const reservationsSearch = document.querySelector("#reservationsSearch");
const reservationsMessage = document.querySelector("#reservationsMessage");
const reservationsList = document.querySelector("#reservationsList");
const reservationsSlotFilterBar = document.querySelector("#reservationsSlotFilter");
const tableNote = document.querySelector("#tableNote");
const saveNoteButton = document.querySelector("#saveNote");
const saveMessage = document.querySelector("#saveMessage");
const deleteWalkInBtn = document.querySelector("#deleteWalkInBtn");

const settingsModal = document.querySelector("#settingsModal");
const settingsRows = document.querySelector("#roomSettingsRows");
const tableRoomRows = document.querySelector("#tableRoomRows");
const tablePaxSummary = document.querySelector("#tablePaxSummary");
const settingsMessage = document.querySelector("#settingsMessage");

const importModal = document.querySelector("#importModal");
const importJson = document.querySelector("#importJson");
const importMessage = document.querySelector("#importMessage");

const guideModal = document.querySelector("#guideModal");
const guideTabs = document.querySelector("#guideTabs");
const guideBody = document.querySelector("#guideBody");

const walkInModal = document.querySelector("#walkInModal");
const walkInSlot = document.querySelector("#walkInSlot");
const walkInTable = document.querySelector("#walkInTable");
const walkInPax = document.querySelector("#walkInPax");
const walkInPescetar = document.querySelector("#walkInPescetar");
const walkInWelcomeDrink = document.querySelector("#walkInWelcomeDrink");
const walkInWine = document.querySelector("#walkInWine");
const walkInPescWine = document.querySelector("#walkInPescWine");
const walkInName = document.querySelector("#walkInName");
const walkInNote = document.querySelector("#walkInNote");
const walkInMessage = document.querySelector("#walkInMessage");

/* ----------------------------------------------------------------------------
						   HJÆLPEFUNKTIONER
						---------------------------------------------------------------------------- */

function escapeHtml(value) {
	return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character]);
}

function toQuantity(value) {
	return Math.max(0, Number(value) || 0);
}

function getDrinks(table) {
	return (table.extras && table.extras.drinks) || {};
}
function getDrinksTotal(table) {
	const drinks = getDrinks(table);
	return Object.values(drinks).reduce((sum, items) => sum + Object.values(items || {}).reduce((itemSum, count) => itemSum + toQuantity(count), 0), 0);
}
function getDrinkEntries(table) {
	const drinks = getDrinks(table);
	const entries = [];
	drinkCategories.forEach((category) => {
		Object.entries(drinks[category.id] || {}).forEach(([itemId, count]) => {
			const quantity = toQuantity(count);
			if (quantity <= 0) return;
			const name =
				itemId === SELF_ITEM_ID
					? category.name
					: (drinkCatalog[category.id] || []).find((candidate) => candidate.id === itemId)?.name || "Fjernet vare";
			entries.push({ categoryId: category.id, categoryLabel: category.name, itemId, name, quantity });
		});
	});
	return entries;
}
function getCategoryTotal(table, categoryId) {
	return Object.values(getDrinks(table)[categoryId] || {}).reduce((sum, count) => sum + toQuantity(count), 0);
}
function generateCatalogItemId() {
	return `d${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

function getActiveTable() {
	return (tables[selectedSlotKey] && tables[selectedSlotKey][activeTableId]) || emptyTable;
}

function getRoomName(tableId) {
	const roomId = tableRoomAssignments[String(tableId)];
	return settingsRooms.find((room) => room.id === roomId)?.name || "";
}

function getDisplayNumber(tableId) {
	const custom = tableDisplayNumbers[String(tableId)];
	return custom !== undefined && custom !== "" ? custom : tableId;
}

/* ----------------------------------------------------------------------------
						   RESERVATIONSLISTE
						---------------------------------------------------------------------------- */

function getAllReservations({ slotFilter = null } = {}) {
	const entries = [];
	TIME_SLOTS.forEach((slot) => {
		const key = slotKey(slot);
		if (slotFilter && key !== slotFilter) return;
		Object.entries(tables[key] || {}).forEach(([tableId, table]) => {
			if (!table || !table.name) return;
			entries.push({
				slot: key,
				slotLabel: slot,
				tableId,
				displayNumber: getDisplayNumber(tableId),
				roomName: getRoomName(tableId),
				name: table.name,
				guests: table.guests,
				status: table.status || "empty",
				completedAt: table.completedAt || null,
			});
		});
	});
	entries.sort((a, b) => a.name.localeCompare(b.name, "da"));
	return entries;
}

function openReservations() {
	reservationsSearch.value = "";
	reservationsMessage.textContent = "";
	reservationsSlotFilter = selectedSlotKey;
	renderReservationsSlotFilter();
	renderReservationsList();
	reservationsModal.classList.remove("hidden");
	reservationsModal.classList.add("flex");
}
function closeReservations() {
	reservationsModal.classList.add("hidden");
	reservationsModal.classList.remove("flex");
}

function renderReservationsSlotFilter() {
	const buttons = [{ key: "", label: "Alle hold" }, ...TIME_SLOTS.map((slot) => ({ key: slotKey(slot), label: slot }))];
	reservationsSlotFilterBar.innerHTML = buttons
		.map(({ key, label }) => {
			const isActive = (reservationsSlotFilter || "") === key;
			return `<button type="button" data-slot-filter="${key}" class="rounded-lg px-3 py-1.5 text-xs font-bold transition ${
				isActive ? "bg-slate-900 text-white" : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
			}">${label}</button>`;
		})
		.join("");
	reservationsSlotFilterBar.querySelectorAll("[data-slot-filter]").forEach((button) =>
		button.addEventListener("click", () => {
			reservationsSlotFilter = button.dataset.slotFilter || null;
			renderReservationsSlotFilter();
			renderReservationsList();
		}),
	);
}

function renderReservationsList() {
	const query = reservationsSearch.value.trim().toLowerCase();
	const isSearching = query.length > 0;
	const effectiveFilter = isSearching ? null : reservationsSlotFilter;

	const entries = getAllReservations({ slotFilter: effectiveFilter }).filter((entry) => !query || entry.name.toLowerCase().includes(query));
	const activeEntries = entries.filter((entry) => !entry.completedAt);
	const finishedEntries = entries.filter((entry) => entry.completedAt);

	if (!activeEntries.length && !finishedEntries.length) {
		reservationsList.innerHTML = `<p class="py-6 text-center text-sm text-slate-400">${
			query ? "Ingen reservationer matcher søgningen." : "Ingen reservationer importeret endnu for dette hold."
		}</p>`;
		return;
	}

	let html = "";
	if (activeEntries.length) {
		html += activeEntries.map((entry) => renderReservationRow(entry)).join("");
	} else {
		html += `<p class="py-3 text-center text-xs text-slate-400">Ingen aktive reservationer.</p>`;
	}

	if (finishedEntries.length) {
		html += `<div class="mt-3 border-t border-slate-200 pt-3">
						<p class="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">Afsluttede borde (${finishedEntries.length})</p>
						<div class="space-y-1.5">${finishedEntries.map((entry) => renderReservationRow(entry, true)).join("")}</div>
					</div>`;
	}

	reservationsList.innerHTML = html;
	reservationsList
		.querySelectorAll("[data-mark-arrived]")
		.forEach((button) => button.addEventListener("click", () => markReservationArrived(button.dataset.markArrived)));
	reservationsList
		.querySelectorAll("[data-open-table]")
		.forEach((button) => button.addEventListener("click", () => openReservationTable(button.dataset.openTable)));
	reservationsList
		.querySelectorAll("[data-reopen-reservation]")
		.forEach((button) => button.addEventListener("click", () => reopenReservation(button.dataset.reopenReservation)));
}

function renderReservationRow(entry, isFinished = false) {
	const status = statuses[entry.status] || statuses.empty;
	let action;
	if (isFinished) {
		action = `<button type="button" data-reopen-reservation="${entry.slot}:${entry.tableId}" class="shrink-0 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50">Genåbn</button>`;
	} else if (entry.status === "empty") {
		action = `<button type="button" data-mark-arrived="${entry.slot}:${entry.tableId}" class="shrink-0 rounded-lg bg-rose-600 px-2.5 py-1.5 text-xs font-bold text-white transition hover:bg-rose-700">Ankommet</button>`;
	} else {
		action = `<span class="shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${status.badge}">${status.label}</span>`;
	}
	return /*html*/ `<div class="flex items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2 ${
		isFinished ? "bg-slate-50 opacity-75" : ""
	}">
					<div class="min-w-0 flex-1">
						<p class="truncate text-sm font-bold text-slate-800">${escapeHtml(entry.name)}</p>
						<p class="truncate text-xs text-slate-500">${escapeHtml(entry.slotLabel)} · ${escapeHtml(entry.roomName || "Intet lokale")} · Bord ${escapeHtml(String(entry.displayNumber))} · ${toQuantity(entry.guests)} pax</p>
					</div>
					<div class="flex shrink-0 items-center gap-1.5">
						${action}
						<button type="button" data-open-table="${entry.slot}:${entry.tableId}" class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-300 text-sm transition hover:bg-slate-50" aria-label="Åbn bord ${escapeHtml(String(entry.displayNumber))}" title="Åbn bord">🧾</button>
					</div>
				</div>`;
}

async function reopenReservation(key) {
	const [slot, tableId] = key.split(":");
	const table = tables[slot] && tables[slot][tableId];
	if (!table) return;
	tables[slot] = { ...tables[slot], [tableId]: { ...table, completedAt: null } };
	if (window.database) await update(ref(window.database), { [`tables/${slot}/${tableId}/completedAt`]: null });
	if (slot === selectedSlotKey) renderTables();
	renderTimeSlotTabs();
	renderReservationsList();
}

async function markReservationArrived(key) {
	const [slot, tableId] = key.split(":");
	const table = (tables[slot] && tables[slot][tableId]) || emptyTable;
	if (toQuantity(table.guests) < 1) {
		reservationsMessage.textContent = "Bordet har 0 gæster registreret – ret antallet i bookingen først.";
		return;
	}
	reservationsMessage.textContent = "";
	await applyTableStatus(tableId, "arrived", { guests: table.guests, note: table.note, extras: table.extras }, slot);
	renderReservationsList();
}

function openReservationTable(key) {
	const [slot, tableId] = key.split(":");
	closeReservations();
	if (activeView !== "tables") setView("tables");
	if (slot !== selectedSlotKey) {
		selectedSlotKey = slot;
		renderTimeSlotTabs();
		renderTables();
	}
	openModal(tableId);
}

function compareByDisplayNumber(a, b) {
	const displayA = getDisplayNumber(a);
	const displayB = getDisplayNumber(b);
	const numericA = Number(displayA);
	const numericB = Number(displayB);
	if (!Number.isNaN(numericA) && !Number.isNaN(numericB)) return numericA - numericB;
	return String(displayA).localeCompare(String(displayB), "da");
}

function getCourseKey(course) {
	const normalizedCourse = String(course).toLowerCase();
	if (normalizedCourse.startsWith("forret") || normalizedCourse.startsWith("starter")) return "starter";
	if (normalizedCourse.startsWith("hovedret")) return "main";
	if (normalizedCourse.startsWith("drikkevare") || normalizedCourse.startsWith("drink")) return "drink";
	return "dessert";
}

function minutesSince(timestamp) {
	if (!timestamp) return 0;
	return Math.max(0, Math.floor((Date.now() - timestamp) / 60000));
}

function secondsSince(timestamp) {
	if (!timestamp) return 0;
	return Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
}

function formatDuration(minutes) {
	if (minutes < 60) return `${minutes} min`;
	return `${Math.floor(minutes / 60)}t ${minutes % 60}m`;
}

function formatDurationWithSeconds(seconds) {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;
	if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
	const hours = Math.floor(minutes / 60);
	const remainingMinutes = minutes % 60;
	return `${hours}t ${remainingMinutes}m ${remainingSeconds}s`;
}

function isPescetarianCourse(course) {
	return String(course).toLowerCase().includes("pescetar");
}

function getNextStatus(currentStatus) {
	return currentStatus in nextStatusByStatus ? nextStatusByStatus[currentStatus] : "arrived";
}

function getConfirmMessage(status, currentStatus) {
	if (status === "empty") return "Er du sikker på, at bordet skal gøres ledigt?";
	if (status === currentStatus) {
		const course = courseByStatus[status]?.course;
		return course ? `${course} er allerede sendt til køkkenet. Vil du sende den igen?` : "Bordet står allerede i denne status. Vil du fortsætte?";
	}
	return "Dette følger ikke den normale rækkefølge. Er du sikker på, at du vil fortsætte?";
}

function getAllKnownTableNumbers() {
	const numbers = new Set();
	TIME_SLOTS.forEach((slot) => Object.keys(tables[slotKey(slot)] || {}).forEach((number) => numbers.add(number)));
	PREDEFINED_TABLES.forEach((t) => numbers.add(t.id));
	return Array.from(numbers).sort((a, b) => Number(a) - Number(b));
}

function getCurrentSlotKey() {
	const now = new Date();
	const nowMinutes = now.getHours() * 60 + now.getMinutes();
	let current = slotKey(TIME_SLOTS[0]);
	TIME_SLOTS.forEach((slot) => {
		const [hours, minutes] = slot.split(":").map(Number);
		if (hours * 60 + minutes <= nowMinutes) current = slotKey(slot);
	});
	return current;
}

function slotHasPendingOrders(key) {
	return Object.values(kitchenOrders).some((order) => order.status === "pending" && order.slot === key);
}
function slotHasPendingRunnerOrders(key) {
	return Object.values(runnerOrders).some((order) => order.slot === key);
}
function slotHasPendingBarOrders(key) {
	return Object.values(barOrders).some((order) => order.slot === key);
}

/* ----------------------------------------------------------------------------
						   HOLD + LOKALER
						---------------------------------------------------------------------------- */

function renderTimeSlotTabs() {
	const currentKey = getCurrentSlotKey();
	timeSlotTabs.innerHTML = TIME_SLOTS.map((slot) => {
		const key = slotKey(slot);
		const count = Object.keys(tables[key] || {}).length;
		const isActive = key === selectedSlotKey;
		const isCurrent = key === currentKey;
		const needsAttention = !isActive && (slotHasPendingOrders(key) || slotHasPendingRunnerOrders(key) || slotHasPendingBarOrders(key));
		const colorClasses = isActive
			? "bg-slate-900 text-white hover:bg-slate-700 active:bg-slate-950"
			: "bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100";
		const ringClasses = isCurrent ? "ring-2 ring-offset-1 ring-emerald-500" : isActive ? "" : "ring-1 ring-slate-200";
		const nowBadge = isCurrent
			? `<span class="rounded-full ml-1 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
					isActive
						? "bg-emerald-400 text-emerald-950 group-hover:bg-emerald-300 group-active:bg-emerald-200"
						: "bg-emerald-100 text-emerald-700 group-hover:bg-emerald-100 group-active:bg-emerald-200"
				}">Nu</span>`
			: "";
		return `<button data-slot="${key}" class="group flex flex-col items-center gap-1 rounded-xl px-4 py-2.5 text-sm font-bold transition ${colorClasses} ${ringClasses} ${needsAttention ? "time-slot-tab-alert" : ""}"><span>${slot}${nowBadge}${count ? ` · ${count} borde` : ""}</span></button>`;
	}).join("");
	timeSlotTabs.querySelectorAll("[data-slot]").forEach((button) =>
		button.addEventListener("click", () => {
			if (button.dataset.slot === selectedSlotKey) return;
			selectedSlotKey = button.dataset.slot;
			collapsedRooms.clear();
			renderTimeSlotTabs();
			renderTables();
			if (activeView === "kitchen") renderKitchen();
			if (activeView === "bar") renderBar();
			if (activeView === "runner") renderRunner();
		}),
	);
}

function computeRoomGroups() {
	const slotTables = tables[selectedSlotKey] || {};
	const tableNumbers = Object.keys(slotTables);
	const groups = settingsRooms.map((room) => ({ ...room, tableIds: [] }));
	const unassigned = {
		id: "__unassigned",
		name: "Ikke tildelt",
		accent: "text-slate-500",
		line: "bg-slate-400",
		nav: "bg-slate-200 text-slate-700",
		tableIds: [],
	};

	tableNumbers.forEach((number) => {
		const roomId = tableRoomAssignments[number];
		const target = groups.find((room) => room.id === roomId);
		(target || unassigned).tableIds.push(number);
	});

	groups.forEach((room) => room.tableIds.sort(compareByDisplayNumber));
	unassigned.tableIds.sort(compareByDisplayNumber);

	const result = groups.filter((room) => room.tableIds.length > 0);
	if (unassigned.tableIds.length) result.unshift(unassigned);
	return result;
}

function renderRoomHotbar() {
	hotbarButtons.innerHTML = currentRoomGroups
		.map(
			(room) =>
				`<button data-room-target="${room.id}" class="room-nav-button rounded-xl px-4 py-2.5 text-sm font-bold transition ${room.nav || "bg-white text-slate-700 ring-1 ring-slate-200"}">${escapeHtml(room.name)}</button>`,
		)
		.join("");
	hotbarButtons.querySelectorAll("[data-room-target]").forEach((button) =>
		button.addEventListener("click", () => {
			const selectedRoom = button.dataset.roomTarget;
			updateRoomHotbar(selectedRoom);
			if (window.matchMedia("(max-width: 639px)").matches) {
				currentRoomGroups.forEach((room) => (room.id === selectedRoom ? collapsedRooms.delete(room.id) : collapsedRooms.add(room.id)));
				renderTables();
			}
			document.querySelector(`#room-${selectedRoom}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
		}),
	);
}

function updateRoomHotbar(activeRoomId) {
	document.querySelectorAll("[data-room-target]").forEach((button) => {
		const isActive = button.dataset.roomTarget === activeRoomId;
		const room = currentRoomGroups.find((candidate) => candidate.id === button.dataset.roomTarget);
		button.className = `room-nav-button rounded-xl px-4 py-2.5 text-sm font-bold transition ${isActive ? "bg-slate-900 text-white hover:bg-slate-700" : `${room?.nav || "bg-white text-slate-700 ring-1 ring-slate-200"} hover:brightness-95`}`;
	});
}

/* ----------------------------------------------------------------------------
						   OPSÆTNINGS-MODAL
						---------------------------------------------------------------------------- */

function renderSettingsRows() {
	settingsRows.innerHTML = settingsRooms
		.map(
			(room, index) =>
				`<div class="flex items-center gap-1.5">
                    <div class="flex shrink-0 flex-col gap-0.5">
                        <button type="button" data-move-room="${index}:up" ${index === 0 ? "disabled" : ""} class="flex h-4 w-5 items-center justify-center rounded bg-slate-100 text-[9px] leading-none text-slate-600 hover:bg-slate-200 disabled:opacity-25 disabled:pointer-events-none" aria-label="Flyt ${escapeHtml(room.name)} op">▲</button>
                        <button type="button" data-move-room="${index}:down" ${index === settingsRooms.length - 1 ? "disabled" : ""} class="flex h-4 w-5 items-center justify-center rounded bg-slate-100 text-[9px] leading-none text-slate-600 hover:bg-slate-200 disabled:opacity-25 disabled:pointer-events-none" aria-label="Flyt ${escapeHtml(room.name)} ned">▼</button>
                    </div>
                    <input data-room-name="${index}" value="${escapeHtml(room.name)}" class="min-w-0 flex-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm font-semibold outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100" aria-label="Lokalnavn" />
                    <select data-room-color="${index}" class="w-[88px] shrink-0 rounded-lg border border-slate-300 bg-white px-1.5 py-1.5 text-xs outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100" aria-label="Lokale farve">${Object.entries(
											roomColors,
										)
											.map(([key, color]) => `<option value="${key}" ${room.nav === color.nav ? "selected" : ""}>${color.label}</option>`)
											.join("")}</select>
                    <button data-remove-room="${index}" class="shrink-0 rounded-lg p-1.5 text-base font-bold text-slate-400 hover:bg-rose-50 hover:text-rose-700" aria-label="Fjern lokale">&times;</button>
                </div>`,
		)
		.join("");

	settingsRows.querySelectorAll("[data-remove-room]").forEach((button) =>
		button.addEventListener("click", () => {
			if (settingsRooms.length > 1) {
				syncRoomEditsFromInputs();
				settingsRooms.splice(Number(button.dataset.removeRoom), 1);
				renderSettingsRows();
				renderTableRoomRows();
			}
		}),
	);
	settingsRows.querySelectorAll("[data-move-room]").forEach((button) =>
		button.addEventListener("click", () => {
			const [index, direction] = button.dataset.moveRoom.split(":");
			moveRoom(Number(index), direction);
		}),
	);
}

function syncRoomEditsFromInputs() {
	settingsRows.querySelectorAll("[data-room-name]").forEach((input) => {
		const index = Number(input.dataset.roomName);
		if (settingsRooms[index]) settingsRooms[index] = { ...settingsRooms[index], name: input.value };
	});
	settingsRows.querySelectorAll("[data-room-color]").forEach((select) => {
		const index = Number(select.dataset.roomColor);
		const color = roomColors[select.value];
		if (settingsRooms[index] && color) settingsRooms[index] = { ...settingsRooms[index], ...color };
	});
}

function moveRoom(index, direction) {
	const targetIndex = index + (direction === "up" ? -1 : 1);
	if (targetIndex < 0 || targetIndex >= settingsRooms.length) return;
	syncRoomEditsFromInputs();
	const reordered = [...settingsRooms];
	[reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
	settingsRooms = reordered;
	renderSettingsRows();
	renderTableRoomRows();
}

function getTablePaxHint(number) {
	let pax = tableMaxPax[number] || null;
	TIME_SLOTS.forEach((slot) => {
		const table = (tables[slotKey(slot)] || {})[number];
		if (table) pax = Math.max(pax || 0, toQuantity(table.guests));
	});
	return pax;
}

function renderTableRoomRows() {
	const numbers = getAllKnownTableNumbers();
	if (!numbers.length) {
		tablePaxSummary.innerHTML = "";
		tableRoomRows.innerHTML = `<p class="text-sm text-slate-400">Ingen borde importeret endnu.</p>`;
		return;
	}

	const paxCounts = {};
	numbers.forEach((number) => {
		const pax = getTablePaxHint(number);
		if (pax) paxCounts[pax] = (paxCounts[pax] || 0) + 1;
	});
	tablePaxSummary.innerHTML = Object.keys(paxCounts)
		.map(Number)
		.sort((a, b) => a - b)
		.map((pax) => `<span class="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-bold text-slate-700">${pax} pax: ${paxCounts[pax]}</span>`)
		.join("");

	tableRoomRows.innerHTML = numbers
		.map((number) => {
			const pax = getTablePaxHint(number);
			return `<div class="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5"><span class="min-w-0 flex-1 truncate text-sm font-bold text-slate-700">Bord ${escapeHtml(number)}${pax ? ` <span class="font-normal text-slate-400">· ${pax}p</span>` : ""}</span><input data-table-number="${escapeHtml(number)}" type="text" inputmode="numeric" value="${escapeHtml(tableDisplayNumbers[number] || "")}" placeholder="${escapeHtml(number)}" title="Bordskilt-nummer for bord ${escapeHtml(number)}" aria-label="Bordskilt-nummer for bord ${escapeHtml(number)}" class="w-12 shrink-0 rounded-lg border border-slate-300 bg-white px-1 py-1 text-center text-xs outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100" /><select data-table-room="${escapeHtml(number)}" class="shrink-0 rounded-lg border border-slate-300 bg-white px-1.5 py-1 text-xs outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100" aria-label="Lokale for bord ${escapeHtml(number)}"><option value="">Ikke tildelt</option>${settingsRooms.map((room) => `<option value="${room.id}" ${tableRoomAssignments[number] === room.id ? "selected" : ""}>${escapeHtml(room.name)}</option>`).join("")}</select></div>`;
		})
		.join("");
}

function openSettings() {
	renderSettingsRows();
	renderTableRoomRows();
	settingsMessage.textContent = "";
	settingsModal.classList.remove("hidden");
	settingsModal.classList.add("flex");
}

function closeSettings() {
	settingsModal.classList.add("hidden");
	settingsModal.classList.remove("flex");
}

async function saveSettings() {
	const nextRooms = settingsRooms.map((room, index) => ({
		...room,
		name: settingsRows.querySelector(`[data-room-name="${index}"]`).value.trim() || `Lokale ${index + 1}`,
		...roomColors[settingsRows.querySelector(`[data-room-color="${index}"]`).value],
	}));

	if (!nextRooms.length) {
		settingsMessage.textContent = "Der skal være mindst ét lokale.";
		return;
	}

	const nextAssignments = {};
	const nextDisplayNumbers = {};
	tableRoomRows.querySelectorAll("[data-table-room]").forEach((select) => {
		if (select.value) nextAssignments[select.dataset.tableRoom] = select.value;
	});
	tableRoomRows.querySelectorAll("[data-table-number]").forEach((input) => {
		const value = input.value.trim();
		if (value) nextDisplayNumbers[input.dataset.tableNumber] = value;
	});

	settingsRooms = nextRooms;
	tableRoomAssignments = nextAssignments;
	tableDisplayNumbers = nextDisplayNumbers;
	renderTables();

	try {
		if (window.database) {
			await update(ref(window.database), {
				"settings/rooms": settingsRooms.map(({ id, name, accent, line, nav }) => ({ id, name, accent, line, nav })),
				"settings/tableRooms": tableRoomAssignments,
				"settings/tableNumbers": tableDisplayNumbers,
				"settings/tableMaxPax": tableMaxPax,
				"settings/combinedTables": combinedTables,
			});
		}
		settingsMessage.textContent = "Opsætning gemt";
		setTimeout(closeSettings, 400);
	} catch (error) {
		console.error(error);
		settingsMessage.textContent = "Kunne ikke gemme opsætningen.";
	}
}

async function resetTableRoomAssignments() {
	if (
		!confirm(
			"Nulstil fordelingen af borde på lokaler og bordskilt-numre? Alle borde bliver 'Ikke tildelt', og numrene stilles tilbage til booking-numrene.",
		)
	)
		return;
	tableRoomAssignments = {};
	tableDisplayNumbers = {};
	renderTableRoomRows();
	renderTables();
	try {
		if (window.database) await update(ref(window.database), { "settings/tableRooms": null, "settings/tableNumbers": null });
		settingsMessage.textContent = "Bordfordelingen og numrene er nulstillet";
	} catch (error) {
		console.error(error);
		settingsMessage.textContent = "Kunne ikke nulstille bordfordelingen.";
	}
}

async function resetAllTables() {
	if (!confirm("Nulstil status til 'Ikke ankommet' for ALLE borde på ALLE hold? Status, timere, ekstra drikkevarer, noter og alle køer ryddes."))
		return;
	const nextTables = {};
	TIME_SLOTS.forEach((slot) => {
		const key = slotKey(slot);
		const slotTables = tables[key] || {};
		nextTables[key] = Object.fromEntries(
			Object.entries(slotTables).map(([id, table]) => [
				id,
				{
					...table,
					status: "empty",
					seatedAt: null,
					readySince: null,
					completedAt: null,
					note: "",
					extras: { ...(table.extras || {}), drinks: {} },
				},
			]),
		);
	});
	try {
		tables = nextTables;
		kitchenOrders = {};
		barOrders = {};
		runnerOrders = {};
		if (window.database) await update(ref(window.database), { tables: nextTables, kitchenOrders: {}, barOrders: {}, runnerOrders: {} });
		renderTimeSlotTabs();
		renderTables();
		renderKitchen();
		renderBar();
		renderRunner();
		settingsMessage.textContent = "Status, drikkevarer og noter nulstillet for alle borde";
	} catch (error) {
		console.error(error);
		settingsMessage.textContent = "Kunne ikke nulstille bordene.";
	}
}

/* ----------------------------------------------------------------------------
						   IMPORT-MODAL
						---------------------------------------------------------------------------- */

function normalizeImportPayload(raw) {
	const bookingsBySlot = {};
	TIME_SLOTS.forEach((slot) => (bookingsBySlot[slotKey(slot)] = []));
	const pushBooking = (timeLabel, booking) => {
		const key = slotKey(timeLabel);
		if (!bookingsBySlot[key]) bookingsBySlot[key] = [];
		bookingsBySlot[key].push(booking);
	};
	if (Array.isArray(raw)) {
		raw.forEach((booking) => pushBooking(booking.time || booking.tid, booking));
	} else if (raw && typeof raw === "object") {
		Object.entries(raw).forEach(([time, bookings]) => {
			if (Array.isArray(bookings)) bookings.forEach((booking) => pushBooking(time, booking));
		});
	}
	return bookingsBySlot;
}

function bookingToTable(booking, existingTable) {
	const guests = toQuantity(booking.pax ?? booking.guests ?? booking.antal);
	const extras = {
		pescetarianQuantity: Math.min(guests, toQuantity(booking.pescetar ?? booking.pescetarian)),
		wineQuantity: toQuantity(booking.vinmenu ?? booking.wine),
		pescetarianWineQuantity: toQuantity(booking.drikmenu ?? booking.pescetarianWine),
		welcomeDrinkQuantity: toQuantity(booking.gt ?? booking.welcomeDrink),
		drinks: existingTable?.extras?.drinks || {},
	};
	return {
		name: booking.name || booking.navn || "",
		phone: String(booking.phone || booking.telefon || ""),
		guests,
		note: booking.note || booking.bemaerkning || booking.bemærkning || "",
		extras,
		status: existingTable?.status || "empty",
		seatedAt: existingTable?.seatedAt || null,
		readySince: existingTable?.readySince || null,
		completedAt: existingTable?.completedAt || null,
	};
}

function openImportModal() {
	importMessage.textContent = "";
	importModal.classList.remove("hidden");
	importModal.classList.add("flex");
}

function closeImportModal() {
	importModal.classList.add("hidden");
	importModal.classList.remove("flex");
}

async function saveImport() {
	importMessage.textContent = "";

	const rawJson = importJson.value.trim();
	if (!rawJson) {
		importMessage.textContent = "Indsæt venligst JSON-data.";
		return;
	}

	let parsedJson;
	try {
		parsedJson = JSON.parse(rawJson);
	} catch (error) {
		importMessage.textContent = "Ugyldig JSON – tjek formatet.";
		return;
	}

	try {
		const normalized = normalizeImportPayload(parsedJson);

		const conflicts = [];
		Object.entries(normalized).forEach(([hold, reservations]) => {
			if (!reservations || !reservations.length) return;
			reservations.forEach((reservation) => {
				const tableKey = String(reservation.table || reservation.bord || reservation.tableNumber || "").trim();
				const cleanTableKey = tableKey.replace(/[^0-9]/g, "");
				if (!cleanTableKey) return;
				const existing = (tables[hold] && tables[hold][cleanTableKey]) || null;
				if (existing && existing.isWalkIn) {
					conflicts.push({ hold, cleanTableKey });
				}
			});
		});

		let overwriteWalkIns = true;
		if (conflicts.length > 0) {
			const conflictList = conflicts.map((c) => `Bord ${c.cleanTableKey}`).join(", ");
			const prompt = `${conflicts.length} walk-in bord(er) er i konflikt med importen:\n\n${conflictList}\n\nOK = Overskriv walk-ins med de importerede reservationer\nAnnuller = Spring walk-ins over (behold dem som de er)`;
			overwriteWalkIns = window.confirm(prompt);
		}

		const updates = {};
		const nextTables = { ...tables };
		const touchedSlots = new Set();
		let totalBookings = 0;
		let skippedWalkIns = 0;

		Object.entries(normalized).forEach(([hold, reservations]) => {
			if (!reservations || !reservations.length) return;

			touchedSlots.add(hold);
			const slotTables = { ...(nextTables[hold] || {}) };

			reservations.forEach((reservation) => {
				let tableKey = String(reservation.table || reservation.bord || reservation.tableNumber || "").trim();
				let cleanTableKey = tableKey.replace(/[^0-9]/g, "");

				if (!cleanTableKey) return;

				const existingTable = slotTables[cleanTableKey] || (tables[hold] && tables[hold][cleanTableKey]) || null;

				if (existingTable && existingTable.isWalkIn && !overwriteWalkIns) {
					skippedWalkIns++;
					return;
				}

				const tableData = bookingToTable(
					{
						...reservation,
						table: tableKey,
					},
					existingTable,
				);

				slotTables[cleanTableKey] = tableData;
				updates[`tables/${hold}/${cleanTableKey}`] = tableData;
				totalBookings++;
			});

			nextTables[hold] = slotTables;
		});

		if (totalBookings === 0 && skippedWalkIns === 0) {
			importMessage.textContent = "Fandt ingen gyldige reservationer i JSON-teksten.";
			return;
		}

		tables = nextTables;

		if (!Object.keys(tables[selectedSlotKey] || {}).length) {
			const firstTouched = Array.from(touchedSlots).find((key) => Object.keys(tables[key] || {}).length > 0);
			if (firstTouched) selectedSlotKey = firstTouched;
		}

		if (window.database) {
			await update(ref(window.database), updates);
		}

		renderTimeSlotTabs();
		renderTables();
		renderKitchen();
		renderBar();
		renderRunner();

		const slotLabel = touchedSlots.size === 1 ? "1 tidspunkt" : `${touchedSlots.size} tidspunkter`;
		let message = `${totalBookings} reservationer importeret (${slotLabel})`;
		if (skippedWalkIns > 0) message += ` · ${skippedWalkIns} walk-in sprunget over`;
		importMessage.textContent = message;
		importJson.value = "";

		if (skippedWalkIns === 0) {
			setTimeout(closeImportModal, 600);
		}
	} catch (error) {
		console.error("Fejl ved import/gemning:", error);
		importMessage.textContent = "Der opstod en fejl under gemning i Firebase.";
	}
}

async function clearAllReservations() {
	if (!confirm("Ryd ALLE reservationer for alle tidspunkter? Navn, pax, menuvalg og status forsvinder for samtlige borde og kan ikke fortrydes."))
		return;

	const nextTables = {};
	TIME_SLOTS.forEach((slot) => (nextTables[slotKey(slot)] = {}));

	try {
		tables = nextTables;
		kitchenOrders = {};
		barOrders = {};
		runnerOrders = {};
		if (window.database) await update(ref(window.database), { tables: nextTables, kitchenOrders: {}, barOrders: {}, runnerOrders: {} });
		renderTimeSlotTabs();
		renderTables();
		renderKitchen();
		renderBar();
		renderRunner();
		importMessage.textContent = "Alle reservationer er ryddet";
	} catch (error) {
		console.error(error);
		importMessage.textContent = "Kunne ikke rydde reservationerne.";
	}
}

/* ----------------------------------------------------------------------------
						   BORDOVERSIGT
						---------------------------------------------------------------------------- */

function renderTables() {
	const slotTables = tables[selectedSlotKey] || {};
	const totalPax = Object.values(slotTables).reduce((sum, table) => sum + toQuantity(table.guests), 0);
	tableCount.textContent = `${totalPax} pax denne tid`;
	welcomeDrinkTotal.textContent = Object.values(slotTables)
		.filter((table) => !table.completedAt)
		.reduce((sum, table) => sum + toQuantity(table.extras?.welcomeDrinkQuantity), 0);
	currentRoomGroups = computeRoomGroups();
	renderRoomHotbar();
	renderStatusLegend();
	tablesGrid.innerHTML = currentRoomGroups.map((room) => renderRoomSection(room, slotTables)).join("") + renderFinishedList(slotTables);

	tablesGrid.querySelectorAll("[data-table-id]").forEach((card) => card.addEventListener("click", () => openModal(card.dataset.tableId)));

	tablesGrid.querySelectorAll("[data-quick-serve]").forEach((dot) => {
		const trigger = (event) => {
			event.stopPropagation();
			markCourseServed(dot.dataset.quickServe);
		};
		dot.addEventListener("click", trigger);
		dot.addEventListener("keydown", (event) => {
			if (event.key === "Enter" || event.key === " ") {
				event.preventDefault();
				trigger(event);
			}
		});
	});
	tablesGrid.querySelectorAll("[data-room-toggle]").forEach((button) =>
		button.addEventListener("click", () => {
			const roomId = button.dataset.roomToggle;
			if (collapsedRooms.has(roomId)) collapsedRooms.delete(roomId);
			else collapsedRooms.add(roomId);
			renderTables();
		}),
	);
	tablesGrid.querySelectorAll("[data-reopen-table]").forEach((button) =>
		button.addEventListener("click", (event) => {
			event.stopPropagation();
			reopenTable(button.dataset.reopenTable);
		}),
	);
}

function renderStatusLegend() {
	const slotTables = Object.values(tables[selectedSlotKey] || {});
	const activeTables = slotTables.filter((table) => !table.completedAt);
	const finishedTables = slotTables.filter((table) => table.completedAt);
	const groups = {
		empty: ["empty"],
		arrived: ["arrived", "drinks_served"],
		starter: ["starter_served"],
		main: ["main_ordered", "main_ready", "main_served"],
		dessert: ["dessert_ordered", "dessert_ready", "dessert_served"],
	};
	const count = (statusList) => activeTables.filter((table) => statusList.includes(table.status || "empty")).length;
	document.querySelector("#legendTotal").textContent = slotTables.length;
	document.querySelector("#legendFinished").textContent = finishedTables.length;
	document.querySelector("#legendEmpty").textContent = count(groups.empty);
	document.querySelector("#legendArrived").textContent = count(groups.arrived);
	document.querySelector("#legendStarter").textContent = count(groups.starter);
	document.querySelector("#legendMain").textContent = count(groups.main);
	document.querySelector("#legendDessert").textContent = count(groups.dessert);
}

function renderRoomSection(room, slotTables) {
	const isCollapsed = collapsedRooms.has(room.id);
	const activeIds = room.tableIds.filter((id) => slotTables[id] && !slotTables[id].completedAt);
	if (!activeIds.length) return "";
	const cards = activeIds.map((id) => renderTableCard(id, slotTables[id])).join("");

	return `<section id="room-${room.id}" class="room-section" aria-labelledby="room-heading-${room.id}">
								<button data-room-toggle="${room.id}" aria-expanded="${!isCollapsed}" class="mb-4 flex w-full items-center gap-3 text-left">
									<span class="h-8 w-1.5 rounded-full ${room.line}"></span><span class="flex-1"><span id="room-heading-${room.id}" class="font-display text-3xl font-bold ${room.accent}">${escapeHtml(room.name)}</span><span class="ml-3 text-sm font-bold text-slate-400">${activeIds.length} borde</span></span><span class="text-xl text-slate-400">${isCollapsed ? "▸" : "▾"}</span>
								</button>
								<div class="room-table-grid ${isCollapsed ? "hidden" : "grid"} gap-2 sm:gap-3 lg:grid-cols-3 xl:grid-cols-4">${cards}</div>
							</section>`;
}

function renderTableCard(id, table) {
	const status = statuses[table.status] || statuses.empty;
	const extras = table.extras || {};
	const pescetarianQuantity = toQuantity(extras.pescetarianQuantity);
	const drinksTotalForCard = getDrinksTotal(table);

	const isReady = ["main_ready", "dessert_ready"].includes(table.status);
	const readyDotClass = isReady ? "table-card-ready-dot" : "";

	const seatedMinutes = table.seatedAt ? minutesSince(table.seatedAt) : null;
	const seatedTime = table.seatedAt
		? new Date(table.seatedAt).toLocaleTimeString("da-DK", {
				hour: "2-digit",
				minute: "2-digit",
			})
		: null;
	const seatedBadge =
		seatedMinutes !== null
			? `<span class="inline-flex items-center rounded-full bg-white px-1 py-0.5 text-[10px] font-bold text-black sm:text-[11px]" title="Tid siden bordet ankom">🕐${seatedTime} - ${formatDuration(seatedMinutes)}</span>`
			: "";

	const readySeconds = isReady && table.readySince ? secondsSince(table.readySince) : null;
	const readyColor =
		readySeconds === null
			? ""
			: readySeconds >= 180
				? "bg-rose-500 text-white"
				: readySeconds >= 60
					? "bg-yellow-500 text-amber-950"
					: "bg-emerald-100 text-emerald-800";
	const readyBadge =
		readySeconds !== null
			? `<span class="shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${readyColor} sm:text-xs" title="Tid siden maden blev meldt klar">${formatDurationWithSeconds(readySeconds)}</span>`
			: "";

	const extraIcons = [
		extras.welcomeDrinkQuantity > 0 &&
			`<span title="Velkomstdrink x${extras.welcomeDrinkQuantity}" aria-label="Velkomstdrink" class="rounded-full bg-white/80 px-1.5 py-0.5 shadow-sm ring-1 ring-black/10">🥂${extras.welcomeDrinkQuantity}</span>`,
		extras.wineQuantity > 0 &&
			`<span title="Vinmenu x${extras.wineQuantity}" aria-label="Vinmenu" class="rounded-full bg-white/80 px-1.5 py-0.5 shadow-sm ring-1 ring-black/10">🍷${extras.wineQuantity}</span>`,
		extras.pescetarianWineQuantity > 0 &&
			`<span title="Vinmenu til pescetar x${extras.pescetarianWineQuantity}" aria-label="Vinmenu til pescetar" class="rounded-full bg-white/80 px-1.5 py-0.5 shadow-sm ring-1 ring-black/10">🐟🍷${extras.pescetarianWineQuantity}</span>`,
	].filter(Boolean);

	const details = `<div class="mt-1 flex items-start justify-between gap-2"><div class="min-w-0 flex-1">${table.name ? `<p class="truncate text-[11px] font-bold text-slate-700 sm:text-xs">${escapeHtml(table.name)}</p>` : ""}${pescetarianQuantity ? `<p class="text-[11px] font-bold text-amber-800 sm:text-xs">${pescetarianQuantity} pescetar</p>` : ""}${drinksTotalForCard ? `<p class="text-[11px] font-bold text-violet-700 sm:text-xs" title="Ekstra drikkevarer, der mangler at blive slået ind i kassen">🧾 ${drinksTotalForCard} drikkevarer</p>` : ""}${table.note ? `<p class="mt-1 max-w-full truncate text-[11px] font-semibold text-slate-600 sm:text-xs" title="${escapeHtml(table.note)}">${escapeHtml(table.note)}</p>` : ""}</div><div class="flex shrink-0 items-center gap-1.5">${readyBadge}<span class="shrink-0 rounded-full px-2 py-1 text-[10px] font-bold leading-tight ${status.badge} sm:text-xs">${status.label}</span></div></div>`;

	const dot = readyDotClass
		? `<span class="-m-1.5 cursor-pointer rounded-full p-1.5 hover:bg-black/5" data-quick-serve="${id}" role="button" tabindex="0" aria-label="Marker ${status.label.toLowerCase()} som serveret"><span class="block h-2.5 w-2.5 rounded-full ${status.dot} ${readyDotClass}"></span></span>`
		: `<span class="h-2.5 w-2.5 shrink-0 rounded-full ${status.dot}" title="${status.label}"></span>`;

	return `<button class="table-card rounded-xl border-2 px-3 py-2 text-left shadow-sm ${status.card}" data-table-id="${id}">
								<div class="flex items-center justify-between"><span class="font-display flex flex-wrap items-center gap-1.5 text-base font-bold text-slate-900 sm:text-lg">Bord ${escapeHtml(getDisplayNumber(id))} <span class="font-sans text-xs font-bold text-slate-500 sm:text-sm">· ${toQuantity(table.guests)} pax</span>${table.isWalkIn ? `<span class="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-800 ring-1 ring-amber-300 sm:text-[10px]">Walk-in</span>` : ""}</span><div class="flex items-center gap-2"><span class="flex items-center gap-1 text-xs" aria-hidden="true">${extraIcons.join("")}</span>${dot}</div></div>
								${seatedBadge ? `<div>${seatedBadge}</div>` : ""}
								${details}
							</button>`;
}

function renderFinishedList(slotTables) {
	const finished = Object.entries(slotTables)
		.filter(([, table]) => table.completedAt)
		.sort(([, a], [, b]) => b.completedAt - a.completedAt);
	if (!finished.length) return "";

	const cards = finished.map(([id, table]) => renderFinishedCard(id, table)).join("");
	return `<section class="mt-10 border-t border-slate-200 pt-6">
								<h2 class="mb-3 font-display text-2xl font-bold text-slate-400">Afsluttede borde (${finished.length})</h2>
								<div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">${cards}</div>
							</section>`;
}

function renderFinishedCard(id, table) {
	const time = new Date(table.completedAt).toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" });
	return `<div class="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
								<div class="min-w-0"><p class="truncate text-sm font-bold text-slate-600">Bord ${escapeHtml(getDisplayNumber(id))}${table.name ? ` · ${escapeHtml(table.name)}` : ""}</p><p class="text-xs text-slate-400">${toQuantity(table.guests)} pax · afsluttet ${time}</p></div>
								<button data-reopen-table="${id}" class="shrink-0 rounded-lg border border-slate-300 px-2 py-1 text-xs font-bold text-slate-600 hover:bg-slate-50">Genåbn</button>
							</div>`;
}

/* ----------------------------------------------------------------------------
						   KØKKEN / BAR / RUNNER
						---------------------------------------------------------------------------- */

function setView(view) {
	activeView = view;
	const isTables = view === "tables";
	const isKitchen = view === "kitchen";
	const isBar = view === "bar";
	const isRunner = view === "runner";
	const hash = isKitchen ? "#kokken" : isBar ? "#bar" : isRunner ? "#runner" : "#borde";
	if (window.location.hash !== hash) window.history.replaceState(null, "", hash);
	tablesGrid.classList.toggle("hidden", !isTables);
	kitchenView.classList.toggle("hidden", !isKitchen);
	barView.classList.toggle("hidden", !isBar);
	runnerView.classList.toggle("hidden", !isRunner);
	statusLegend.classList.toggle("hidden", !isTables);
	roomHotbar.classList.toggle("hidden", !isTables);
	reservationsToggle.classList.toggle("hidden", !isTables);
	kitchenSummary.classList.remove("hidden");

	document.querySelectorAll(".view-toggle").forEach((button) => {
		const isActive = button.dataset.view === view;
		button.classList.toggle("bg-white", isActive);
		button.classList.toggle("text-slate-900", isActive);
		button.classList.toggle("shadow-sm", isActive);
		button.classList.toggle("text-slate-500", !isActive);
		button.classList.toggle("hover:text-slate-700", !isActive);
	});

	if (isKitchen) renderKitchen();
	if (isBar) renderBar();
	if (isRunner) renderRunner();
}

/* ---- Køkken ---- */

function groupPendingOrders() {
	const activeOrders = Object.entries(kitchenOrders)
		.filter(([, order]) => order.status === "pending" && order.slot === selectedSlotKey)
		.sort(([, first], [, second]) => (first.createdAt || 0) - (second.createdAt || 0));

	const groupedOrders = new Map();
	activeOrders.forEach(([id, order]) => {
		const tableKey = String(order.tableId);
		if (!groupedOrders.has(tableKey)) {
			groupedOrders.set(tableKey, { tableId: order.tableId, room: order.room || "", note: order.note || "", courses: new Map() });
		}
		const courses = groupedOrders.get(tableKey).courses;
		const courseKey = getCourseKey(order.course);
		if (!courses.has(courseKey)) courses.set(courseKey, []);
		courses.get(courseKey).push([id, order]);
	});

	return { activeOrders, groupedOrders };
}

const COURSE_PROGRESS = {
	empty: 0,
	arrived: 1,
	drinks_served: 2,
	starter_served: 3,
	main_ordered: 4,
	main_ready: 5,
	main_served: 6,
	dessert_ordered: 7,
	dessert_ready: 8,
	dessert_served: 9,
};

function sumTablePax(tableList, predicate) {
	return tableList.filter(predicate).reduce(
		(totals, table) => {
			const pescetarian = toQuantity(table.extras?.pescetarianQuantity);
			totals.pescetarian += pescetarian;
			totals.classic += Math.max(0, toQuantity(table.guests) - pescetarian);
			return totals;
		},
		{ classic: 0, pescetarian: 0 },
	);
}

function renderKitchenSummary() {
	const slotTables = Object.values(tables[selectedSlotKey] || {}).filter((table) => !table.completedAt);

	const starterTotals = sumTablePax(slotTables, (table) => COURSE_PROGRESS[table.status] < COURSE_PROGRESS.starter_served);
	const mainTotals = sumTablePax(slotTables, (table) => COURSE_PROGRESS[table.status] < COURSE_PROGRESS.main_ready);
	const dessertTotals = sumTablePax(slotTables, (table) => COURSE_PROGRESS[table.status] < COURSE_PROGRESS.dessert_ready);

	starterMissing.textContent = `${starterTotals.classic + starterTotals.pescetarian} pax`;
	mainMissingClassic.textContent = `${mainTotals.classic} klassisk`;
	mainMissingPescetarian.textContent = `${mainTotals.pescetarian} pescetar`;
	dessertMissing.textContent = `${dessertTotals.classic + dessertTotals.pescetarian} pax`;

	const dayTables = TIME_SLOTS.flatMap((slot) => Object.values(tables[slotKey(slot)] || {}));
	const dayTotal = sumTablePax(dayTables, () => true);
	dayTotalPax.textContent = `${dayTotal.classic + dayTotal.pescetarian} pax (${dayTotal.classic} klassisk · ${dayTotal.pescetarian} pescetar)`;
}

function renderKitchen() {
	const { activeOrders, groupedOrders } = groupPendingOrders();

	renderKitchenSummary();
	kitchenCount.textContent = `${groupedOrders.size} ${groupedOrders.size === 1 ? "bord" : "borde"}`;
	emptyKitchen.classList.toggle("hidden", activeOrders.length > 0);

	kitchenOrdersElement.innerHTML = Array.from(groupedOrders.values())
		.map((group) => renderKitchenCard(group))
		.join("");

	kitchenOrdersElement
		.querySelectorAll("[data-complete-course]")
		.forEach((button) => button.addEventListener("click", () => completeCourse(button.dataset.completeTable, button.dataset.completeCourse)));
}

function renderKitchenCard(group) {
	const courseBoxes = Array.from(group.courses.entries())
		.map(([courseKey, courseOrders]) => renderKitchenCourse(group, courseKey, courseOrders))
		.join("");

	return `<article class="min-h-[260px] rounded-2xl border-slate-200 bg-white p-6 shadow-sm">
								<div class="flex items-center justify-between gap-3 border-slate-200"><h3 class="font-display text-3xl font-bold text-slate-900">Bord ${escapeHtml(getDisplayNumber(group.tableId))}</h3>${group.room ? `<span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">${escapeHtml(group.room)}</span>` : ""}</div>
								<div class="mt-5 space-y-4">${courseBoxes}</div>
								${group.note ? `<p class="mt-4 border-t border-slate-200 pt-3 text-sm font-semibold text-slate-600">${escapeHtml(group.note)}</p>` : ""}
							</article>`;
}

function renderKitchenCourse(group, courseKey, courseOrders) {
	const firstOrder = courseOrders[0][1];
	const colors = {
		starter: "border-amber-300 bg-amber-50 text-amber-950",
		main: "border-sky-300 bg-sky-50 text-sky-950",
		dessert: "border-emerald-300 bg-emerald-50 text-emerald-950",
	}[courseKey];

	const isMain = courseKey === "main";
	const totalQuantity = courseOrders.reduce((total, [, order]) => total + toQuantity(order.quantity), 0);

	const sumQuantity = (pescetarian) =>
		courseOrders
			.filter(([, order]) => isPescetarianCourse(order.course) === pescetarian)
			.reduce((total, [, order]) => total + toQuantity(order.quantity), 0);
	const regularQuantity = isMain ? sumQuantity(false) : 0;
	const pescetarianQuantity = isMain ? sumQuantity(true) : 0;

	const waitedMinutes = minutesSince(Math.min(...courseOrders.map(([, order]) => order.createdAt || Date.now())));
	const waitColors = waitedMinutes >= 20 ? "bg-rose-500 text-white" : waitedMinutes >= 10 ? "bg-yellow-500 text-white" : "bg-white/80 text-slate-700";
	const waitBadge = `<span class="rounded-full px-2 py-1 text-xs font-bold ${waitColors}">${waitedMinutes} min</span>`;

	const paxLine = isMain
		? `<p class="mt-1 text-4xl font-bold">${regularQuantity + pescetarianQuantity}<span class="ml-2 text-base font-normal">pax</span></p>${
				pescetarianQuantity
					? `<p class="mt-2 text-base font-bold">${pescetarianQuantity} pescetar${regularQuantity ? ` · ${regularQuantity} klassisk` : ""}</p>`
					: ""
			}`
		: `<p class="mt-1 text-4xl font-bold">${totalQuantity}<span class="ml-2 text-base font-normal">pax</span></p>`;

	return `<div class="rounded-xl border-2 p-5 ${colors}"><div class="flex flex-wrap items-center justify-between gap-4"><div><p class="flex items-center gap-2 text-xl font-bold">${escapeHtml(firstOrder.course.replace(/ · pescetarisk/gi, ""))}${waitBadge}</p>${paxLine}</div><button data-complete-course="${escapeHtml(courseKey)}" data-complete-table="${escapeHtml(group.tableId)}" class="min-h-14 w-full rounded-xl bg-slate-900 px-5 py-4 text-lg font-bold text-white shadow-sm transition hover:bg-slate-700 sm:w-auto sm:min-w-32">Ready</button></div></div>`;
}

async function completeCourse(tableId, courseKey) {
	const orderIds = Object.entries(kitchenOrders)
		.filter(
			([, order]) =>
				order.status === "pending" &&
				order.slot === selectedSlotKey &&
				String(order.tableId) === String(tableId) &&
				getCourseKey(order.course) === courseKey,
		)
		.map(([id]) => id);
	for (const orderId of orderIds) await completeOrder(orderId);
}

async function completeOrder(orderId) {
	const order = kitchenOrders[orderId];
	if (!order) return;
	const slot = order.slot || selectedSlotKey;

	delete kitchenOrders[orderId];
	renderKitchen();
	renderTimeSlotTabs();

	if (order.readyStatus) {
		const currentTable = (tables[slot] && tables[slot][order.tableId]) || emptyTable;
		const readySince = currentTable.status === order.readyStatus ? currentTable.readySince : Date.now();
		tables[slot][order.tableId] = { ...currentTable, status: order.readyStatus, readySince };
		if (slot === selectedSlotKey) renderTables();
	}

	if (window.database) {
		const changes = { [`kitchenOrders/${orderId}`]: null };
		if (order.readyStatus) {
			changes[`tables/${slot}/${order.tableId}/status`] = order.readyStatus;
			changes[`tables/${slot}/${order.tableId}/readySince`] = tables[slot][order.tableId].readySince;
		}
		await update(ref(window.database), changes);
	}

	if (order.readyStatus) {
		await createRunnerOrder(order.tableId, order.course, order.quantity, order.note, slot);
	}
}

/* ---- Bar ---- */

function groupBarOrders() {
	const activeOrders = Object.entries(barOrders)
		.filter(([, order]) => order.slot === selectedSlotKey)
		.sort(([, first], [, second]) => (first.createdAt || 0) - (second.createdAt || 0));

	const groupedOrders = new Map();
	activeOrders.forEach(([id, order]) => {
		const tableKey = String(order.tableId);
		if (!groupedOrders.has(tableKey)) {
			groupedOrders.set(tableKey, { tableId: order.tableId, room: order.room || "", note: order.note || "", items: [] });
		}
		groupedOrders.get(tableKey).items.push([id, order]);
	});

	return { activeOrders, groupedOrders };
}

function renderBarSummary() {
	const activeOrders = Object.values(barOrders).filter((order) => order.slot === selectedSlotKey);
	const byCategory = {};
	activeOrders.forEach((order) => {
		const key = order.categoryId || "ukendt";
		if (!byCategory[key]) byCategory[key] = { name: order.categoryName || "Ukendt", count: 0 };
		byCategory[key].count += toQuantity(order.quantity);
	});
	if (!Object.keys(byCategory).length) {
		barSummary.innerHTML = "";
		return;
	}
	barSummary.innerHTML = Object.values(byCategory)
		.map(
			(entry) =>
				`<span class="rounded-full bg-violet-100 px-3 py-1.5 text-xs font-bold text-violet-900">Mangler · ${escapeHtml(entry.name)}: <strong>${entry.count}</strong></span>`,
		)
		.join("");
}

function renderBarInfo() {
	const slotTables = Object.values(tables[selectedSlotKey] || {}).filter((table) => !table.completedAt);
	const welcomeTotal = slotTables.reduce((sum, t) => sum + toQuantity(t.extras?.welcomeDrinkQuantity), 0);
	const wineTotal = slotTables.reduce((sum, t) => sum + toQuantity(t.extras?.wineQuantity), 0);
	const pescWineTotal = slotTables.reduce((sum, t) => sum + toQuantity(t.extras?.pescetarianWineQuantity), 0);
	const chips = [];
	if (welcomeTotal)
		chips.push(
			`<span class="rounded-full bg-fuchsia-100 px-3 py-1.5 text-xs font-bold text-fuchsia-800">🥂 Velkomstdrinks: <strong>${welcomeTotal}</strong></span>`,
		);
	if (wineTotal)
		chips.push(`<span class="rounded-full bg-rose-100 px-3 py-1.5 text-xs font-bold text-rose-800">🍷 Vinmenu: <strong>${wineTotal}</strong></span>`);
	if (pescWineTotal)
		chips.push(
			`<span class="rounded-full bg-rose-100 px-3 py-1.5 text-xs font-bold text-rose-800">🐟🍷 Vin/pescetar: <strong>${pescWineTotal}</strong></span>`,
		);
	barInfo.innerHTML = chips.join("");
	barInfo.classList.toggle("hidden", !chips.length);
}

function renderBar() {
	const { activeOrders, groupedOrders } = groupBarOrders();
	barCount.textContent = `${groupedOrders.size} ${groupedOrders.size === 1 ? "bord" : "borde"}`;
	emptyBar.classList.toggle("hidden", activeOrders.length > 0);
	barOrdersElement.innerHTML = Array.from(groupedOrders.values())
		.map((g) => renderBarCard(g))
		.join("");
	barOrdersElement
		.querySelectorAll("[data-complete-bar-order]")
		.forEach((b) => b.addEventListener("click", () => completeBarOrder(b.dataset.completeBarOrder)));
	renderBarSummary();
	renderBarInfo();
}

function renderBarCard(group) {
	const table = (tables[selectedSlotKey] && tables[selectedSlotKey][group.tableId]) || emptyTable;
	const extras = table.extras || {};
	const infoChips = [];
	if (toQuantity(extras.welcomeDrinkQuantity) > 0)
		infoChips.push(
			`<span class="rounded-full bg-fuchsia-100 px-2 py-1 text-[11px] font-bold text-fuchsia-800">🥂 ${toQuantity(extras.welcomeDrinkQuantity)}</span>`,
		);
	if (toQuantity(extras.wineQuantity) > 0)
		infoChips.push(
			`<span class="rounded-full bg-rose-100 px-2 py-1 text-[11px] font-bold text-rose-800">🍷 ${toQuantity(extras.wineQuantity)}</span>`,
		);
	if (toQuantity(extras.pescetarianWineQuantity) > 0)
		infoChips.push(
			`<span class="rounded-full bg-rose-100 px-2 py-1 text-[11px] font-bold text-rose-800">🐟🍷 ${toQuantity(extras.pescetarianWineQuantity)}</span>`,
		);

	const itemRows = group.items
		.map(
			([id, order]) => `<div class="flex items-center justify-between gap-2 rounded-lg bg-violet-50 px-3 py-2 ring-1 ring-violet-200">
							<div class="min-w-0 flex-1">
								<p class="truncate text-sm font-bold text-slate-900">${escapeHtml(order.itemName)}</p>
								<p class="text-xs text-slate-500">${order.quantity} stk${order.categoryName ? ` · ${escapeHtml(order.categoryName)}` : ""}${order.createdAt ? ` · ${minutesSince(order.createdAt)} min` : ""}</p>
							</div>
							<div class="flex shrink-0 items-center gap-1.5">
								<button type="button" data-complete-bar-order="${id}" class="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-slate-700">Klar</button>
							</div>
						</div>`,
		)
		.join("");

	return `<article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
					<div class="flex items-center justify-between gap-3">
						<h3 class="font-display text-3xl font-bold text-slate-900">Bord ${escapeHtml(getDisplayNumber(group.tableId))}</h3>
						${group.room ? `<span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">${escapeHtml(group.room)}</span>` : ""}
					</div>
					<div class="mt-5 space-y-2">${itemRows}</div>
					${infoChips.length ? `<div class="mt-4 flex flex-wrap items-center gap-1.5 border-t border-slate-200 pt-3">${infoChips.join("")}</div>` : ""}
					${group.note ? `<p class="mt-3 text-sm font-semibold text-slate-600">${escapeHtml(group.note)}</p>` : ""}
				</article>`;
}

/* ---- Runner ---- */

function groupRunnerOrders() {
	const activeOrders = Object.entries(runnerOrders)
		.filter(([, order]) => order.slot === selectedSlotKey)
		.sort(([, first], [, second]) => (first.createdAt || 0) - (second.createdAt || 0));

	const groupedOrders = new Map();
	activeOrders.forEach(([id, order]) => {
		const tableKey = String(order.tableId);
		if (!groupedOrders.has(tableKey)) {
			groupedOrders.set(tableKey, { tableId: order.tableId, room: order.room || "", note: order.note || "", courses: new Map() });
		}
		const courses = groupedOrders.get(tableKey).courses;
		const courseKey = getCourseKey(order.course);
		if (!courses.has(courseKey)) courses.set(courseKey, []);
		courses.get(courseKey).push([id, order]);
	});

	return { activeOrders, groupedOrders };
}

function renderRunner() {
	const { activeOrders, groupedOrders } = groupRunnerOrders();
	runnerCount.textContent = `${groupedOrders.size} ${groupedOrders.size === 1 ? "bord" : "borde"}`;
	emptyRunner.classList.toggle("hidden", activeOrders.length > 0);
	runnerOrdersElement.innerHTML = Array.from(groupedOrders.values())
		.map((group) => renderRunnerCard(group))
		.join("");
	runnerOrdersElement
		.querySelectorAll("[data-serve-course]")
		.forEach((button) => button.addEventListener("click", () => serveRunnerCourse(button.dataset.serveTable, button.dataset.serveCourse)));
}

function renderRunnerCard(group) {
	const courseBoxes = Array.from(group.courses.entries())
		.map(([courseKey, courseOrders]) => renderRunnerCourse(group, courseKey, courseOrders))
		.join("");
	return `<article class="min-h-[220px] rounded-2xl border-slate-200 bg-white p-6 shadow-sm">
					<div class="flex items-center justify-between gap-3 border-slate-200"><h3 class="font-display text-3xl font-bold text-slate-900">Bord ${escapeHtml(getDisplayNumber(group.tableId))}</h3>${group.room ? `<span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">${escapeHtml(group.room)}</span>` : ""}</div>
					<div class="mt-5 space-y-4">${courseBoxes}</div>
					${group.note ? `<p class="mt-4 border-t border-slate-200 pt-3 text-sm font-semibold text-slate-600">${escapeHtml(group.note)}</p>` : ""}
				</article>`;
}

function renderRunnerCourse(group, courseKey, courseOrders) {
	const firstOrder = courseOrders[0][1];
	const colors = {
		starter: "border-amber-300 bg-amber-50 text-amber-950",
		main: "border-sky-300 bg-sky-50 text-sky-950",
		dessert: "border-emerald-300 bg-emerald-50 text-emerald-950",
		drink: "border-violet-300 bg-violet-50 text-violet-950",
	}[courseKey];

	const totalQuantity = courseOrders.reduce((total, [, order]) => total + toQuantity(order.quantity), 0);

	const isMain = courseKey === "main";
	const pescetarianQuantity = isMain
		? courseOrders.filter(([, order]) => isPescetarianCourse(order.course)).reduce((total, [, order]) => total + toQuantity(order.quantity), 0)
		: 0;
	const regularQuantity = isMain ? totalQuantity - pescetarianQuantity : 0;
	const paxLine =
		isMain && pescetarianQuantity
			? `<p class="mt-2 text-base font-bold">${pescetarianQuantity} pescetar${regularQuantity ? ` · ${regularQuantity} klassisk` : ""}</p>`
			: "";

	const waitedMinutes = minutesSince(Math.min(...courseOrders.map(([, order]) => order.createdAt || Date.now())));
	const waitColors = waitedMinutes >= 10 ? "bg-rose-500 text-white" : waitedMinutes >= 5 ? "bg-yellow-500 text-white" : "bg-white/80 text-slate-700";
	const waitBadge = `<span class="rounded-full px-2 py-1 text-xs font-bold ${waitColors}">${waitedMinutes} min</span>`;

	const unit = courseKey === "drink" ? "stk" : "pax";

	return `<div class="rounded-xl border-2 p-5 ${colors}">
					<div class="flex flex-wrap items-center justify-between gap-4">
						<div>
							<p class="flex items-center gap-2 text-xl font-bold">${escapeHtml(firstOrder.course.replace(/ · pescetarisk/gi, ""))}${waitBadge}</p>
							<p class="mt-1 text-4xl font-bold">${totalQuantity}<span class="ml-2 text-base font-normal">${unit}</span></p>
							${paxLine}
						</div>
						<button data-serve-course="${escapeHtml(courseKey)}" data-serve-table="${escapeHtml(group.tableId)}" class="min-h-14 w-full rounded-xl bg-slate-900 px-5 py-4 text-lg font-bold text-white shadow-sm transition hover:bg-slate-700 sm:w-auto sm:min-w-32">Kør</button>
					</div>
				</div>`;
}

async function serveRunnerCourse(tableId, courseKey) {
	const orderIds = Object.entries(runnerOrders)
		.filter(([, order]) => order.slot === selectedSlotKey && String(order.tableId) === String(tableId) && getCourseKey(order.course) === courseKey)
		.map(([id]) => id);
	if (!orderIds.length) return;

	const firstOrder = runnerOrders[orderIds[0]];
	const slot = firstOrder.slot;
	const status = servedStatusByCourse[courseKey];

	if (status) {
		const table = (tables[slot] && tables[slot][firstOrder.tableId]) || emptyTable;
		await applyTableStatus(firstOrder.tableId, status, { guests: table.guests, note: table.note, extras: table.extras }, slot);
	} else {
		await clearRunnerOrdersFor(firstOrder.tableId, slot, courseKey);
	}
}

/* ----------------------------------------------------------------------------
						   ORDRER
						---------------------------------------------------------------------------- */

async function createKitchenOrder(tableId, quantity, note, course, readyStatus = "") {
	if (!(Number(quantity) > 0)) return;

	const timestamp = Date.now();
	const order = {
		tableId: Number(tableId),
		slot: selectedSlotKey,
		room: getRoomName(tableId),
		course,
		quantity,
		note,
		status: "pending",
		readyStatus,
		createdAt: timestamp,
	};

	if (window.database) {
		const orderId = push(ref(window.database, "kitchenOrders")).key;
		await update(ref(window.database), { [`kitchenOrders/${orderId}`]: order });
	} else {
		kitchenOrders[`demo-${timestamp}`] = order;
		renderKitchen();
		renderTimeSlotTabs();
	}
}

async function createCourseOrders({ tableId, course, readyStatus, note, guests, pescetarianQuantity }) {
	const regularQuantity = Math.max(0, guests - pescetarianQuantity);
	await createKitchenOrder(tableId, regularQuantity, note, course, readyStatus);
	await createKitchenOrder(tableId, pescetarianQuantity, note, `${course} · pescetarisk`, readyStatus);
}

async function createBarOrder(tableId, itemId, itemName, categoryId, categoryName, quantity, note, slotOverride = null) {
	const slot = slotOverride || selectedSlotKey;
	if (!(Number(quantity) > 0)) return;

	const timestamp = Date.now();
	const order = {
		tableId: Number(tableId),
		slot,
		room: getRoomName(tableId),
		itemId,
		itemName,
		categoryId,
		categoryName,
		quantity,
		note: note || "",
		createdAt: timestamp,
	};

	if (window.database) {
		const orderId = push(ref(window.database, "barOrders")).key;
		await update(ref(window.database), { [`barOrders/${orderId}`]: order });
	} else {
		barOrders[`demo-bar-${timestamp}-${Math.random().toString(36).slice(2, 6)}`] = order;
		if (activeView === "bar") renderBar();
	}
}

async function completeBarOrder(orderId) {
	const order = barOrders[orderId];
	if (!order) return;
	const slot = order.slot || selectedSlotKey;

	delete barOrders[orderId];
	if (activeView === "bar") renderBar();
	renderTimeSlotTabs();

	if (window.database) {
		await update(ref(window.database), { [`barOrders/${orderId}`]: null });
	}

	await createRunnerOrder(order.tableId, `Drikkevare · ${order.itemName}`, order.quantity, order.note, slot);
}

async function createRunnerOrder(tableId, course, quantity, note, slotOverride = null) {
	const slot = slotOverride || selectedSlotKey;
	if (!(Number(quantity) > 0)) return;

	const timestamp = Date.now();
	const order = {
		tableId: Number(tableId),
		slot,
		room: getRoomName(tableId),
		course,
		quantity,
		note,
		createdAt: timestamp,
	};

	if (window.database) {
		const orderId = push(ref(window.database, "runnerOrders")).key;
		await update(ref(window.database), { [`runnerOrders/${orderId}`]: order });
	} else {
		runnerOrders[`demo-runner-${timestamp}-${Math.random().toString(36).slice(2, 6)}`] = order;
		if (activeView === "runner") renderRunner();
	}
}

async function clearRunnerOrdersFor(tableId, slot, courseKey = null) {
	const changes = {};
	Object.entries(runnerOrders).forEach(([orderId, order]) => {
		const matches = order.slot === slot && String(order.tableId) === String(tableId) && (!courseKey || getCourseKey(order.course) === courseKey);
		if (matches) {
			delete runnerOrders[orderId];
			changes[`runnerOrders/${orderId}`] = null;
		}
	});
	if (!Object.keys(changes).length) return;
	if (window.database) await update(ref(window.database), changes);
	if (activeView === "runner") renderRunner();
}

async function clearBarOrdersFor(tableId, slot) {
	const changes = {};
	Object.entries(barOrders).forEach(([orderId, order]) => {
		if (order.slot === slot && String(order.tableId) === String(tableId)) {
			delete barOrders[orderId];
			changes[`barOrders/${orderId}`] = null;
		}
	});
	if (!Object.keys(changes).length) return;
	if (window.database) await update(ref(window.database), changes);
	if (activeView === "bar") renderBar();
}

/* ----------------------------------------------------------------------------
						   BORD-MODAL + WALK-IN
						---------------------------------------------------------------------------- */

function renderBookingInfo(table) {
	const extras = table.extras || {};
	const cells = [
		["Navn", table.name || "–"],
		["Telefon", table.phone || "–"],
		["Pax", toQuantity(table.guests)],
		["Pescetar", toQuantity(extras.pescetarianQuantity)],
		["Vinmenu", toQuantity(extras.wineQuantity)],
		["Vinmenu/pescetar", toQuantity(extras.pescetarianWineQuantity)],
		["Velkomstdrink", toQuantity(extras.welcomeDrinkQuantity)],
	];
	bookingInfo.innerHTML = cells
		.map(
			([label, value]) =>
				`<div><p class="text-[10px] font-bold uppercase tracking-wide text-slate-400">${label}</p><p class="truncate text-sm font-bold text-slate-800" title="${escapeHtml(String(value))}">${escapeHtml(String(value))}</p></div>`,
		)
		.join("");
}

function renderBookingEditForm(table) {
	const extras = table.extras || {};
	const fields = [
		["name", "Navn", table.name || "", "text"],
		["phone", "Telefon", table.phone || "", "text"],
		["guests", "Pax", toQuantity(table.guests), "number"],
		["pescetarianQuantity", "Pescetar", toQuantity(extras.pescetarianQuantity), "number"],
		["wineQuantity", "Vinmenu", toQuantity(extras.wineQuantity), "number"],
		["pescetarianWineQuantity", "Vinmenu/pescetar", toQuantity(extras.pescetarianWineQuantity), "number"],
		["welcomeDrinkQuantity", "Velkomstdrink", toQuantity(extras.welcomeDrinkQuantity), "number"],
	];
	bookingEditForm.innerHTML = fields
		.map(
			([field, label, value, type]) =>
				`<div><label class="mb-0.5 block text-[10px] font-bold uppercase tracking-wide text-slate-400">${label}</label><input data-booking-field="${field}" type="${type}" ${type === "number" ? 'min="0" inputmode="numeric"' : ""} value="${escapeHtml(String(value))}" class="w-full min-w-0 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm font-bold text-slate-800 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100" /></div>`,
		)
		.join("");
}

function startEditingBooking() {
	renderBookingEditForm(getActiveTable());
	bookingInfo.classList.add("hidden");
	editBookingToggle.classList.add("hidden");
	bookingEditForm.classList.remove("hidden");
	bookingEditActions.classList.remove("hidden");
	bookingEditMessage.textContent = "";
}

function stopEditingBooking() {
	bookingInfo.classList.remove("hidden");
	editBookingToggle.classList.remove("hidden");
	bookingEditForm.classList.add("hidden");
	bookingEditActions.classList.add("hidden");
}

async function saveBookingEdit() {
	if (!activeTableId) return;
	const slot = selectedSlotKey;
	const id = activeTableId;
	const field = (name) => bookingEditForm.querySelector(`[data-booking-field="${name}"]`)?.value ?? "";

	const guests = toQuantity(field("guests"));
	const extras = {
		pescetarianQuantity: Math.min(guests, toQuantity(field("pescetarianQuantity"))),
		wineQuantity: toQuantity(field("wineQuantity")),
		pescetarianWineQuantity: toQuantity(field("pescetarianWineQuantity")),
		welcomeDrinkQuantity: toQuantity(field("welcomeDrinkQuantity")),
		drinks: getActiveTable().extras?.drinks || {},
	};
	const name = field("name").trim();
	const phone = field("phone").trim();

	const updatedTable = { ...getActiveTable(), name, phone, guests, extras };
	tables[slot] = { ...(tables[slot] || {}), [id]: updatedTable };

	renderBookingInfo(updatedTable);
	stopEditingBooking();
	updateGuestGuard();
	renderTables();
	if (activeView === "kitchen") renderKitchen();
	if (activeView === "bar") renderBar();
	bookingEditMessage.textContent = "Gemmer...";

	try {
		if (window.database) {
			await update(ref(window.database), {
				[`tables/${slot}/${id}/name`]: name,
				[`tables/${slot}/${id}/phone`]: phone,
				[`tables/${slot}/${id}/guests`]: guests,
				[`tables/${slot}/${id}/extras`]: extras,
			});
		}
		bookingEditMessage.textContent = "Booking opdateret";
	} catch (error) {
		console.error(error);
		bookingEditMessage.textContent = "Kunne ikke gemme ændringen.";
	}
}

function openModal(id) {
	activeTableId = id;
	const table = getActiveTable();

	modalTitle.textContent = `Bord ${getDisplayNumber(id)}`;
	tableNote.value = table.note || "";
	stopEditingBooking();
	renderBookingInfo(table);
	bookingEditMessage.textContent = "";
	renderDrinksSummary(table);

	updateStatusButtons(table.status);
	saveMessage.textContent = "";

	deleteWalkInBtn.classList.toggle("hidden", !table.isWalkIn);

	modal.classList.remove("hidden");
	modal.classList.add("flex");
}

function renderDrinksSummary(table) {
	const entries = getDrinkEntries(table);
	if (!entries.length) {
		drinksSummary.innerHTML = `<p class="text-xs text-slate-400">Ingen ekstra drikkevarer endnu.</p>`;
		return;
	}
	drinksSummary.innerHTML =
		entries
			.map(
				(entry) =>
					`<div class="flex items-center justify-between gap-2"><span class="min-w-0 truncate font-semibold text-slate-700">${escapeHtml(entry.name)} <span class="text-slate-400">· ${entry.categoryLabel}</span></span><span class="shrink-0 font-bold text-slate-900">×${entry.quantity}</span></div>`,
			)
			.join("") +
		`<div class="mt-1 border-t border-slate-200 pt-1 text-right text-xs font-bold text-slate-500">I alt: ${getDrinksTotal(table)}</div>`;
}

function openDrinksPicker() {
	if (!activeTableId) return;
	const table = getActiveTable();
	const drinks = getDrinks(table);
	barPickerSnapshot = JSON.parse(JSON.stringify(drinks));
	const categoriesWithSelection = drinkCategories
		.filter((category) => (drinkCatalog[category.id] || []).length > 0)
		.map((category) => category.id)
		.filter((id) => Object.values(drinks[id] || {}).some((count) => toQuantity(count) > 0));
	expandedDrinkCategory = categoriesWithSelection.length === 1 ? categoriesWithSelection[0] : null;
	renderDrinksPickerBody(table);
	drinksPickerModal.classList.remove("hidden");
	drinksPickerModal.classList.add("flex");
}
async function closeDrinksPicker() {
	drinksPickerModal.classList.add("hidden");
	drinksPickerModal.classList.remove("flex");
	await flushDrinkOrdersToBar();
	renderDrinksSummary(getActiveTable());
}

async function flushDrinkOrdersToBar() {
	if (!activeTableId || !barPickerSnapshot) return;
	const table = getActiveTable();
	const currentDrinks = getDrinks(table);
	const increases = [];
	const decreases = [];
	const seen = new Set();

	Object.entries(currentDrinks).forEach(([categoryId, items]) => {
		Object.entries(items || {}).forEach(([itemId, count]) => {
			seen.add(`${categoryId}:${itemId}`);
			const currentCount = toQuantity(count);
			const oldCount = toQuantity(barPickerSnapshot[categoryId]?.[itemId]);
			const delta = currentCount - oldCount;
			if (delta > 0) {
				const category = drinkCategories.find((c) => c.id === categoryId);
				const categoryName = category?.name || categoryId;
				const itemName =
					itemId === SELF_ITEM_ID ? categoryName : (drinkCatalog[categoryId] || []).find((c) => c.id === itemId)?.name || "Ukendt vare";
				increases.push({ categoryId, categoryName, itemId, itemName, quantity: delta });
			} else if (delta < 0) {
				decreases.push({ categoryId, itemId, quantity: -delta });
			}
		});
	});

	Object.entries(barPickerSnapshot).forEach(([categoryId, items]) => {
		Object.entries(items || {}).forEach(([itemId, oldRaw]) => {
			if (seen.has(`${categoryId}:${itemId}`)) return;
			const oldCount = toQuantity(oldRaw);
			if (oldCount > 0) decreases.push({ categoryId, itemId, quantity: oldCount });
		});
	});

	const slot = selectedSlotKey;
	const tableId = activeTableId;
	barPickerSnapshot = null;

	for (const d of decreases) {
		await reduceBarOrdersForItem(slot, tableId, d.categoryId, d.itemId, d.quantity);
	}
	for (const order of increases) {
		await createBarOrder(tableId, order.itemId, order.itemName, order.categoryId, order.categoryName, order.quantity, table.note);
	}
}

function renderStepperRow(label, count, decrementKey, incrementKey) {
	return /*html*/ `<div class="flex items-center justify-between gap-1.5 rounded-md bg-white px-2 py-1 ring-1 ring-slate-200"><span class="min-w-0 truncate text-xs font-semibold text-slate-700">${escapeHtml(label)}</span><div class="flex shrink-0 items-center gap-1"><button type="button" data-drink-decrement="${decrementKey}" class="flex h-6 w-6 items-center justify-center rounded bg-slate-100 text-xs font-bold text-slate-600 transition hover:bg-slate-200" aria-label="Fjern en ${escapeHtml(label)}">−</button><span class="w-4 text-center text-xs font-bold text-slate-900">${count}</span><button type="button" data-drink-increment="${incrementKey}" class="flex h-6 w-6 items-center justify-center rounded bg-slate-900 text-xs font-bold text-white transition hover:bg-slate-700" aria-label="Tilføj en ${escapeHtml(label)}">+</button></div></div>`;
}

function renderDrinksPickerBody(table) {
	const drinks = getDrinks(table);
	if (!drinkCategories.length) {
		drinksPickerBody.innerHTML = `<p class="text-sm text-slate-400">Ingen kategorier oprettet endnu. Tilføj dem under Opsætning → Drikkekort.</p>`;
		return;
	}
	drinksPickerBody.innerHTML = drinkCategories
		.map((category) => {
			const items = drinkCatalog[category.id] || [];

			if (!items.length) {
				const count = toQuantity((drinks[category.id] || {})[SELF_ITEM_ID]);
				const key = `${category.id}:${SELF_ITEM_ID}`;
				return renderStepperRow(category.name, count, key, key);
			}

			const isExpanded = expandedDrinkCategory === category.id;
			const categoryTotal = getCategoryTotal(table, category.id);
			const rows = items
				.map((item) => {
					const count = toQuantity((drinks[category.id] || {})[item.id]);
					const key = `${category.id}:${item.id}`;
					return renderStepperRow(item.name, count, key, key);
				})
				.join("");

			return /*html*/ `<div class="rounded-lg ${isExpanded ? "bg-slate-50" : ""}">
										<button type="button" data-category-toggle="${category.id}" class="flex w-full items-center justify-between gap-2 px-2 py-1.5 text-left">
											<span class="text-xs font-bold text-slate-700">${escapeHtml(category.name)}</span>
											<span class="flex shrink-0 items-center gap-1.5">
												${categoryTotal > 0 ? `<span class="rounded-full bg-slate-900 px-1.5 py-0.5 text-[10px] font-bold text-white">${categoryTotal}</span>` : ""}
												<span class="text-xs text-slate-400">${isExpanded ? "▾" : "▸"}</span>
											</span>
										</button>
										${isExpanded ? `<div class="grid grid-cols-2 gap-1 px-2 pb-2">${rows}</div>` : ""}
									</div>`;
		})
		.join("");

	drinksPickerBody.querySelectorAll("[data-category-toggle]").forEach((button) =>
		button.addEventListener("click", () => {
			const id = button.dataset.categoryToggle;
			expandedDrinkCategory = expandedDrinkCategory === id ? null : id;
			renderDrinksPickerBody(getActiveTable());
		}),
	);
	drinksPickerBody
		.querySelectorAll("[data-drink-increment]")
		.forEach((button) => button.addEventListener("click", () => adjustDrinkItem(...button.dataset.drinkIncrement.split(":"), 1)));
	drinksPickerBody
		.querySelectorAll("[data-drink-decrement]")
		.forEach((button) => button.addEventListener("click", () => adjustDrinkItem(...button.dataset.drinkDecrement.split(":"), -1)));
}

async function adjustDrinkItem(categoryKey, itemId, delta) {
	const table = getActiveTable();
	const current = toQuantity((getDrinks(table)[categoryKey] || {})[itemId]);
	await setDrinkItemCount(categoryKey, itemId, current + delta);
}

async function setDrinkItemCount(categoryKey, itemId, nextCount) {
	if (!activeTableId) return;
	const slot = selectedSlotKey;
	const id = activeTableId;
	const table = getActiveTable();
	const drinks = { ...getDrinks(table) };
	const categoryItems = { ...(drinks[categoryKey] || {}) };
	const quantity = Math.max(0, toQuantity(nextCount));
	if (quantity > 0) categoryItems[itemId] = quantity;
	else delete categoryItems[itemId];
	drinks[categoryKey] = categoryItems;

	const updatedTable = { ...table, extras: { ...(table.extras || {}), drinks } };
	tables[slot] = { ...(tables[slot] || {}), [id]: updatedTable };

	if (!drinksPickerModal.classList.contains("hidden")) renderDrinksPickerBody(updatedTable);
	renderDrinksSummary(updatedTable);
	renderTables();

	try {
		if (window.database) await update(ref(window.database), { [`tables/${slot}/${id}/extras/drinks/${categoryKey}`]: categoryItems });
	} catch (error) {
		console.error(error);
	}
}

async function reduceBarOrdersForItem(slot, tableId, categoryId, itemId, amount) {
	if (amount <= 0) return;
	let remaining = amount;
	const matching = Object.entries(barOrders)
		.filter(([, o]) => o.slot === slot && String(o.tableId) === String(tableId) && o.categoryId === categoryId && o.itemId === itemId)
		.sort(([, a], [, b]) => (b.createdAt || 0) - (a.createdAt || 0));

	const changes = {};
	for (const [orderId, order] of matching) {
		if (remaining <= 0) break;
		const qty = toQuantity(order.quantity);
		if (qty <= remaining) {
			delete barOrders[orderId];
			changes[`barOrders/${orderId}`] = null;
			remaining -= qty;
		} else {
			const newQty = qty - remaining;
			barOrders[orderId] = { ...order, quantity: newQty };
			changes[`barOrders/${orderId}/quantity`] = newQty;
			remaining = 0;
		}
	}

	if (!Object.keys(changes).length) return;
	if (window.database) await update(ref(window.database), changes);
	if (activeView === "bar") renderBar();
	renderTimeSlotTabs();
}

/* ---- Walk-in hjælpere ---- */

function isTableInUse(slot, tableId) {
	const slotTables = tables[slot] || {};
	if (slotTables[tableId]) return true;
	for (const combined of combinedTables) {
		if (combined.tables.includes(tableId) && slotTables[combined.id]) return true;
	}
	return false;
}

function isCombinedTableFree(slot, combined) {
	const slotTables = tables[slot] || {};
	if (slotTables[combined.id]) return false;
	for (const t of combined.tables) {
		if (slotTables[t]) return false;
		for (const other of combinedTables) {
			if (other.id === combined.id) continue;
			if (other.tables.includes(t) && slotTables[other.id]) return false;
		}
	}
	return true;
}

// Bygger label for et bord i walk-in dropdown: viser tildelt bordskilt-nummer
// og maks pax. Hvis tildelt nummer er forskelligt fra det oprindelige ID,
// vises ID'et i parentes så personalet kan genkende bordet.
function buildTableOptionLabel(tableId, maxPax, extraSuffix = "") {
	const display = getDisplayNumber(tableId);
	const isRenamed = String(display) !== String(tableId);
	const idPart = isRenamed ? ` (${tableId})` : "";
	return `Bord ${display}${idPart} · maks ${maxPax} pax${extraSuffix}`;
}

function buildEmptyTableOptions(slot) {
	const byRoom = {};
	const addToRoom = (roomId, option) => {
		if (!byRoom[roomId]) byRoom[roomId] = [];
		byRoom[roomId].push(option);
	};

	PREDEFINED_TABLES.forEach((t) => {
		if (isTableInUse(slot, t.id)) return;
		const roomId = tableRoomAssignments[t.id] || "__unassigned";
		addToRoom(roomId, {
			value: t.id,
			label: buildTableOptionLabel(t.id, t.maxPax),
			maxPax: t.maxPax,
			sort: Number(getDisplayNumber(t.id)) || Number(t.id),
		});
	});

	combinedTables.forEach((combined) => {
		if (!isCombinedTableFree(slot, combined)) return;
		const roomId = tableRoomAssignments[combined.tables[0]] || "__unassigned";
		// Kombinerede borde: vis de tildelte numre for begge enkeltborde.
		const displayA = getDisplayNumber(combined.tables[0]);
		const displayB = getDisplayNumber(combined.tables[1] || combined.tables[0]);
		const label = `Bord ${displayA} + ${displayB} · maks ${combined.maxPax} pax (sammenslået)`;
		addToRoom(roomId, {
			value: combined.id,
			label,
			maxPax: combined.maxPax,
			sort: Number(displayA) || 0,
		});
	});

	return byRoom;
}

function populateWalkInTableOptions() {
	const slot = walkInSlot.value;
	const byRoom = buildEmptyTableOptions(slot);
	const roomOrder = settingsRooms.map((r) => r.id);
	if (!roomOrder.includes("__unassigned")) roomOrder.push("__unassigned");

	let html = '<option value="">— Vælg bord —</option>';
	roomOrder.forEach((roomId) => {
		const list = byRoom[roomId];
		if (!list || !list.length) return;
		const room = settingsRooms.find((r) => r.id === roomId);
		const roomName = room ? room.name : "Ikke tildelt";
		html += `<optgroup label="${escapeHtml(roomName)}">`;
		list.sort((a, b) => a.sort - b.sort || String(a.value).localeCompare(String(b.value)));
		list.forEach((opt) => {
			html += `<option value="${escapeHtml(opt.value)}" data-max-pax="${opt.maxPax}">${escapeHtml(opt.label)}</option>`;
		});
		html += `</optgroup>`;
	});
	walkInTable.innerHTML = html;
}

function onWalkInTableChange() {
	const opt = walkInTable.options[walkInTable.selectedIndex];
	const maxPax = Number(opt?.dataset?.maxPax) || 0;
	if (maxPax > 0) {
		const current = toQuantity(walkInPax.value);
		if (current > maxPax) walkInPax.value = maxPax;
	}
}

function openWalkInForm() {
	walkInSlot.innerHTML = TIME_SLOTS.map(
		(slot) => `<option value="${slotKey(slot)}" ${slotKey(slot) === selectedSlotKey ? "selected" : ""}>${slot}</option>`,
	).join("");

	populateWalkInTableOptions();

	walkInName.value = "";
	walkInPax.value = 2;
	walkInPescetar.value = 0;
	walkInWelcomeDrink.value = 0;
	walkInWine.value = 0;
	walkInPescWine.value = 0;
	walkInNote.value = "";
	walkInMessage.textContent = "";

	walkInModal.classList.remove("hidden");
	walkInModal.classList.add("flex");
	setTimeout(() => walkInTable.focus(), 100);
}

function closeWalkInForm() {
	walkInModal.classList.add("hidden");
	walkInModal.classList.remove("flex");
	walkInMessage.textContent = "";
}

async function saveWalkInForm() {
	walkInMessage.textContent = "";

	const slot = walkInSlot.value;
	const tableId = walkInTable.value;

	if (!tableId) {
		walkInMessage.textContent = "Vælg et bord.";
		return;
	}

	const name = walkInName.value.trim();
	if (!name) {
		walkInMessage.textContent = "Indtast et navn — det bruges til at finde bordet ved betaling.";
		walkInName.focus();
		return;
	}

	const guests = toQuantity(walkInPax.value);
	if (guests < 1) {
		walkInMessage.textContent = "Antal gæster skal være mindst 1.";
		return;
	}

	const combined = combinedTables.find((c) => c.id === tableId);
	if (combined) {
		if (!isCombinedTableFree(slot, combined)) {
			walkInMessage.textContent = "Det kombinerede bord er ikke længere ledigt. Vælg et andet.";
			populateWalkInTableOptions();
			return;
		}
	} else if (isTableInUse(slot, tableId)) {
		walkInMessage.textContent = "Bordet er ikke længere ledigt. Vælg et andet.";
		populateWalkInTableOptions();
		return;
	}

	const maxPax = combined ? combined.maxPax : tableMaxPax[tableId] || 0;
	if (maxPax && guests > maxPax) {
		walkInMessage.textContent = `Bordet kan maks. have ${maxPax} gæster.`;
		return;
	}

	const pescetar = Math.min(guests, toQuantity(walkInPescetar.value));
	const welcomeDrink = toQuantity(walkInWelcomeDrink.value);
	const wine = toQuantity(walkInWine.value);
	const pescWine = toQuantity(walkInPescWine.value);
	const note = walkInNote.value.trim();
	const timestamp = Date.now();

	const tableData = {
		name,
		phone: "",
		guests,
		note,
		extras: {
			pescetarianQuantity: pescetar,
			wineQuantity: wine,
			pescetarianWineQuantity: pescWine,
			welcomeDrinkQuantity: welcomeDrink,
			drinks: {},
		},
		status: "arrived",
		seatedAt: timestamp,
		readySince: null,
		completedAt: null,
		isWalkIn: true,
	};
	if (combined) tableData.isCombined = true;

	tables[slot] = { ...(tables[slot] || {}), [tableId]: tableData };

	try {
		if (window.database) {
			await update(ref(window.database), { [`tables/${slot}/${tableId}`]: tableData });
		}

		if (activeView !== "tables") setView("tables");
		if (slot !== selectedSlotKey) {
			selectedSlotKey = slot;
			renderTimeSlotTabs();
		}
		renderTables();
		closeWalkInForm();
		closeReservations();
	} catch (error) {
		console.error(error);
		walkInMessage.textContent = "Kunne ikke oprette bordet. Tjek Firebase.";
	}
}

async function deleteWalkInTable() {
	if (!activeTableId) return;
	const table = getActiveTable();
	if (!table.isWalkIn) return;

	if (!window.confirm(`Fjern walk-in bord ${getDisplayNumber(activeTableId)}? Data kan ikke gendannes.`)) return;

	const slot = selectedSlotKey;
	const tableId = activeTableId;
	const changes = {
		[`tables/${slot}/${tableId}`]: null,
	};

	Object.entries(kitchenOrders).forEach(([orderId, order]) => {
		if (order.slot === slot && Number(order.tableId) === Number(tableId)) {
			delete kitchenOrders[orderId];
			changes[`kitchenOrders/${orderId}`] = null;
		}
	});
	Object.entries(barOrders).forEach(([orderId, order]) => {
		if (order.slot === slot && Number(order.tableId) === Number(tableId)) {
			delete barOrders[orderId];
			changes[`barOrders/${orderId}`] = null;
		}
	});
	Object.entries(runnerOrders).forEach(([orderId, order]) => {
		if (order.slot === slot && Number(order.tableId) === Number(tableId)) {
			delete runnerOrders[orderId];
			changes[`runnerOrders/${orderId}`] = null;
		}
	});

	delete tables[slot][tableId];

	try {
		if (window.database) await update(ref(window.database), changes);
		closeModal();
		renderTables();
		renderKitchen();
		renderBar();
		renderRunner();
		renderTimeSlotTabs();
	} catch (error) {
		console.error(error);
	}
}

/* ---- Drikkekort-editor ---- */

function openDrinkCatalogEditor() {
	renderDrinkCatalogEditor();
	drinkCatalogModal.classList.remove("hidden");
	drinkCatalogModal.classList.add("flex");
}
function closeDrinkCatalogEditor() {
	drinkCatalogModal.classList.add("hidden");
	drinkCatalogModal.classList.remove("flex");
}

function renderDrinkCatalogEditor() {
	const categoryRows = drinkCategories
		.map((category, categoryIndex) => {
			const items = drinkCatalog[category.id] || [];
			const itemRows = items.length
				? items
						.map(
							(
								item,
								itemIndex,
							) => /*html*/ `<div class="flex items-center justify-between gap-1 rounded-md bg-slate-50 px-1.5 py-1"><div class="flex min-w-0 items-center gap-1"><div class="flex shrink-0 flex-col gap-0.5">
															<button type="button" data-move-item="${category.id}:${item.id}:up" ${itemIndex === 0 ? "disabled" : ""} class="flex h-3.5 w-4 items-center justify-center rounded-sm bg-slate-200 text-[8px] leading-none text-slate-600 hover:bg-slate-300 disabled:opacity-25 disabled:pointer-events-none" aria-label="Flyt ${escapeHtml(item.name)} op">▲</button>
															<button type="button" data-move-item="${category.id}:${item.id}:down" ${itemIndex === items.length - 1 ? "disabled" : ""} class="flex h-3.5 w-4 items-center justify-center rounded-sm bg-slate-200 text-[8px] leading-none text-slate-600 hover:bg-slate-300 disabled:opacity-25 disabled:pointer-events-none" aria-label="Flyt ${escapeHtml(item.name)} ned">▼</button>
														</div><span class="min-w-0 truncate text-xs text-slate-700">${escapeHtml(item.name)}</span></div><button type="button" data-remove-catalog-item="${category.id}:${item.id}" class="shrink-0 rounded px-1.5 py-0.5 text-[11px] font-bold text-rose-600 hover:bg-rose-50">Fjern</button></div>`,
						)
						.join("")
				: /*html*/ `<p class="text-[11px] text-slate-400">Ingen varer – kategorien er selv varen, og tjenerne får en +/- direkte på den.</p>`;
			return /*html*/ `<div class="rounded-lg border border-slate-200 p-2.5" data-category-section="${category.id}">
										<div class="mb-1.5 flex items-center gap-1.5">
											<div class="flex shrink-0 flex-col gap-0.5">
												<button type="button" data-move-category="${category.id}:up" ${categoryIndex === 0 ? "disabled" : ""} class="flex h-4 w-5 items-center justify-center rounded bg-slate-100 text-[9px] leading-none text-slate-600 hover:bg-slate-200 disabled:opacity-25 disabled:pointer-events-none" aria-label="Flyt ${escapeHtml(category.name)} op">▲</button>
												<button type="button" data-move-category="${category.id}:down" ${categoryIndex === drinkCategories.length - 1 ? "disabled" : ""} class="flex h-4 w-5 items-center justify-center rounded bg-slate-100 text-[9px] leading-none text-slate-600 hover:bg-slate-200 disabled:opacity-25 disabled:pointer-events-none" aria-label="Flyt ${escapeHtml(category.name)} ned">▼</button>
											</div>
											<input data-category-name="${category.id}" type="text" value="${escapeHtml(category.name)}" class="min-w-0 flex-1 rounded-lg border border-slate-300 px-2 py-1 text-sm font-bold text-slate-800 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100" aria-label="Kategorinavn" />
											<button type="button" data-remove-category="${category.id}" class="shrink-0 rounded-lg px-2 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50">Fjern kategori</button>
										</div>
										<div class="grid grid-cols-2 gap-1">${itemRows}</div>
										<div class="mt-1.5 flex gap-1.5">
											<input data-catalog-input="${category.id}" type="text" placeholder="Fx Coca-Cola 0,33L" class="min-w-0 flex-1 rounded-lg border border-slate-300 px-2 py-1 text-xs outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100" />
											<button type="button" data-catalog-add="${category.id}" class="shrink-0 rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-bold text-white hover:bg-slate-700">Tilføj vare</button>
										</div>
									</div>`;
		})
		.join("");

	drinkCatalogSections.innerHTML = /*html*/ `
								<div class="flex gap-1.5">
									<input id="newCategoryInput" type="text" placeholder="Ny kategori, fx Cocktails" class="min-w-0 flex-1 rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100" />
									<button id="addCategoryButton" type="button" class="shrink-0 rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-bold text-white hover:bg-slate-700">Tilføj kategori</button>
								</div>
								${categoryRows}
							`;

	const newCategoryInput = document.querySelector("#newCategoryInput");
	const submitNewCategory = () => {
		const name = newCategoryInput.value.trim();
		if (!name) return;
		addCategory(name);
		newCategoryInput.value = "";
	};
	document.querySelector("#addCategoryButton").addEventListener("click", submitNewCategory);
	newCategoryInput.addEventListener("keydown", (event) => {
		if (event.key === "Enter") {
			event.preventDefault();
			submitNewCategory();
		}
	});

	drinkCatalogSections.querySelectorAll("[data-category-name]").forEach((input) => {
		const commit = () => {
			const name = input.value.trim();
			if (name) renameCategory(input.dataset.categoryName, name);
			else input.value = drinkCategories.find((category) => category.id === input.dataset.categoryName)?.name || "";
		};
		input.addEventListener("blur", commit);
		input.addEventListener("keydown", (event) => {
			if (event.key === "Enter") {
				event.preventDefault();
				input.blur();
			}
		});
	});
	drinkCatalogSections.querySelectorAll("[data-remove-category]").forEach((button) =>
		button.addEventListener("click", () => {
			if (confirm("Fjern denne kategori og alle dens varer fra drikkekortet?")) removeCategory(button.dataset.removeCategory);
		}),
	);
	drinkCatalogSections.querySelectorAll("[data-move-category]").forEach((button) =>
		button.addEventListener("click", () => {
			const [categoryId, direction] = button.dataset.moveCategory.split(":");
			moveCategory(categoryId, direction);
		}),
	);
	drinkCatalogSections.querySelectorAll("[data-catalog-add]").forEach((button) => {
		const categoryId = button.dataset.catalogAdd;
		const input = drinkCatalogSections.querySelector(`[data-catalog-input="${categoryId}"]`);
		const submit = () => {
			const name = input.value.trim();
			if (!name) return;
			addCatalogItem(categoryId, name);
			input.value = "";
		};
		button.addEventListener("click", submit);
		input.addEventListener("keydown", (event) => {
			if (event.key === "Enter") {
				event.preventDefault();
				submit();
			}
		});
	});
	drinkCatalogSections.querySelectorAll("[data-remove-catalog-item]").forEach((button) =>
		button.addEventListener("click", () => {
			const [categoryId, itemId] = button.dataset.removeCatalogItem.split(":");
			removeCatalogItem(categoryId, itemId);
		}),
	);
	drinkCatalogSections.querySelectorAll("[data-move-item]").forEach((button) =>
		button.addEventListener("click", () => {
			const [categoryId, itemId, direction] = button.dataset.moveItem.split(":");
			moveCatalogItem(categoryId, itemId, direction);
		}),
	);
}

function moveArrayItem(array, index, direction) {
	const targetIndex = index + (direction === "up" ? -1 : 1);
	if (targetIndex < 0 || targetIndex >= array.length) return array;
	const reordered = [...array];
	[reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
	return reordered;
}
async function moveCategory(categoryId, direction) {
	const index = drinkCategories.findIndex((category) => category.id === categoryId);
	if (index === -1) return;
	drinkCategories = moveArrayItem(drinkCategories, index, direction);
	renderDrinkCatalogEditor();
	await saveDrinkCategories();
}
async function moveCatalogItem(categoryId, itemId, direction) {
	const items = drinkCatalog[categoryId] || [];
	const index = items.findIndex((item) => item.id === itemId);
	if (index === -1) return;
	const reordered = moveArrayItem(items, index, direction);
	drinkCatalog = { ...drinkCatalog, [categoryId]: reordered };
	renderDrinkCatalogEditor();
	try {
		if (window.database) await update(ref(window.database), { [`settings/drinkCatalog/${categoryId}`]: reordered });
	} catch (error) {
		console.error(error);
	}
}

async function saveDrinkCategories() {
	try {
		if (window.database) await update(ref(window.database), { "settings/drinkCategories": drinkCategories });
	} catch (error) {
		console.error(error);
	}
}
async function addCategory(name) {
	drinkCategories = [...drinkCategories, { id: generateCatalogItemId(), name }];
	renderDrinkCatalogEditor();
	await saveDrinkCategories();
}
async function renameCategory(categoryId, name) {
	drinkCategories = drinkCategories.map((category) => (category.id === categoryId ? { ...category, name } : category));
	await saveDrinkCategories();
}
async function removeCategory(categoryId) {
	drinkCategories = drinkCategories.filter((category) => category.id !== categoryId);
	const { [categoryId]: _removed, ...remainingCatalog } = drinkCatalog;
	drinkCatalog = remainingCatalog;
	renderDrinkCatalogEditor();
	try {
		if (window.database)
			await update(ref(window.database), {
				"settings/drinkCategories": drinkCategories,
				[`settings/drinkCatalog/${categoryId}`]: null,
			});
	} catch (error) {
		console.error(error);
	}
}
async function addCatalogItem(categoryId, name) {
	const items = [...(drinkCatalog[categoryId] || []), { id: generateCatalogItemId(), name }];
	drinkCatalog = { ...drinkCatalog, [categoryId]: items };
	renderDrinkCatalogEditor();
	try {
		if (window.database) await update(ref(window.database), { [`settings/drinkCatalog/${categoryId}`]: items });
	} catch (error) {
		console.error(error);
	}
}
async function removeCatalogItem(categoryId, itemId) {
	const items = (drinkCatalog[categoryId] || []).filter((item) => item.id !== itemId);
	drinkCatalog = { ...drinkCatalog, [categoryId]: items };
	renderDrinkCatalogEditor();
	try {
		if (window.database) await update(ref(window.database), { [`settings/drinkCatalog/${categoryId}`]: items });
	} catch (error) {
		console.error(error);
	}
}

/* ---- Guide-modal ---- */

const GUIDE_SECTIONS = [
	{
		id: "overblik",
		label: "Overblik",
		html: `
            <div class="space-y-5">
                <p class="text-sm text-slate-600">
                    Alle fem roller har hver sit ansvar. Ordreansvarlig kan være samme person som Vært uden for rush-perioderne.
                    Under rush bør de være to.
                </p>

                <div class="overflow-x-auto rounded-xl border border-slate-200">
                    <table class="w-full text-left text-xs sm:text-sm">
                        <thead class="bg-slate-100 text-slate-700">
                            <tr>
                                <th class="px-3 py-2 font-bold">Rolle</th>
                                <th class="px-3 py-2 font-bold">Hvor</th>
                                <th class="px-3 py-2 font-bold">Bruger primært</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            <tr><td class="px-3 py-2 font-bold">🎩 Vært</td><td class="px-3 py-2">Ved indgangen</td><td class="px-3 py-2">📅 Find en reservation</td></tr>
                            <tr><td class="px-3 py-2 font-bold">🍽️ Områdeansvarlig</td><td class="px-3 py-2">På gulvet, faste borde</td><td class="px-3 py-2">🍽️ Borde</td></tr>
                            <tr><td class="px-3 py-2 font-bold">👨‍🍳 Ordreansvarlig</td><td class="px-3 py-2">I køkkenet</td><td class="px-3 py-2">👨‍🍳 Køkken + 🏃 Runner</td></tr>
                            <tr><td class="px-3 py-2 font-bold">🏃 Runner / afrydder</td><td class="px-3 py-2">Løber</td><td class="px-3 py-2">Intet — får besked mundtligt</td></tr>
                            <tr><td class="px-3 py-2 font-bold">🍹 Bar</td><td class="px-3 py-2">I baren</td><td class="px-3 py-2">🍹 Bar</td></tr>
                        </tbody>
                    </table>
                </div>

                <div>
                    <h3 class="mb-2 font-display text-xl font-bold text-slate-900">Det store flow</h3>
                    <ol class="space-y-1.5 text-sm text-slate-700">
                        <li><strong>1.</strong> Vært markerer gæsten ankommet → bordet bliver <span class="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-800">RØDT</span></li>
                        <li><strong>2.</strong> Tjener serverer velkomstdrink og trykker <em>Drikkevarer serveret</em></li>
                        <li><strong>3.</strong> Runneren får automatisk besked om at hente forretten</li>
                        <li><strong>4.</strong> Ordreansvarlig trykker <em>Kør</em> på runner-siden → bordet bliver <span class="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">GULT</span></li>
                        <li><strong>5.</strong> Tjener trykker <em>Bestil hovedret</em> → køkkenet får ordren</li>
                        <li><strong>6.</strong> Køkken trykker <em>Ready</em> → Ordreansvarlig sender en runner og trykker <em>Kør</em> → bordet bliver <span class="rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-bold text-sky-800">BLÅT</span></li>
                        <li><strong>7.</strong> Samme mønster for dessert → bordet bliver <span class="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">GRØNT</span></li>
                        <li><strong>8.</strong> Tjener trykker <em>Afslut bord</em>, når betalingen er gennemført</li>
                    </ol>
                </div>

                <div class="rounded-xl bg-slate-100 p-3 text-sm text-slate-700">
                    <p class="font-bold">Walk-in borde</p>
                    <p class="mt-1">Kommer der gæster uden reservation, åbner vært <strong>📅 Find en reservation</strong> og trykker <strong>+ Tilføj walk-in</strong>. Udfyld hold, bord, navn og antal pax — så er bordet oprettet og klar til tjenerne.</p>
                </div>

                <div class="rounded-xl bg-violet-50 p-3 text-sm text-violet-900 ring-1 ring-violet-200">
                    <p class="font-bold">Undervejs: Ekstra drikkevarer</p>
                    <p class="mt-1">Tjener tilføjer varer fra bordets modal → baren får ordren → bar trykker <em>Klar</em> → runner bærer ud → Ordreansvarlig trykker <em>Kør</em> på runner-siden.</p>
                </div>
            </div>`,
	},
	{
		id: "vaert",
		label: "🎩 Vært",
		html: `
            <div class="space-y-4">
                <p class="text-sm font-bold text-rose-700">Står ved indgangen og tager imod gæsterne.</p>

                <div>
                    <h3 class="mb-2 text-sm font-bold text-slate-800">Gæster med reservation</h3>
                    <ol class="space-y-1.5 text-sm text-slate-700">
                        <li><strong>1.</strong> Åbn <strong>📅 Find en reservation</strong> (den runde knap i højre side).</li>
                        <li><strong>2.</strong> Søg på gæstens navn — søgningen dækker automatisk alle hold.</li>
                        <li><strong>3.</strong> Tryk <strong>Ankommet</strong> ud for reservationen.</li>
                        <li><strong>4.</strong> Før gæsterne til bordet og sig velkommen.</li>
                    </ol>
                </div>

                <div>
                    <h3 class="mb-2 text-sm font-bold text-slate-800">Gæster uden reservation (walk-in)</h3>
                    <ol class="space-y-1.5 text-sm text-slate-700">
                        <li><strong>1.</strong> Åbn <strong>📅 Find en reservation</strong>.</li>
                        <li><strong>2.</strong> Tryk <strong>+ Tilføj walk-in</strong> øverst.</li>
                        <li><strong>3.</strong> Vælg hold, bord og skriv gæstens navn.</li>
                        <li><strong>4.</strong> Indtast antal pax (og evt. pescetarer, velkomstdrink, vinmenu).</li>
                        <li><strong>5.</strong> Tryk <strong>Opret bord</strong>. Gæsterne er nu markeret ankommet.</li>
                    </ol>
                </div>

                <div>
                    <h3 class="mb-2 text-sm font-bold text-slate-800">Godt at vide</h3>
                    <ul class="space-y-1.5 text-sm text-slate-700">
                        <li>• Kun ledige borde vises i walk-in dropdown'en, grupperet pr. lokale.</li>
                        <li>• Kombinerede borde (fx 101+102) vises som ét valg, men kun hvis begge enkeltborde er ledige.</li>
                        <li>• Walk-in borde kan fjernes igen ved at åbne bordet og trykke "Fjern walk-in bord" nederst.</li>
                        <li>• Under rush: dobbelttjek bordnummeret mod bordskiltet.</li>
                    </ul>
                </div>

                <div class="rounded-xl bg-rose-50 p-3 text-sm text-rose-900 ring-1 ring-rose-200">
                    Du er færdig med din opgave, når bordet står som <strong>RØDT</strong> i oversigten.
                </div>
            </div>`,
	},
	{
		id: "omraade",
		label: "🍽️ Områdeansvarlig",
		html: `
            <div class="space-y-4">
                <p class="text-sm font-bold text-amber-700">Har ansvar for faste borde. Tager imod bestillinger og serverer.</p>

                <div>
                    <h3 class="mb-2 text-sm font-bold text-slate-800">Velkomstdrink (når bordet er RØDT)</h3>
                    <ul class="space-y-1.5 text-sm text-slate-700">
                        <li>• Hent velkomstdrinken i baren og sæt den på bordet.</li>
                        <li>• Tryk <strong>Drikkevarer serveret</strong> i bordets modal.</li>
                        <li>• Appen sender nu automatisk besked til runneren om, at forretten skal ud.</li>
                    </ul>
                </div>

                <div>
                    <h3 class="mb-2 text-sm font-bold text-slate-800">Ekstra drikkevarer (løbende)</h3>
                    <ul class="space-y-1.5 text-sm text-slate-700">
                        <li>• Åbn bordet og tryk <strong>+ Tilføj drikkevarer</strong>.</li>
                        <li>• Vælg varer med <strong>+/−</strong>.</li>
                        <li>• Tryk <strong>Færdig (send til bar)</strong>. Baren får ordren øjeblikkeligt.</li>
                        <li>• Du kan rette antallet igen senere — barens kø opdateres, når du trykker Færdig.</li>
                    </ul>
                </div>

                <div>
                    <h3 class="mb-2 text-sm font-bold text-slate-800">Mad</h3>
                    <ul class="space-y-1.5 text-sm text-slate-700">
                        <li>• Tryk <strong>Bestil hovedret</strong>, når bordet er klar. Køkkenet får ordren.</li>
                        <li>• Når Ordreansvarlig har trykket Kør på runner-siden, bliver bordet BLÅT.</li>
                        <li>• Tryk <strong>Bestil dessert</strong>, når gæsterne er klar til det.</li>
                        <li>• Når dessert er kørt ud, bliver bordet GRØNT.</li>
                    </ul>
                </div>

                <div>
                    <h3 class="mb-2 text-sm font-bold text-slate-800">Afslutning</h3>
                    <ul class="space-y-1.5 text-sm text-slate-700">
                        <li>• Tryk <strong>Afslut bord (regning skal være betalt)</strong> — først når betalingen er gennemført i baren.</li>
                        <li>• Bordet flytter ned i "Afsluttede borde".</li>
                    </ul>
                </div>

                <div class="rounded-xl bg-amber-50 p-3 text-sm text-amber-900 ring-1 ring-amber-200">
                    <p class="font-bold">Genvej under rush</p>
                    <p class="mt-1">Den blinkende prik på bordkortet betyder: maden står klar. Du kan klikke direkte på prikken for at markere, at den er bragt ud — uden at åbne bordet.</p>
                </div>
            </div>`,
	},
	{
		id: "ordre",
		label: "👨‍🍳 Ordreansvarlig",
		html: `
            <div class="space-y-4">
                <p class="text-sm font-bold text-sky-700">Styrer køkkenet, fordeler arbejdet og opdaterer status i appen.</p>

                <div>
                    <h3 class="mb-2 text-sm font-bold text-slate-800">Køkken (👨‍🍳 fanen)</h3>
                    <ul class="space-y-1.5 text-sm text-slate-700">
                        <li>• Køkkenet får automatisk hovedret- og dessert-ordrer, når tjenerne trykker Bestil.</li>
                        <li>• Når en ret er færdig, trykker køkkenet <strong>Ready</strong>. Så får runnerne besked via dig.</li>
                        <li>• Øverst i køkkenvisningen kan du se, hvor mange <strong>pax der mangler</strong> af hver ret, og hvor længe hver ordre har ventet (farveskift ved 10 og 20 min).</li>
                    </ul>
                </div>

                <div>
                    <h3 class="mb-2 text-sm font-bold text-slate-800">Runner (🏃 fanen)</h3>
                    <ul class="space-y-1.5 text-sm text-slate-700">
                        <li>• Her ser du alt, hvad der står klar til at blive båret ud — både fra køkken og bar.</li>
                        <li>• <strong>Fordel arbejdet:</strong> peg på et kort og sig til en runner: <em>"Lokale, bord nr og antal pax"</em>.</li>
                        <li>• Når runneren har bekræftet, at retten er bragt ud, trykker <strong>du</strong> <em>Kør</em> på kortet. Det opdaterer bordets status med det samme.</li>
                    </ul>
                </div>

                <div>
                    <h3 class="mb-2 text-sm font-bold text-slate-800">Forret — særligt ansvar</h3>
                    <ul class="space-y-1.5 text-sm text-slate-700">
                        <li>• Forretter laves <strong>samlet i køkkenet</strong>, ikke pr. bord.</li>
                        <li>• Sørg for at køkkenet har overblik over, hvor mange der mangler.</li>
                        <li>• Tælleren "Forret mangler" i køkkenvisningen viser, hvor mange kuverter der endnu ikke er serveret.</li>
                    </ul>
                </div>

                <div class="rounded-xl bg-sky-50 p-3 text-sm text-sky-900 ring-1 ring-sky-200">
                    <p class="font-bold">Du er appens "kaptajn" under rush</p>
                    <p class="mt-1">Tjenerne bestiller maden, køkkenet laver den — men det er dig, der sørger for at runnerne får besked, og at status bliver trykket korrekt ind.</p>
                </div>
            </div>`,
	},
	{
		id: "koekken",
		label: "🍳 Køkken",
		html: `
            <div class="space-y-4">
                <p class="text-sm font-bold text-amber-700">Laver maden. Holder styr på ordrerne på skærmen og melder retter klar.</p>

                <div>
                    <h3 class="mb-2 text-sm font-bold text-slate-800">Køkken (👨‍🍳 fanen)</h3>
                    <ul class="space-y-1.5 text-sm text-slate-700">
                        <li>• Hver ordre viser <strong>bord, lokale, antal pax og en eventuel note</strong>.</li>
                        <li>• Klassisk og pescetar står som separate linjer under hovedretten — så I ved, hvor mange af hver der skal laves.</li>
                        <li>• En farvet <strong>ventetids-badge</strong> på hver ret skifter ved 10 min (gul) og 20 min (rød), så I kan se, hvilket bord der har ventet længst.</li>
                    </ul>
                </div>

                <div>
                    <h3 class="mb-2 text-sm font-bold text-slate-800">Sådan melder I en ret færdig</h3>
                    <ol class="space-y-1.5 text-sm text-slate-700">
                        <li><strong>1.</strong> Find bordets kort i køen.</li>
                        <li><strong>2.</strong> Tryk <strong>Ready</strong> på den ret, der er klar.</li>
                        <li><strong>3.</strong> Ordren flytter til Runner-fanen, hvor Ordreansvarlig sender en runner.</li>
                    </ol>
                </div>

                <div>
                    <h3 class="mb-2 text-sm font-bold text-slate-800">Forret — samlet produktion</h3>
                    <ul class="space-y-1.5 text-sm text-slate-700">
                        <li>• Forretter laves <strong>samlet</strong>, ikke som enkelte bord-ordrer.</li>
                        <li>• Tælleren <strong>"Forret mangler"</strong> øverst i køkkenvisningen viser, hvor mange kuverter der endnu ikke er serveret for det valgte hold.</li>
                        <li>• Tjek tælleren med jævne mellemrum — den falder, efterhånden som tjenerne trykker "Forret serveret".</li>
                    </ul>
                </div>

                <div>
                    <h3 class="mb-2 text-sm font-bold text-slate-800">Hovedret og dessert</h3>
                    <ul class="space-y-1.5 text-sm text-slate-700">
                        <li>• Hovedret-ordrer kommer ind, når tjeneren trykker "Bestil hovedret".</li>
                        <li>• Dessert-ordrer kommer ind, når tjeneren trykker "Bestil dessert".</li>
                        <li>• Hver ordre kan indeholde både en <strong>klassisk</strong> og en <strong>pescetarisk</strong> linje — begge skal laves.</li>
                    </ul>
                </div>

                <div class="rounded-xl bg-amber-50 p-3 text-sm text-amber-900 ring-1 ring-amber-200">
                    <p class="font-bold">Dagens samlede pax</p>
                    <p class="mt-1">Øverst i køkkenvisningen står dagens samlede antal kuverter — både klassisk og pescetar — så I kan planlægge produktionen på tværs af alle hold.</p>
                </div>

                <div class="rounded-xl bg-slate-100 p-3 text-sm text-slate-700">
                    <p class="font-bold">Noter</p>
                    <p class="mt-1">Noter fra tjenerne vises nederst på bordets kort. De er typisk skrevet til jer (fx "Køkken: glutenallergi"). Læs dem, før I laver retten.</p>
                </div>
            </div>`,
	},
	{
		id: "runner",
		label: "🏃 Runner",
		html: `
            <div class="space-y-4">
                <p class="text-sm font-bold text-violet-700">Løber med mad og drikkevarer ud til bordene.</p>

                <div>
                    <h3 class="mb-2 text-sm font-bold text-slate-800">Din arbejdsdag</h3>
                    <ol class="space-y-1.5 text-sm text-slate-700">
                        <li><strong>1.</strong> Få besked fra Ordreansvarlig: <em>"Lokale, bord nr og antal pax"</em>.</li>
                        <li><strong>2.</strong> Hent retten/drikkevaren i køkkenet eller baren.</li>
                        <li><strong>3.</strong> Bær den ud til bordet og sæt den på bordet.</li>
                        <li><strong>4.</strong> Gå tilbage til Ordreansvarlig og bekræft, at det er bragt ud.</li>
                    </ol>
                </div>

                <div>
                    <h3 class="mb-2 text-sm font-bold text-slate-800">Farvekoderne på runner-kortene</h3>
                    <div class="space-y-1.5 text-sm">
                        <p><span class="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">GUL</span> = forret</p>
                        <p><span class="rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-bold text-sky-800">BLÅ</span> = hovedret</p>
                        <p><span class="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">GRØN</span> = dessert</p>
                        <p><span class="rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-bold text-violet-800">LILLA</span> = drikkevare</p>
                    </div>
                </div>

                <div>
                    <h3 class="mb-2 text-sm font-bold text-slate-800">Afrydning</h3>
                    <ul class="space-y-1.5 text-sm text-slate-700">
                        <li>• Når et bord er færdige med at spise dessert, kan det ryddes.</li>
                        <li>• Afrydningen er ikke en handling i appen — men sig til tjeneren, når bordet er tomt, så det kan afsluttes.</li>
                    </ul>
                </div>

                <div class="rounded-xl bg-violet-50 p-3 text-sm text-violet-900 ring-1 ring-violet-200">
                    <p class="font-bold">Du skal ikke trykke på appen</p>
                    <p class="mt-1">Ordreansvarlig styrer appen, mens du og de andre runnere fysisk bærer maden ud. Bekræft mundtligt, når retten er sat på bordet.</p>
                </div>
            </div>`,
	},
	{
		id: "bar",
		label: "🍹 Bar",
		html: `
            <div class="space-y-4">
                <p class="text-sm font-bold text-violet-700">Ansvarlig for alle drikkevarer — både før og under rushet.</p>

                <div>
                    <h3 class="mb-2 text-sm font-bold text-slate-800">Før rush</h3>
                    <ul class="space-y-1.5 text-sm text-slate-700">
                        <li>• Lav velkomstdrinks <strong>på forhånd</strong> baseret på dagens samlede antal gæster.</li>
                        <li>• I toppen af Bar-fanen står den samlede oversigt: hvor mange velkomstdrinks, vinmenu og vin/pescetar der er booket for det valgte hold.</li>
                    </ul>
                </div>

                <div>
                    <h3 class="mb-2 text-sm font-bold text-slate-800">Under rush — ekstra drikkevarer</h3>
                    <ol class="space-y-1.5 text-sm text-slate-700">
                        <li><strong>1.</strong> Tjeneren sender en drikkevare-ordre fra bordet.</li>
                        <li><strong>2.</strong> Den lander i <strong>🍹 Bar</strong>-fanen.</li>
                        <li><strong>3.</strong> Tryk <strong>Klar</strong>, når drikkevaren er lavet.</li>
                        <li><strong>4.</strong> Ordren flytter automatisk til Runner-fanen, hvor Ordreansvarlig sender en runner.</li>
                    </ol>
                </div>

                <div>
                    <h3 class="mb-2 text-sm font-bold text-slate-800">Hvad baren IKKE skal gøre</h3>
                    <ul class="space-y-1.5 text-sm text-slate-700">
                        <li>• <strong>Velkomstdrinks</strong> står ikke i bar-køen — tjeneren henter dem selv og markerer "Drikkevarer serveret" på bordet.</li>
                        <li>• <strong>Vinmenu</strong> (forudbestilt) står heller ikke i køen — den skænkes ved bordet af tjeneren.</li>
                    </ul>
                </div>

                <div>
                    <h3 class="mb-2 text-sm font-bold text-slate-800">Opstock</h3>
                    <ul class="space-y-1.5 text-sm text-slate-700">
                        <li>• I toppen af Bar-fanen vises en oversigt over, hvad der i øjeblikket er bestilt på tværs af alle borde (fx "Sodavand: 9 · Øl: 6").</li>
                        <li>• Brug den til at vurdere, om der skal fyldes op i køleskabet.</li>
                    </ul>
                </div>

                <div>
                    <h3 class="mb-2 text-sm font-bold text-slate-800">Betaling</h3>
                    <ul class="space-y-1.5 text-sm text-slate-700">
                        <li>• Når tjeneren siger, at et bord skal betale, slå reservationen op under <strong>📅 Find en reservation</strong>.</li>
                        <li>• Kontroller: antal pax, vinmenu / drikmenu / velkomstdrink og de ekstra drikkevarer (ses i bordets modal).</li>
                        <li>• Efter betaling siger du til tjeneren, at bordet kan afsluttes.</li>
                    </ul>
                </div>
            </div>`,
	},
	{
		id: "drikke",
		label: "🍹 Drikkevare-flow",
		html: `
            <div class="space-y-4">
                <h3 class="mb-2 font-display text-xl font-bold text-slate-900">Ekstra drikkevarer</h3>
                <ol class="space-y-1.5 text-sm text-slate-700">
                    <li><strong>1.</strong> Tjener trykker <em>+ Tilføj drikkevarer</em> på bordet.</li>
                    <li><strong>2.</strong> Vælger varer med <strong>+/−</strong>.</li>
                    <li><strong>3.</strong> Tjener trykker <em>Færdig (send til bar)</em>.</li>
                    <li><strong>4.</strong> Bar ser ordren på 🍹 Bar og trykker <em>Klar</em>.</li>
                    <li><strong>5.</strong> Ordren flytter til runneren.</li>
                    <li><strong>6.</strong> Ordreansvarlig sender en runner ud og trykker <em>Kør</em>.</li>
                </ol>

                <div class="rounded-xl bg-slate-100 p-3 text-sm text-slate-700">
                    <p class="font-bold">Vigtigt</p>
                    <p class="mt-1">Baren får kun ét samlet signal pr. vare. Retter tjeneren antallet ned, trækkes barens ordrer tilsvarende ned ved Færdig. Retter tjeneren op igen, oprettes en ny ordre.</p>
                </div>

                <div class="rounded-xl bg-rose-50 p-3 text-sm text-rose-900 ring-1 ring-rose-200">
                    <p class="font-bold">Særregel — velkomstdrinks og vinmenu</p>
                    <p class="mt-1">Velkomstdrinks laves <strong>på forhånd</strong> af baren, men står ikke i køen. Vinmenu skænkes ved bordet af tjeneren. Kun ekstra drikkevarer (sodavand, øl, kaffe osv.) går gennem bar-køen.</p>
                </div>
            </div>`,
	},
	{
		id: "walkin",
		label: "🚶 Walk-in",
		html: `
            <div class="space-y-4">
                <h3 class="mb-2 font-display text-xl font-bold text-slate-900">Gæster uden reservation</h3>
                <p class="text-sm text-slate-600">
                    Kommer der gæster uden en reservation, opretter vært et walk-in bord. Bordet opfører sig herefter som alle andre borde — det kommer blot ind i systemet uden om importen.
                </p>

                <div>
                    <h3 class="mb-2 text-sm font-bold text-slate-800">Sådan opretter du et walk-in bord</h3>
                    <ol class="space-y-1.5 text-sm text-slate-700">
                        <li><strong>1.</strong> Åbn <strong>📅 Find en reservation</strong>.</li>
                        <li><strong>2.</strong> Tryk <strong>+ Tilføj walk-in</strong> øverst i modalen.</li>
                        <li><strong>3.</strong> Vælg <strong>hold</strong> (fx 17:30).</li>
                        <li><strong>4.</strong> Vælg <strong>bord</strong> i dropdown'en — kun ledige borde vises, grupperet pr. lokale, med bordskilt-nummer og maks pax.</li>
                        <li><strong>5.</strong> Skriv et <strong>navn</strong> — det bruges til at finde bordet ved betaling.</li>
                        <li><strong>6.</strong> Indtast <strong>antal gæster</strong>, evt. hvor mange der er pescetarer, og forudbestilte drikkevarer (velkomstdrink, vinmenu, vin/pescetar).</li>
                        <li><strong>7.</strong> Skriv evt. en note.</li>
                        <li><strong>8.</strong> Tryk <strong>Opret bord</strong>.</li>
                    </ol>
                </div>

                <div>
                    <h3 class="mb-2 text-sm font-bold text-slate-800">Kombinerede borde (fx 101+102)</h3>
                    <p class="text-sm text-slate-700">Nogle borde kan slås sammen til et større bord. De vises som ét samlet valg i dropdown'en ("Bord 101 + 102 · maks 4 pax (sammenslået)"), men <strong>kun hvis begge enkeltborde er ledige</strong>. Er blot ét af dem optaget, forsvinder det kombinerede valg, og de enkelte borde kan heller ikke vælges.</p>
                </div>

                <div class="rounded-xl bg-amber-50 p-3 text-sm text-amber-900 ring-1 ring-amber-200">
                    <p class="font-bold">Bordet starter som "Ankommet"</p>
                    <p class="mt-1">Gæsterne er jo allerede til stede, så bordet markeres automatisk som ankommet. Tjenerne kan straks begynde at tage imod bestillinger.</p>
                </div>

                <div>
                    <h3 class="mb-2 text-sm font-bold text-slate-800">Hvis I opretter et bord ved en fejl</h3>
                    <p class="text-sm text-slate-700">Åbn bordet i oversigten og tryk <strong>Fjern walk-in bord</strong> nederst i modalen. Bordet fjernes helt — inkl. eventuelle ventende køkken-, bar- og runner-ordrer.</p>
                </div>

                <div>
                    <h3 class="mb-2 text-sm font-bold text-slate-800">Ved import af reservationer</h3>
                    <p class="text-sm text-slate-700">Hvis en importeret reservation rammer et bordnummer, der allerede er et walk-in på samme hold, spørger appen om walk-in'en skal overskrives eller bevares. Vælger du at bevare, springes den importerede reservation over, og du får en besked om det.</p>
                </div>
            </div>`,
	},
	{
		id: "særregler",
		label: "Særregler",
		html: `
            <div class="space-y-4">
                <div>
                    <h3 class="mb-1 text-sm font-bold text-slate-800">1. Forret — særligt flow</h3>
                    <p class="text-sm text-slate-700">Forretter laves samlet i køkkenet, ikke pr. bord. Runneren får automatisk besked, når tjeneren har trykket "Drikkevarer serveret".</p>
                </div>

                <div>
                    <h3 class="mb-1 text-sm font-bold text-slate-800">2. Hvis tjeneren trykker "Afslut bord" for tidligt</h3>
                    <p class="text-sm text-slate-700">Ordren forsvinder fra alle køer, og bordet ryger ned i "Afsluttede borde". Fejlen rettes med <strong>Genåbn</strong> på bordet.</p>
                </div>

                <div>
                    <h3 class="mb-1 text-sm font-bold text-slate-800">3. Hvis en køkken- eller bar-ordre aldrig bliver trykket</h3>
                    <p class="text-sm text-slate-700">Ordren bliver liggende i køen. Hold-fanebladene i topen blinker rødt, hvis der er ventende ordrer på et hold, du ikke selv kigger på.</p>
                </div>

                <div>
                    <h3 class="mb-1 text-sm font-bold text-slate-800">4. Hvis tjeneren selv tager drikkevarer</h3>
                    <p class="text-sm text-slate-700">Tryk <strong>Drikkevarer serveret</strong> i bordets modal. Alle ventende bar- og runner-ordrer for bordet ryddes automatisk.</p>
                </div>

                <div>
                    <h3 class="mb-1 text-sm font-bold text-slate-800">5. Noter</h3>
                    <p class="text-sm text-slate-700">Start noten med hvem den er til: <strong>Tjener</strong>, <strong>Køkken</strong>, <strong>Bar</strong> eller <strong>Runner</strong>. Fx "Køkken: glutenallergi" eller "Bar: ekstra is". Noten vises på bordet, i køkkenet, i baren og hos runneren.</p>
                </div>

                <div>
                    <h3 class="mb-1 text-sm font-bold text-slate-800">6. Nulstilling af en dag</h3>
                    <p class="text-sm text-slate-700"><strong>Nulstil status (alle borde)</strong> i Opsætning rydder status, timere, ekstra drikkevarer, noter og alle køer. Brug den kun, når dagen er slut eller ved fejlstart.</p>
                </div>

                <div>
                    <h3 class="mb-1 text-sm font-bold text-slate-800">7. Walk-ins og import</h3>
                    <p class="text-sm text-slate-700">Ved import af reservationer kan en importeret reservation ramme samme bordnummer og hold som et walk-in bord. Appen spørger, om walk-in'en skal overskrives eller bevares, og giver besked hvis en reservation blev sprunget over.</p>
                </div>
            </div>`,
	},
	{
		id: "reference",
		label: "📋 Reference",
		html: `
            <div class="space-y-3">
                <h3 class="font-display text-xl font-bold text-slate-900">Hvem trykker hvad</h3>
                <div class="overflow-x-auto rounded-xl border border-slate-200">
                    <table class="w-full text-left text-xs sm:text-sm">
                        <thead class="bg-slate-100 text-slate-700">
                            <tr>
                                <th class="px-3 py-2 font-bold">Handling</th>
                                <th class="px-3 py-2 font-bold">Rolle</th>
                                <th class="px-3 py-2 font-bold">Hvor</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            <tr><td class="px-3 py-2">Markér gæst ankommet</td><td class="px-3 py-2 font-bold">Vært</td><td class="px-3 py-2">📅 Find en reservation</td></tr>
                            <tr><td class="px-3 py-2">Opret walk-in bord</td><td class="px-3 py-2 font-bold">Vært</td><td class="px-3 py-2">📅 Find en reservation → + Tilføj walk-in</td></tr>
                            <tr><td class="px-3 py-2">Server velkomstdrink</td><td class="px-3 py-2 font-bold">Tjener</td><td class="px-3 py-2">🍽️ Borde → bordet</td></tr>
                            <tr><td class="px-3 py-2">Tilføj ekstra drikkevarer</td><td class="px-3 py-2 font-bold">Tjener</td><td class="px-3 py-2">🍽️ Borde → bordet</td></tr>
                            <tr><td class="px-3 py-2">Lav drikkevare færdig</td><td class="px-3 py-2 font-bold">Bar</td><td class="px-3 py-2">🍹 Bar → Klar</td></tr>
                            <tr><td class="px-3 py-2">Bestil hovedret</td><td class="px-3 py-2 font-bold">Tjener</td><td class="px-3 py-2">🍽️ Borde → bordet</td></tr>
                            <tr><td class="px-3 py-2">Lav mad færdig</td><td class="px-3 py-2 font-bold">Køkken</td><td class="px-3 py-2">👨‍🍳 Køkken → Ready</td></tr>
                            <tr><td class="px-3 py-2">Tryk "Kør" på runner-siden</td><td class="px-3 py-2 font-bold">Ordreansvarlig</td><td class="px-3 py-2">🏃 Runner → Kør</td></tr>
                            <tr><td class="px-3 py-2">Bestil dessert</td><td class="px-3 py-2 font-bold">Tjener</td><td class="px-3 py-2">🍽️ Borde → bordet</td></tr>
                            <tr><td class="px-3 py-2">Afslut bord</td><td class="px-3 py-2 font-bold">Tjener</td><td class="px-3 py-2">🍽️ Borde → bordet</td></tr>
                            <tr><td class="px-3 py-2">Nulstil dag</td><td class="px-3 py-2 font-bold">Ordreansvarlig</td><td class="px-3 py-2">⚙️ Opsætning</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>`,
	},
];

let activeGuideSection = "overblik";

function openGuide() {
	renderGuideTabs();
	renderGuideBody();
	guideModal.classList.remove("hidden");
	guideModal.classList.add("flex");
}

function closeGuide() {
	guideModal.classList.add("hidden");
	guideModal.classList.remove("flex");
}

function renderGuideTabs() {
	guideTabs.innerHTML = GUIDE_SECTIONS.map((section) => {
		const isActive = section.id === activeGuideSection;
		return `<button type="button" data-guide-tab="${section.id}" class="shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-bold transition ${
			isActive ? "bg-slate-900 text-white" : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
		}">${section.label}</button>`;
	}).join("");
	guideTabs.querySelectorAll("[data-guide-tab]").forEach((button) =>
		button.addEventListener("click", () => {
			activeGuideSection = button.dataset.guideTab;
			renderGuideTabs();
			renderGuideBody();
			guideBody.scrollTop = 0;
		}),
	);
}

function renderGuideBody() {
	const section = GUIDE_SECTIONS.find((s) => s.id === activeGuideSection) || GUIDE_SECTIONS[0];
	guideBody.innerHTML = section.html;
}

function closeModal() {
	modal.classList.add("hidden");
	modal.classList.remove("flex");
	activeTableId = null;
}

function updateGuestGuard() {
	const hasGuests = toQuantity(getActiveTable().guests) > 0;
	document.querySelectorAll(".status-button").forEach((button) => {
		if (button.dataset.status === "empty") return;
		button.disabled = !hasGuests;
		button.classList.toggle("opacity-40", !hasGuests);
		button.classList.toggle("cursor-not-allowed", !hasGuests);
	});
}

function updateStatusButtons(currentStatus) {
	const nextStatus = getNextStatus(currentStatus);
	document.querySelectorAll(".status-button").forEach((button) => {
		const isNext = nextStatus !== null && button.dataset.status === nextStatus;
		button.classList.toggle("status-button-next", isNext);
		button.classList.toggle("status-button-muted", !isNext && button.dataset.status !== "empty");
	});

	modalStatus.textContent = (statuses[currentStatus] || statuses.empty).label;
	const hint = waitingTextByStatus[currentStatus] || "";
	statusHint.textContent = hint;
	statusHint.classList.toggle("hidden", !hint);

	updateGuestGuard();
}

function blockWithoutGuests() {
	saveMessage.textContent = "Denne booking mangler antal gæster – ret det i den daglige import.";
	updateGuestGuard();
}

async function saveNote() {
	if (!activeTableId) return;
	const tableId = activeTableId;
	const slot = selectedSlotKey;
	const note = tableNote.value.trim();
	const currentTable = getActiveTable();

	tables[slot][tableId] = { ...currentTable, note };
	const changes = { [`tables/${slot}/${tableId}/note`]: note };

	Object.entries(kitchenOrders).forEach(([orderId, order]) => {
		if (order.slot === slot && Number(order.tableId) === Number(tableId) && order.status === "pending") {
			kitchenOrders[orderId] = { ...order, note };
			changes[`kitchenOrders/${orderId}/note`] = note;
		}
	});
	Object.entries(barOrders).forEach(([orderId, order]) => {
		if (order.slot === slot && Number(order.tableId) === Number(tableId)) {
			barOrders[orderId] = { ...order, note };
			changes[`barOrders/${orderId}/note`] = note;
		}
	});
	Object.entries(runnerOrders).forEach(([orderId, order]) => {
		if (order.slot === slot && Number(order.tableId) === Number(tableId)) {
			runnerOrders[orderId] = { ...order, note };
			changes[`runnerOrders/${orderId}/note`] = note;
		}
	});

	renderTables();
	renderKitchen();
	renderBar();
	renderRunner();
	saveMessage.textContent = "Gemmer note...";
	try {
		if (window.database) await update(ref(window.database), changes);
		saveMessage.textContent = "Gemt";
		setTimeout(closeModal, 250);
	} catch (error) {
		console.error(error);
		saveMessage.textContent = "Kunne ikke gemme note.";
	}
}

async function clearTable(tableId) {
	const slot = selectedSlotKey;
	const completedAt = Date.now();
	const changes = {
		[`tables/${slot}/${tableId}/status`]: "empty",
		[`tables/${slot}/${tableId}/seatedAt`]: null,
		[`tables/${slot}/${tableId}/readySince`]: null,
		[`tables/${slot}/${tableId}/completedAt`]: completedAt,
	};

	Object.entries(kitchenOrders).forEach(([orderId, order]) => {
		if (order.slot === slot && Number(order.tableId) === Number(tableId) && order.status === "pending") {
			delete kitchenOrders[orderId];
			changes[`kitchenOrders/${orderId}`] = null;
		}
	});

	Object.entries(barOrders).forEach(([orderId, order]) => {
		if (order.slot === slot && Number(order.tableId) === Number(tableId)) {
			delete barOrders[orderId];
			changes[`barOrders/${orderId}`] = null;
		}
	});

	Object.entries(runnerOrders).forEach(([orderId, order]) => {
		if (order.slot === slot && Number(order.tableId) === Number(tableId)) {
			delete runnerOrders[orderId];
			changes[`runnerOrders/${orderId}`] = null;
		}
	});

	tables[slot][tableId] = { ...tables[slot][tableId], status: "empty", seatedAt: null, readySince: null, completedAt };
	if (window.database) await update(ref(window.database), changes);
	renderTables();
	renderKitchen();
	renderBar();
	renderRunner();
}

async function reopenTable(tableId) {
	const slot = selectedSlotKey;
	const current = tables[slot][tableId];
	if (!current) return;
	tables[slot][tableId] = { ...current, completedAt: null };
	renderTables();
	if (window.database) await update(ref(window.database), { [`tables/${slot}/${tableId}/completedAt`]: null });
}

async function applyTableStatus(tableId, status, { guests, note, extras }, slotOverride) {
	const slot = slotOverride || selectedSlotKey;
	const previousTable = (tables[slot] && tables[slot][tableId]) || emptyTable;
	const values = {
		...previousTable,
		status,
		guests: toQuantity(guests),
		note: note || "",
		extras: { ...(extras || previousTable.extras || {}) },
	};
	if (status === "drinks_served") values.extras.welcomeDrinkQuantity = 0;

	values.seatedAt = status === "empty" ? null : previousTable.seatedAt || Date.now();
	values.readySince = null;

	tables[slot][tableId] = values;
	renderTables();

	if (status === "empty") {
		await clearTable(tableId);
		return values;
	}

	if (window.database) await update(ref(window.database, `tables/${slot}/${tableId}`), values);

	const nextCourse = courseByStatus[status];
	if (nextCourse) {
		const pescetarianQuantity = toQuantity(values.extras.pescetarianQuantity);
		await createCourseOrders({
			tableId,
			course: nextCourse.course,
			readyStatus: nextCourse.readyStatus,
			note: values.note,
			guests: values.guests,
			pescetarianQuantity,
		});
	}

	if (status === "drinks_served") {
		await clearBarOrdersFor(tableId, slot);
		await createRunnerOrder(tableId, "Forret", values.guests, values.note, slot);
	}

	const servedCourseKey = courseKeyByServedStatus[status];
	if (servedCourseKey) await clearRunnerOrdersFor(tableId, slot, servedCourseKey);

	return values;
}

async function saveTable(status) {
	if (!activeTableId) return;
	const tableId = activeTableId;
	const currentTable = getActiveTable();

	if (status !== "empty" && toQuantity(currentTable.guests) < 1) {
		blockWithoutGuests();
		return;
	}

	saveMessage.textContent = "Gemmer...";
	try {
		await applyTableStatus(tableId, status, { guests: currentTable.guests, note: tableNote.value.trim(), extras: currentTable.extras });
		saveMessage.textContent = "Gemt";
		setTimeout(closeModal, 350);
	} catch (error) {
		console.error(error);
		saveMessage.textContent = "Kunne ikke gemme. Tjek Firebase-konfigurationen.";
	}
}

async function markCourseServed(tableId) {
	const slot = selectedSlotKey;
	const table = tables[slot] && tables[slot][tableId];
	const nextStatus = table && nextStatusByStatus[table.status];
	if (!table || !nextStatus) return;
	try {
		await applyTableStatus(tableId, nextStatus, { guests: table.guests, note: table.note, extras: table.extras });
	} catch (error) {
		console.error(error);
		renderTables();
	}
}

/* ----------------------------------------------------------------------------
						   EVENT-BINDINGER
						---------------------------------------------------------------------------- */

document.querySelectorAll(".status-button").forEach((button) =>
	button.addEventListener("click", () => {
		const status = button.dataset.status;

		if (status !== "empty" && toQuantity(getActiveTable().guests) < 1) {
			blockWithoutGuests();
			return;
		}

		const currentStatus = getActiveTable().status || "empty";
		const needsConfirm = status === "empty" || status !== getNextStatus(currentStatus);
		if (needsConfirm && !window.confirm(getConfirmMessage(status, currentStatus))) return;

		saveTable(status);
	}),
);

document.querySelector("#closeModal").addEventListener("click", closeModal);
document.querySelector("#closeModalBottom").addEventListener("click", closeModal);
saveNoteButton.addEventListener("click", saveNote);
editBookingToggle.addEventListener("click", startEditingBooking);
document.querySelector("#cancelBookingEdit").addEventListener("click", () => {
	stopEditingBooking();
	renderBookingInfo(getActiveTable());
	bookingEditMessage.textContent = "";
});
document.querySelector("#saveBookingEdit").addEventListener("click", saveBookingEdit);
deleteWalkInBtn.addEventListener("click", deleteWalkInTable);
modal.addEventListener("click", (event) => {
	if (event.target === modal) closeModal();
});
document.addEventListener("keydown", (event) => {
	if (event.key !== "Escape") return;
	if (!walkInModal.classList.contains("hidden")) closeWalkInForm();
	else if (!reservationsModal.classList.contains("hidden")) closeReservations();
	else if (!drinksPickerModal.classList.contains("hidden")) closeDrinksPicker();
	else if (!drinkCatalogModal.classList.contains("hidden")) closeDrinkCatalogEditor();
	else if (!guideModal.classList.contains("hidden")) closeGuide();
	else closeModal();
});

const adminMenuToggle = document.querySelector("#adminMenuToggle");
const adminMenu = document.querySelector("#adminMenu");
function closeAdminMenu() {
	adminMenu.classList.add("hidden");
	adminMenu.classList.remove("flex");
	adminMenuToggle.setAttribute("aria-expanded", "false");
}
adminMenuToggle.addEventListener("click", (event) => {
	event.stopPropagation();
	const isOpen = !adminMenu.classList.contains("hidden");
	adminMenu.classList.toggle("hidden", isOpen);
	adminMenu.classList.toggle("flex", !isOpen);
	adminMenuToggle.setAttribute("aria-expanded", String(!isOpen));
});
document.addEventListener("click", (event) => {
	if (!adminMenu.contains(event.target) && event.target !== adminMenuToggle) closeAdminMenu();
});

document.querySelector("#settingsToggle").addEventListener("click", () => {
	closeAdminMenu();
	openSettings();
});
document.querySelector("#closeSettings").addEventListener("click", closeSettings);
document.querySelector("#saveSettings").addEventListener("click", saveSettings);
document.querySelector("#resetAllTables").addEventListener("click", resetAllTables);
document.querySelector("#resetTableRooms").addEventListener("click", resetTableRoomAssignments);
document.querySelector("#openDrinkCatalog").addEventListener("click", openDrinkCatalogEditor);
document.querySelector("#closeDrinkCatalog").addEventListener("click", closeDrinkCatalogEditor);
document.querySelector("#openDrinksPicker").addEventListener("click", openDrinksPicker);
document.querySelector("#closeDrinksPicker").addEventListener("click", closeDrinksPicker);
document.querySelector("#closeDrinksPickerBottom").addEventListener("click", closeDrinksPicker);
drinksPickerModal.addEventListener("click", (event) => {
	if (event.target === drinksPickerModal) closeDrinksPicker();
});
drinkCatalogModal.addEventListener("click", (event) => {
	if (event.target === drinkCatalogModal) closeDrinkCatalogEditor();
});
reservationsToggle.addEventListener("click", openReservations);
document.querySelector("#closeReservations").addEventListener("click", closeReservations);
reservationsModal.addEventListener("click", (event) => {
	if (event.target === reservationsModal) closeReservations();
});
reservationsSearch.addEventListener("input", renderReservationsList);
document.querySelector("#addRoom").addEventListener("click", () => {
	syncRoomEditsFromInputs();
	settingsRooms.push({
		id: `room-${Date.now()}`,
		name: "Nyt lokale",
		accent: "text-slate-700",
		line: "bg-slate-500",
		nav: "bg-slate-200 text-slate-700",
	});
	renderSettingsRows();
});

// Walk-in.
document.querySelector("#openWalkInForm").addEventListener("click", openWalkInForm);
document.querySelector("#closeWalkIn").addEventListener("click", closeWalkInForm);
document.querySelector("#cancelWalkIn").addEventListener("click", closeWalkInForm);
document.querySelector("#saveWalkIn").addEventListener("click", saveWalkInForm);
walkInModal.addEventListener("click", (event) => {
	if (event.target === walkInModal) closeWalkInForm();
});
walkInSlot.addEventListener("change", () => {
	populateWalkInTableOptions();
	walkInTable.value = "";
});
walkInTable.addEventListener("change", onWalkInTableChange);

// Guide.
document.querySelector("#guideToggle").addEventListener("click", () => {
	closeAdminMenu();
	openGuide();
});
document.querySelector("#closeGuide").addEventListener("click", closeGuide);
document.querySelector("#closeGuideBottom").addEventListener("click", closeGuide);
guideModal.addEventListener("click", (event) => {
	if (event.target === guideModal) closeGuide();
});

// Import.
document.querySelector("#importToggle").addEventListener("click", () => {
	closeAdminMenu();
	openImportModal();
});
document.querySelector("#closeImport").addEventListener("click", closeImportModal);
document.querySelector("#closeImportBottom").addEventListener("click", closeImportModal);
document.querySelector("#saveImport").addEventListener("click", saveImport);
document.querySelector("#clearAllReservations").addEventListener("click", clearAllReservations);

document.querySelector("#tablesToggle").addEventListener("click", () => setView("tables"));
document.querySelector("#kitchenToggle").addEventListener("click", () => setView("kitchen"));
document.querySelector("#barToggle").addEventListener("click", () => setView("bar"));
document.querySelector("#runnerToggle").addEventListener("click", () => setView("runner"));

/* ----------------------------------------------------------------------------
						   OPSTART + FIREBASE-LYTTERE
						---------------------------------------------------------------------------- */

renderTimeSlotTabs();
renderTables();
renderKitchen();
renderBar();
renderRunner();
setView(
	window.location.hash === "#kokken" ? "kitchen" : window.location.hash === "#bar" ? "bar" : window.location.hash === "#runner" ? "runner" : "tables",
);

setInterval(() => {
	renderTimeSlotTabs();
	renderTables();
	if (activeView === "kitchen") renderKitchen();
	if (activeView === "bar") renderBar();
	if (activeView === "runner") renderRunner();
}, 10000);

const hasFirebaseConfig = !firebaseConfig.apiKey.startsWith("INDSAET") && !firebaseConfig.projectId.startsWith("DIT-");

if (hasFirebaseConfig) {
	try {
		const app = initializeApp(firebaseConfig);
		window.database = getDatabase(app);

		onValue(ref(window.database, "tables"), (snapshot) => {
			const value = snapshot.val() || {};
			tables = Object.fromEntries(TIME_SLOTS.map((slot) => [slotKey(slot), value[slotKey(slot)] || {}]));

			if (!hasAutoSelectedSlot) {
				hasAutoSelectedSlot = true;
				const firstWithData = TIME_SLOTS.map(slotKey).find((key) => Object.keys(tables[key]).length > 0);
				if (firstWithData) selectedSlotKey = firstWithData;
			}

			renderTimeSlotTabs();
			renderTables();
			if (activeView === "kitchen") renderKitchen();
			if (activeView === "bar") renderBar();
			if (activeView === "runner") renderRunner();
			if (!reservationsModal.classList.contains("hidden")) renderReservationsList();
			connectionDot.className = "status-dot h-3 w-3 rounded-full bg-emerald-500";
			connectionLabel.textContent = "Live";
		});

		onValue(ref(window.database, "settings/rooms"), (snapshot) => {
			const savedRooms = snapshot.val();
			if (!Array.isArray(savedRooms) || !savedRooms.length) return;
			settingsRooms = savedRooms.map((room, index) => ({
				id: room.id || `room-${index}`,
				name: room.name || `Lokale ${index + 1}`,
				accent: room.accent || "text-slate-700",
				line: room.line || "bg-slate-500",
				nav: room.nav || "bg-slate-200 text-slate-700",
			}));
			renderTables();
		});

		onValue(ref(window.database, "settings/tableRooms"), (snapshot) => {
			tableRoomAssignments = snapshot.val() || {};
			renderTables();
		});

		onValue(ref(window.database, "settings/tableNumbers"), (snapshot) => {
			tableDisplayNumbers = snapshot.val() || {};
			renderTables();
			if (activeView === "kitchen") renderKitchen();
			if (activeView === "bar") renderBar();
			if (activeView === "runner") renderRunner();
			if (!reservationsModal.classList.contains("hidden")) renderReservationsList();
		});

		onValue(ref(window.database, "settings/tableMaxPax"), (snapshot) => {
			const saved = snapshot.val();
			if (saved && typeof saved === "object" && Object.keys(saved).length) {
				tableMaxPax = { ...tableMaxPax, ...saved };
			}
			renderTables();
		});

		onValue(ref(window.database, "settings/combinedTables"), (snapshot) => {
			const saved = snapshot.val();
			if (Array.isArray(saved) && saved.length) {
				combinedTables = saved.map((c) => ({
					id: c.id || (c.tables ? c.tables.join("") : ""),
					label: c.label || (c.tables ? c.tables.join("+") : ""),
					tables: Array.isArray(c.tables) ? c.tables : [],
					maxPax: c.maxPax || 0,
				}));
			}
			renderTables();
		});

		onValue(ref(window.database, "settings/drinkCategories"), (snapshot) => {
			const savedCategories = snapshot.val();
			if (!Array.isArray(savedCategories) || !savedCategories.length) return;
			drinkCategories = savedCategories.map((category, index) => ({
				id: category.id || `category-${index}`,
				name: category.name || `Kategori ${index + 1}`,
			}));
			if (!drinkCatalogModal.classList.contains("hidden")) renderDrinkCatalogEditor();
			if (activeTableId && !drinksPickerModal.classList.contains("hidden")) renderDrinksPickerBody(getActiveTable());
			if (activeTableId) renderDrinksSummary(getActiveTable());
			renderTables();
		});

		onValue(ref(window.database, "settings/drinkCatalog"), (snapshot) => {
			drinkCatalog = snapshot.val() || {};
			if (!drinkCatalogModal.classList.contains("hidden")) renderDrinkCatalogEditor();
			if (activeTableId && !drinksPickerModal.classList.contains("hidden")) renderDrinksPickerBody(getActiveTable());
			if (activeTableId) renderDrinksSummary(getActiveTable());
		});

		onValue(ref(window.database, "kitchenOrders"), (snapshot) => {
			kitchenOrders = snapshot.val() || {};
			renderTimeSlotTabs();
			if (activeView === "kitchen") renderKitchen();
		});

		onValue(ref(window.database, "barOrders"), (snapshot) => {
			barOrders = snapshot.val() || {};
			renderTimeSlotTabs();
			if (activeView === "bar") renderBar();
		});

		onValue(ref(window.database, "runnerOrders"), (snapshot) => {
			runnerOrders = snapshot.val() || {};
			renderTimeSlotTabs();
			if (activeView === "runner") renderRunner();
		});
	} catch (error) {
		console.error(error);
		connectionLabel.textContent = "Demo · Firebase mangler";
	}
} else {
	connectionDot.className = "status-dot h-3 w-3 rounded-full bg-amber-400";
	connectionLabel.textContent = "Demo · indsæt nøgler";
}

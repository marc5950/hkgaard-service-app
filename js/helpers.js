/* ============================================================================
   HJÆLPEFUNKTIONER · HESTKØBGAARD
   ----------------------------------------------------------------------------
   Rene funktioner uden state. Nogle få afhænger af konstanter fra config.js.
   ============================================================================ */

import { nextStatusByStatus, courseByStatus } from "./config.js";

export function slotKey(label) {
	return String(label || "")
		.replace(":", "")
		.trim();
}

export function escapeHtml(value) {
	return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character]);
}

export function toQuantity(value) {
	return Math.max(0, Number(value) || 0);
}

export function getDrinks(table) {
	return (table.extras && table.extras.drinks) || {};
}

export function getDrinksTotal(table) {
	const drinks = getDrinks(table);
	return Object.values(drinks).reduce((sum, items) => sum + Object.values(items || {}).reduce((itemSum, count) => itemSum + toQuantity(count), 0), 0);
}

export function getCategoryTotal(table, categoryId) {
	return Object.values(getDrinks(table)[categoryId] || {}).reduce((sum, count) => sum + toQuantity(count), 0);
}

export function generateCatalogItemId() {
	return `d${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function minutesSince(timestamp) {
	if (!timestamp) return 0;
	return Math.max(0, Math.floor((Date.now() - timestamp) / 60000));
}

export function secondsSince(timestamp) {
	if (!timestamp) return 0;
	return Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
}

export function formatDuration(minutes) {
	if (minutes < 60) return `${minutes} min`;
	return `${Math.floor(minutes / 60)}t ${minutes % 60}m`;
}

export function formatDurationWithSeconds(seconds) {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;
	if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
	const hours = Math.floor(minutes / 60);
	const remainingMinutes = minutes % 60;
	return `${hours}t ${remainingMinutes}m ${remainingSeconds}s`;
}

export function isPescetarianCourse(course) {
	return String(course).toLowerCase().includes("pescetar");
}

export function getCourseKey(course) {
	const normalizedCourse = String(course).toLowerCase();
	if (normalizedCourse.startsWith("forret") || normalizedCourse.startsWith("starter")) return "starter";
	if (normalizedCourse.startsWith("hovedret")) return "main";
	if (normalizedCourse.startsWith("drikkevare") || normalizedCourse.startsWith("drink")) return "drink";
	return "dessert";
}

export function getNextStatus(currentStatus) {
	return currentStatus in nextStatusByStatus ? nextStatusByStatus[currentStatus] : "arrived";
}

export function getConfirmMessage(status, currentStatus) {
	if (status === "empty") return "Er du sikker på, at bordet skal gøres ledigt?";
	if (status === currentStatus) {
		const course = courseByStatus[status]?.course;
		return course ? `${course} er allerede sendt til køkkenet. Vil du sende den igen?` : "Bordet står allerede i denne status. Vil du fortsætte?";
	}
	return "Dette følger ikke den normale rækkefølge. Er du sikker på, at du vil fortsætte?";
}

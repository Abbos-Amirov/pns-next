import { makeVar } from '@apollo/client';

import { CustomJwtPayload } from '../libs/types/customJwtPayload';
export const themeVar = makeVar({});

export const userVar = makeVar<CustomJwtPayload>({
	_id: '',
	memberType: '',
	memberStatus: '',
	memberAuthType: '',
	memberPhone: '',
	memberNick: '',
	memberFullName: '',
	memberImage: '',
	memberAddress: '',
	memberDesc: '',
	memberProperties: 0,
	memberRank: 0,
	memberArticles: 0,
	memberPoints: 0,
	memberLikes: 0,
	memberViews: 0,
	memberWarnings: 0,
	memberBlocks: 0,
});

/**
 * Fallback persistence for Location likes (until backend returns a stable per-user like relation for Location).
 * Stored as: { [memberId]: string[] } (array of liked locationIds)
 */
export type LikedLocationsByUser = Record<string, string[]>;

const LIKED_LOCATIONS_STORAGE_KEY = 'likedLocationsByUser';
let likedLocationsHydrated = false;

export const likedLocationsVar = makeVar<LikedLocationsByUser>({});

function hydrateLikedLocationsFromStorage() {
	if (likedLocationsHydrated) return;
	likedLocationsHydrated = true;
	if (typeof window === 'undefined') return;
	try {
		const raw = window.localStorage.getItem(LIKED_LOCATIONS_STORAGE_KEY);
		if (!raw) return;
		const parsed = JSON.parse(raw);
		if (parsed && typeof parsed === 'object') {
			likedLocationsVar(parsed as LikedLocationsByUser);
		}
	} catch (e) {
		// ignore storage errors
	}
}

function persistLikedLocationsToStorage(state: LikedLocationsByUser) {
	if (typeof window === 'undefined') return;
	try {
		window.localStorage.setItem(LIKED_LOCATIONS_STORAGE_KEY, JSON.stringify(state));
	} catch (e) {
		// ignore storage errors
	}
}

export function isLocationLikedByUser(memberId: string | undefined, locationId: string | undefined): boolean {
	if (!memberId || !locationId) return false;
	hydrateLikedLocationsFromStorage();
	const state = likedLocationsVar();
	return Array.isArray(state[memberId]) ? state[memberId].includes(locationId) : false;
}

export function setLocationLikedForUser(memberId: string, locationId: string, liked: boolean) {
	if (!memberId || !locationId) return;
	hydrateLikedLocationsFromStorage();
	const current = likedLocationsVar();
	const prevList = Array.isArray(current[memberId]) ? current[memberId] : [];
	const nextSet = new Set(prevList);
	if (liked) nextSet.add(locationId);
	else nextSet.delete(locationId);
	const next: LikedLocationsByUser = { ...current, [memberId]: Array.from(nextSet) };
	likedLocationsVar(next);
	persistLikedLocationsToStorage(next);
}

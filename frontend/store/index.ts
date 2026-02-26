import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Tab {
    id: string;
    contentId: string;
    title: string;
    type: 'category' | 'report';
    params?: any;
    active: boolean;
}

interface TabState {
    tabs: Tab[];
    activeTabId: string | null;
}

const initialState: TabState = {
    tabs: [],
    activeTabId: null,
};

const tabSlice = createSlice({
    name: 'tabs',
    initialState,
    reducers: {
        addTab: (state, action: PayloadAction<Omit<Tab, 'active'>>) => {
            const existingTab = state.tabs.find(t => t.id === action.payload.id);
            if (existingTab) {
                state.activeTabId = existingTab.id;
            } else {
                state.tabs.push({ ...action.payload, active: true });
                state.activeTabId = action.payload.id;
            }
        },
        removeTab: (state, action: PayloadAction<string>) => {
            state.tabs = state.tabs.filter(t => t.id !== action.payload);
            if (state.activeTabId === action.payload) {
                state.activeTabId = state.tabs.length > 0 ? state.tabs[state.tabs.length - 1].id : null;
            }
        },
        setActiveTab: (state, action: PayloadAction<string>) => {
            state.activeTabId = action.payload;
        },
    },
});

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null as string | null,
        company: null as string | null,
        token: null as string | null,
    },
    reducers: {
        setAuth: (state, action: PayloadAction<{ user: string; company: string; token: string }>) => {
            state.user = action.payload.user;
            state.company = action.payload.company;
            state.token = action.payload.token;
        },
        clearAuth: (state) => {
            state.user = null;
            state.company = null;
            state.token = null;
        }
    }
});

export const { addTab, removeTab, setActiveTab } = tabSlice.actions;
export const { setAuth, clearAuth } = authSlice.actions;

export const store = configureStore({
    reducer: {
        tabs: tabSlice.reducer,
        auth: authSlice.reducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

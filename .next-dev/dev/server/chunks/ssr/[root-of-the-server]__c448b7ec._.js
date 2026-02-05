module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/src/lib/supabase.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getSupabaseClient",
    ()=>getSupabaseClient,
    "supabase",
    ()=>supabase,
    "testSupabaseReachability",
    ()=>testSupabaseReachability
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/index.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createBrowserClient$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/createBrowserClient.js [app-ssr] (ecmascript)");
;
const supabaseUrl = ("TURBOPACK compile-time value", "https://toorbxzuursbcykjujhh.supabase.co");
const supabaseAnonKey = ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvb3JieHp1dXJzYmN5a2p1amhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2OTI0NDQsImV4cCI6MjA4MzI2ODQ0NH0.ciBMNKhEpYDQP1g-JjlP_1amlDPccc4YJbJ4LNiOwX8");
// Dev logs
if ("TURBOPACK compile-time truthy", 1) {
    console.log("SUPABASE URL", supabaseUrl);
    console.log("SUPABASE ANON", ("TURBOPACK compile-time truthy", 1) ? "present" : "TURBOPACK unreachable");
}
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
if (!supabaseUrl.startsWith("https://") || !supabaseUrl.includes(".supabase.co")) {
    throw new Error("Invalid SUPABASE URL format: " + supabaseUrl);
}
// Lazy client factory - only create when needed
let _client = null;
function getSupabaseClient() {
    if (!_client) {
        console.log('[AUTH] creating supabase client');
        _client = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createBrowserClient$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createBrowserClient"])(supabaseUrl, supabaseAnonKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: true,
                detectSessionInUrl: false
            }
        });
    }
    return _client;
}
const supabase = getSupabaseClient();
async function testSupabaseReachability(url, timeoutMs = 3000) {
    console.log('[AUTH] reachability test start', url);
    const controller = new AbortController();
    const timeoutId = setTimeout(()=>controller.abort(), timeoutMs);
    try {
        // Test the base URL instead of health endpoint since health returns 401 without auth
        const testUrl = `${url}/rest/v1/`; // This should return 401 but indicate the server is reachable
        const res = await fetch(testUrl, {
            cache: 'no-store',
            signal: controller.signal,
            method: 'HEAD' // Use HEAD to minimize data transfer
        });
        clearTimeout(timeoutId);
        console.log('[AUTH] reachability result', {
            status: res.status,
            ok: res.status < 500,
            url: testUrl
        });
        // Consider reachable if we get any response (even 401/403) - means server is alive
        const isReachable = res.status > 0 && res.status < 500;
        return {
            ok: isReachable,
            error: isReachable ? undefined : `HTTP ${res.status}`
        };
    } catch (error) {
        clearTimeout(timeoutId);
        console.warn('[AUTH] reachability warning (non-fatal)', {
            name: error.name,
            message: error.message,
            stack: error.stack?.split('\n')[0],
            url: `${url}/rest/v1/`
        });
        return {
            ok: false,
            error: `${error.name}: ${error.message}`
        };
    }
}
}),
"[project]/src/lib/authListener.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "initAuthListener",
    ()=>initAuthListener
]);
let authListenerInstance = null;
const authChannel = new BroadcastChannel('auth');
const initAuthListener = (dispatch)=>{
    // If already initialized, return the existing cleanup function
    if (authListenerInstance) {
        console.log('Auth listener already initialized, returning existing instance');
        return authListenerInstance.unsubscribe;
    }
    console.log('Initializing auth listener');
    // Listen for messages from other tabs
    authChannel.onmessage = (event)=>{
        const message = event.data;
        console.log('Received auth message from other tab:', message);
        if (message.type === 'SIGNED_OUT') {
            console.log('Other tab signed out, resetting local state');
            dispatch({
                type: 'RESET'
            });
            // Show notification to user
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
        } else if (message.type === 'AUTH_STATE_CHANGED') {
            console.log('Other tab changed auth state, updating local state');
            // Show notification to user
            if (message.email) {
                if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
                ;
            }
        }
    };
    // Store the instance to prevent duplicate registration
    authListenerInstance = {
        unsubscribe: ()=>{
            console.log('Cleaning up auth listener');
            authChannel.close();
            authListenerInstance = null;
        }
    };
    return authListenerInstance.unsubscribe;
};
}),
"[project]/src/lib/ensureProfile.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ensureProfile",
    ()=>ensureProfile
]);
function logSupabaseError(context, error) {
    if (!error) return;
    console.error(context, {
        status: error.status,
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
    });
}
async function ensureProfile(supabase, user) {
    if (!user?.id) throw new Error("ensureProfile called without user");
    // 1 fetch safely
    const { data: existing, error: fetchError } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
    if (fetchError) {
        logSupabaseError("ensureProfile fetch error", fetchError);
        throw fetchError;
    }
    if (existing) {
        console.log('ensureProfile: Found existing profile for user:', user.id);
        return existing;
    }
    console.log('ensureProfile: No existing profile found, creating for user:', user.id);
    // 2 build username fallback safely
    const email = user.email ?? "";
    const usernameFromMeta = user.user_metadata?.username;
    const usernameFallback = typeof usernameFromMeta === "string" && usernameFromMeta.trim() || (email.includes("@") ? email.split("@")[0] : "") || `user_${user.id.slice(0, 8)}`;
    // 3 upsert to avoid 409 if called twice
    const { data: created, error: upsertError } = await supabase.from("profiles").upsert({
        id: user.id,
        email: email || null,
        username: usernameFallback,
        role: "student",
        plan: "free",
        trial_started_at: new Date().toISOString(),
        trial_expires_at: new Date(Date.now() + 1 * 60 * 1000).toISOString(),
        account_locked: false
    }, {
        onConflict: "id"
    }).select("*").single();
    if (upsertError) {
        logSupabaseError("ensureProfile upsert error", upsertError);
        throw upsertError;
    }
    console.log('ensureProfile: Successfully created profile for user:', user.id);
    return created;
}
}),
"[project]/src/context/AuthContext.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuthDispatch",
    ()=>useAuthDispatch,
    "useAuthState",
    ()=>useAuthState,
    "useAuthStore",
    ()=>useAuthStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$authListener$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/authListener.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ensureProfile$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/ensureProfile.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
// Helper function to add timeout to promises
function withTimeout(promise, ms, label) {
    return Promise.race([
        promise,
        new Promise((_, reject)=>setTimeout(()=>reject(new Error(`Timeout: ${label}`)), ms))
    ]);
}
const initialState = {
    user: null,
    session: null,
    authLoading: true,
    profileLoading: false,
    error: null,
    profile: null,
    authStatus: 'checking',
    offlineRetryCount: 0
};
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(null);
const authReducer = (state, action)=>{
    switch(action.type){
        case 'SET_USER':
            return {
                ...state,
                user: action.payload
            };
        case 'SET_SESSION':
            return {
                ...state,
                session: action.payload
            };
        case 'SET_AUTH_LOADING':
            return {
                ...state,
                authLoading: action.payload
            };
        case 'SET_PROFILE_LOADING':
            return {
                ...state,
                profileLoading: action.payload
            };
        case 'SET_ERROR':
            return {
                ...state,
                error: action.payload
            };
        case 'SET_PROFILE':
            return {
                ...state,
                profile: action.payload
            };
        case 'SET_AUTH_STATUS':
            return {
                ...state,
                authStatus: action.payload
            };
        case 'INCREMENT_OFFLINE_RETRY':
            return {
                ...state,
                offlineRetryCount: state.offlineRetryCount + 1
            };
        case 'RESET_OFFLINE_RETRY':
            return {
                ...state,
                offlineRetryCount: 0
            };
        case 'RESET':
            return {
                ...initialState
            };
        default:
            return state;
    }
};
const AuthProvider = ({ children })=>{
    const [state, dispatch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useReducer"])(authReducer, initialState);
    const [hydrated, setHydrated] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const authSubscriptionRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const broadcastListenerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const handlingAuthEventRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false); // Prevent duplicate auth event handling
    const handledEventRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null); // Moved to top level
    // Offline retry management with refs
    const retryCountRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(0);
    const retryTimerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const initInFlightRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    // Hydration guard to avoid triggering effects pre-hydration
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        setHydrated(true);
    }, []);
    // Initialize auth state on mount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        // BUILD-TIME GUARD: Skip auth initialization during static build
        if ("TURBOPACK compile-time truthy", 1) {
            console.log('[AUTH] BUILD-DEBUG: Skipping auth init during build time - window undefined');
            console.log('[AUTH] BUILD-DEBUG: Setting authLoading to false for static render');
            dispatch({
                type: 'SET_AUTH_LOADING',
                payload: false
            });
            console.log('[AUTH] BUILD-DEBUG: Auth init skipped successfully');
            return;
        }
        //TURBOPACK unreachable
        ;
        let retryTimeoutId;
        let isMounted;
        const initializeAuth = undefined;
    }, [
        hydrated
    ]);
    // Load profile function that runs in background
    const loadProfile = async (user)=>{
        if (!user?.id) return;
        dispatch({
            type: 'SET_PROFILE_LOADING',
            payload: true
        });
        try {
            console.log('loadProfile start for user:', user.id);
            // Create a timeout promise
            const timeoutPromise = new Promise((_, reject)=>{
                setTimeout(()=>reject(new Error('Timeout: ensureProfile')), 10000);
            });
            // Get client for profile loading
            const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabaseClient"])();
            // Race the ensureProfile call against the timeout
            const profile = await Promise.race([
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ensureProfile$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ensureProfile"])(supabase, user),
                timeoutPromise
            ]);
            // Check if trial has expired for free users
            const isTrialExpired = profile?.plan === 'free' && profile?.trial_expires_at && new Date(profile.trial_expires_at) < new Date();
            // Update profile with trial status
            const updatedProfile = {
                ...profile,
                isTrialExpired,
                account_locked: profile?.account_locked || isTrialExpired
            };
            dispatch({
                type: 'SET_PROFILE',
                payload: updatedProfile
            });
            // Update user with profile info
            const userWithProfile = {
                ...user,
                role: updatedProfile?.role,
                plan: updatedProfile?.plan,
                username: updatedProfile?.username,
                isTrialExpired: updatedProfile?.isTrialExpired,
                account_locked: updatedProfile?.account_locked
            };
            dispatch({
                type: 'SET_USER',
                payload: userWithProfile
            });
            console.log('loadProfile end for user:', user.id);
        } catch (error) {
            console.error('loadProfile error:', error);
            // Still update user even if profile failed
            dispatch({
                type: 'SET_ERROR',
                payload: error.message
            });
        } finally{
            dispatch({
                type: 'SET_PROFILE_LOADING',
                payload: false
            });
        }
    };
    // Initialize broadcast listener for cross-tab communication
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        let isMounted = true;
        broadcastListenerRef.current = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$authListener$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["initAuthListener"])(dispatch);
        // Listen for auth state changes
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabaseClient"])();
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session)=>{
            if (!isMounted) return;
            console.log('[AUTH] listener event', {
                type: event,
                userId: session?.user?.id,
                timestamp: new Date().toISOString()
            });
            // Guard duplicate events using a ref
            const currentUserId = session?.user?.id;
            const now = Date.now();
            // ignore duplicate SIGNED_IN fired within 500ms for same userId
            if (handledEventRef.current && handledEventRef.current.type === event && handledEventRef.current.userId === currentUserId && now - handledEventRef.current.ts < 500) {
                console.log('AuthProvider: Duplicate event detected, skipping');
                return;
            }
            // Prevent duplicate event handling
            if (handlingAuthEventRef.current) {
                console.log('AuthProvider: Auth event already being handled, skipping duplicate');
                return;
            }
            handlingAuthEventRef.current = true;
            handledEventRef.current = {
                type: event,
                userId: currentUserId,
                ts: now
            };
            try {
                switch(event){
                    case 'INITIAL_SESSION':
                        console.log('AuthProvider: Handling INITIAL_SESSION event');
                        if (session) {
                            dispatch({
                                type: 'SET_USER',
                                payload: session.user
                            });
                            dispatch({
                                type: 'SET_SESSION',
                                payload: session
                            });
                            // Kick off profile load in background
                            console.log('AuthProvider: Kicking off profile load in background for INITIAL_SESSION');
                            void loadProfile(session.user);
                            dispatch({
                                type: 'SET_AUTH_LOADING',
                                payload: false
                            });
                        }
                        break;
                    case 'SIGNED_IN':
                        console.log('AuthProvider: Handling SIGNED_IN event for user:', session?.user?.id);
                        if (session?.user) {
                            dispatch({
                                type: 'SET_USER',
                                payload: session.user
                            });
                            dispatch({
                                type: 'SET_SESSION',
                                payload: session
                            });
                            // Kick off profile load in background
                            console.log('AuthProvider: Kicking off profile load in background for SIGNED_IN');
                            void loadProfile(session.user);
                            dispatch({
                                type: 'SET_AUTH_LOADING',
                                payload: false
                            });
                        }
                        break;
                    case 'SIGNED_OUT':
                        console.log('AuthProvider: Handling SIGNED_OUT event');
                        dispatch({
                            type: 'RESET'
                        });
                        dispatch({
                            type: 'SET_AUTH_LOADING',
                            payload: false
                        });
                        // Reset the handling flag
                        handlingAuthEventRef.current = false;
                        break;
                    case 'TOKEN_REFRESHED':
                        console.log('AuthProvider: Handling TOKEN_REFRESHED event');
                        if (session) {
                            dispatch({
                                type: 'SET_SESSION',
                                payload: session
                            });
                        }
                        break;
                    case 'USER_UPDATED':
                        console.log('AuthProvider: Handling USER_UPDATED event');
                        if (session?.user) {
                            dispatch({
                                type: 'SET_USER',
                                payload: session.user
                            });
                            // Kick off profile load in background
                            console.log('AuthProvider: Kicking off profile load in background for USER_UPDATED');
                            void loadProfile(session.user);
                        }
                        break;
                    default:
                        console.log('AuthProvider: Unhandled auth event:', event);
                }
            } catch (error) {
                console.error('AuthProvider: Error in auth state change handler:', error);
                dispatch({
                    type: 'SET_ERROR',
                    payload: error.message
                });
            } finally{
                // Always reset the handling flag
                handlingAuthEventRef.current = false;
            }
        });
        authSubscriptionRef.current = subscription;
        // Clean up on unmount
        return ()=>{
            isMounted = false;
            initInFlightRef.current = false;
            // Clear any pending retry timeouts
            if (retryTimerRef.current) {
                clearTimeout(retryTimerRef.current);
                retryTimerRef.current = null;
                console.log('[AUTH] cleanup: cleared retry timer');
            }
            console.log('[AUTH] cleaning up auth subscription');
            if (authSubscriptionRef.current) {
                authSubscriptionRef.current.unsubscribe?.();
                authSubscriptionRef.current = null;
            }
            // Clean up broadcast listener
            if (broadcastListenerRef.current) {
                broadcastListenerRef.current();
                broadcastListenerRef.current = null;
            }
            // Reset retry count on unmount
            retryCountRef.current = 0;
            console.log('[AUTH] cleanup: reset retry count');
        };
    }, []);
    // Ensure the JSX return is inside the component function scope
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: {
            state,
            dispatch
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/context/AuthContext.tsx",
        lineNumber: 463,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
};
const useAuthStore = ()=>{
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
    if (context === null) {
        throw new Error('useAuthStore must be used within an AuthProvider');
    }
    return context;
};
const useAuthState = ()=>{
    const { state } = useAuthStore();
    return state;
};
const useAuthDispatch = ()=>{
    const { dispatch } = useAuthStore();
    return dispatch;
};
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__c448b7ec._.js.map
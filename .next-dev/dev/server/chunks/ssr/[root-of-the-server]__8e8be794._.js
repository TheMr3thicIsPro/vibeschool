module.exports = [
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[project]/src/components/LoadingBar.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
'use client';
;
const LoadingBar = ({ duration = 3000, className = '', showPercentage = true })=>{
    const [progress, setProgress] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const interval = setInterval(()=>{
            setProgress((prev)=>{
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + 1;
            });
        }, duration / 100);
        return ()=>clearInterval(interval);
    }, [
        duration
    ]);
    const containerClass = 'w-full ' + className;
    const progressWidth = progress + '%';
    return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement('div', {
        className: containerClass
    }, showPercentage && /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement('div', {
        className: 'flex justify-between items-center mb-2'
    }, /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement('span', {
        className: 'text-sm font-medium text-gray-300'
    }, 'Loading...'), /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement('span', {
        className: 'text-sm font-medium text-accent-primary'
    }, progress + '%')), /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement('div', {
        className: 'w-full bg-gray-800 rounded-full h-2.5'
    }, /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement('div', {
        className: 'bg-gradient-to-r from-accent-primary to-purple-600 h-2.5 rounded-full transition-all duration-100 ease-out',
        style: {
            width: progressWidth
        }
    })), progress >= 100 && /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createElement('div', {
        className: 'mt-2 text-center text-sm text-green-400 animate-pulse'
    }, 'Complete!'));
};
const __TURBOPACK__default__export__ = LoadingBar;
}),
"[project]/src/components/SkeletonLoader.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$LoadingBar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/LoadingBar.tsx [app-ssr] (ecmascript)");
;
;
const SkeletonLoader = ({ className = '', count = 1, showLoadingBar = false, loadingDuration = 3000 })=>{
    const skeletons = Array.from({
        length: count
    }, (_, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: `animate-pulse bg-gray-700 rounded ${className}`
        }, index, false, {
            fileName: "[project]/src/components/SkeletonLoader.tsx",
            lineNumber: 18,
            columnNumber: 5
        }, ("TURBOPACK compile-time value", void 0)));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            showLoadingBar && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-6",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$LoadingBar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    duration: loadingDuration
                }, void 0, false, {
                    fileName: "[project]/src/components/SkeletonLoader.tsx",
                    lineNumber: 28,
                    columnNumber: 11
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/src/components/SkeletonLoader.tsx",
                lineNumber: 27,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0)),
            skeletons
        ]
    }, void 0, true);
};
const __TURBOPACK__default__export__ = SkeletonLoader;
}),
"[project]/src/components/GeneralLoadingOverlay.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$LoadingBar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/LoadingBar.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$SkeletonLoader$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/SkeletonLoader.tsx [app-ssr] (ecmascript)");
'use client';
;
;
;
const GeneralLoadingOverlay = ({ className = '', loadingText = 'Loading...', showLoadingBar = true, showSkeletons = true, skeletonCount = 5, duration = 5000 })=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `relative ${className}`,
        children: [
            showLoadingBar && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed top-0 left-0 right-0 z-50 pt-2 px-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$LoadingBar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    duration: duration,
                    showPercentage: false
                }, void 0, false, {
                    fileName: "[project]/src/components/GeneralLoadingOverlay.tsx",
                    lineNumber: 29,
                    columnNumber: 11
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/src/components/GeneralLoadingOverlay.tsx",
                lineNumber: 28,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0)),
            showSkeletons && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "container mx-auto px-4 py-8",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-8 text-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$SkeletonLoader$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                className: "h-8 w-64 mb-4 mx-auto"
                            }, void 0, false, {
                                fileName: "[project]/src/components/GeneralLoadingOverlay.tsx",
                                lineNumber: 37,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$SkeletonLoader$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                className: "h-4 w-48 mx-auto"
                            }, void 0, false, {
                                fileName: "[project]/src/components/GeneralLoadingOverlay.tsx",
                                lineNumber: 38,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/GeneralLoadingOverlay.tsx",
                        lineNumber: 36,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-6",
                        children: Array.from({
                            length: skeletonCount
                        }).map((_, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "card p-6 border border-card-border",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-between mb-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$SkeletonLoader$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                className: "h-6 w-32"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/GeneralLoadingOverlay.tsx",
                                                lineNumber: 45,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$SkeletonLoader$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                className: "h-4 w-16"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/GeneralLoadingOverlay.tsx",
                                                lineNumber: 46,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/GeneralLoadingOverlay.tsx",
                                        lineNumber: 44,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$SkeletonLoader$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                className: "h-4 w-full"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/GeneralLoadingOverlay.tsx",
                                                lineNumber: 50,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$SkeletonLoader$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                className: "h-4 w-5/6"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/GeneralLoadingOverlay.tsx",
                                                lineNumber: 51,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$SkeletonLoader$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                className: "h-4 w-4/6"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/GeneralLoadingOverlay.tsx",
                                                lineNumber: 52,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex gap-3 mt-4",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$SkeletonLoader$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                        className: "h-10 w-24 rounded-lg"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/GeneralLoadingOverlay.tsx",
                                                        lineNumber: 55,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$SkeletonLoader$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                        className: "h-10 w-24 rounded-lg"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/GeneralLoadingOverlay.tsx",
                                                        lineNumber: 56,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/GeneralLoadingOverlay.tsx",
                                                lineNumber: 54,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/GeneralLoadingOverlay.tsx",
                                        lineNumber: 49,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, index, true, {
                                fileName: "[project]/src/components/GeneralLoadingOverlay.tsx",
                                lineNumber: 43,
                                columnNumber: 15
                            }, ("TURBOPACK compile-time value", void 0)))
                    }, void 0, false, {
                        fileName: "[project]/src/components/GeneralLoadingOverlay.tsx",
                        lineNumber: 41,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/GeneralLoadingOverlay.tsx",
                lineNumber: 35,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/GeneralLoadingOverlay.tsx",
        lineNumber: 25,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
const __TURBOPACK__default__export__ = GeneralLoadingOverlay;
}),
"[project]/src/components/auth/ProtectedRoute.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/AuthContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$GeneralLoadingOverlay$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/GeneralLoadingOverlay.tsx [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
const ProtectedRoute = ({ children })=>{
    // Hydration guard: ensure first client render matches SSR to avoid mismatch
    const [hydrated, setHydrated] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        setHydrated(true);
    }, []);
    const { state } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuthStore"])();
    const { user, authLoading } = state;
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (hydrated && !authLoading && !user) {
            router.push('/auth/login');
        }
    }, [
        hydrated,
        user,
        authLoading,
        router
    ]);
    // Until hydrated, render children to match SSR output
    if (!hydrated) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
            children: children
        }, void 0, false);
    }
    if (authLoading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen bg-background flex items-center justify-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$GeneralLoadingOverlay$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                loadingText: "Checking authentication status..."
            }, void 0, false, {
                fileName: "[project]/src/components/auth/ProtectedRoute.tsx",
                lineNumber: 37,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/src/components/auth/ProtectedRoute.tsx",
            lineNumber: 36,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0));
    }
    if (!user) {
        return null; // Redirect happens in useEffect
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: children
    }, void 0, false);
};
const __TURBOPACK__default__export__ = ProtectedRoute;
}),
"[project]/src/lib/utils.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cn",
    ()=>cn
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/clsx/dist/clsx.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-ssr] (ecmascript)");
;
;
function cn(...inputs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
}),
"[project]/src/components/layout/Sidebar.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$house$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Home$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/house.js [app-ssr] (ecmascript) <export default as Home>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpen$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/book-open.js [app-ssr] (ecmascript) <export default as BookOpen>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/message-circle.js [app-ssr] (ecmascript) <export default as MessageCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/user.js [app-ssr] (ecmascript) <export default as User>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
const Sidebar = ()=>{
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePathname"])();
    const navItems = [
        {
            href: '/dashboard',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$house$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Home$3e$__["Home"],
            label: 'Home'
        },
        {
            href: '/courses',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpen$3e$__["BookOpen"],
            label: 'Courses'
        },
        {
            href: '/social',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageCircle$3e$__["MessageCircle"],
            label: 'Social'
        },
        {
            href: '/profile',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__["User"],
            label: 'Profile'
        }
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "w-16 bg-sidebar-bg flex flex-col items-center py-4 space-y-6",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex-1 flex flex-col items-center space-y-6",
            children: navItems.map((item)=>{
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    href: item.href,
                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('p-2 rounded-lg transition-all duration-200 flex items-center justify-center hover-lift', 'text-gray-400 hover:text-accent-primary hover:bg-gray-800', isActive ? 'text-accent-primary bg-gray-800 active-glow' : 'hover:glow-button'),
                    title: item.label,
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                        size: 24
                    }, void 0, false, {
                        fileName: "[project]/src/components/layout/Sidebar.tsx",
                        lineNumber: 54,
                        columnNumber: 15
                    }, ("TURBOPACK compile-time value", void 0))
                }, item.href, false, {
                    fileName: "[project]/src/components/layout/Sidebar.tsx",
                    lineNumber: 42,
                    columnNumber: 13
                }, ("TURBOPACK compile-time value", void 0));
            })
        }, void 0, false, {
            fileName: "[project]/src/components/layout/Sidebar.tsx",
            lineNumber: 36,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/src/components/layout/Sidebar.tsx",
        lineNumber: 35,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
const __TURBOPACK__default__export__ = Sidebar;
}),
"[project]/src/components/TrialTimer.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/AuthContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/clock.js [app-ssr] (ecmascript) <export default as Clock>");
'use client';
;
;
;
;
const TrialTimer = ()=>{
    const { state } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuthStore"])();
    const user = state.user;
    const profile = state.profile;
    const [timeLeft, setTimeLeft] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [isExpiringSoon, setIsExpiringSoon] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!user || !profile?.trial_expires_at || profile.plan !== 'free') {
            return;
        }
        const calculateTimeLeft = ()=>{
            const expiryDate = new Date(profile.trial_expires_at);
            const now = new Date();
            const difference = expiryDate.getTime() - now.getTime();
            if (difference <= 0) {
                setTimeLeft('Trial Expired');
                setIsExpiringSoon(true);
                return;
            }
            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor(difference % (1000 * 60 * 60 * 24) / (1000 * 60 * 60));
            const minutes = Math.floor(difference % (1000 * 60 * 60) / (1000 * 60));
            const seconds = Math.floor(difference % (1000 * 60) / 1000);
            if (days === 0 && hours === 0 && minutes < 5) {
                setIsExpiringSoon(true);
            } else {
                setIsExpiringSoon(false);
            }
            let timeString = '';
            if (days > 0) {
                timeString += `${days}d `;
            }
            if (hours > 0) {
                timeString += `${hours}h `;
            }
            if (minutes > 0) {
                timeString += `${minutes}m `;
            }
            timeString += `${seconds}s`;
            setTimeLeft(timeString);
        };
        // Calculate immediately
        calculateTimeLeft();
        // Update every second
        const interval = setInterval(calculateTimeLeft, 1000);
        return ()=>clearInterval(interval);
    }, [
        user,
        profile
    ]);
    if (!user || !profile?.trial_expires_at || profile.plan !== 'free') {
        return null;
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${isExpiringSoon ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"], {
                size: 16
            }, void 0, false, {
                fileName: "[project]/src/components/TrialTimer.tsx",
                lineNumber: 76,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                children: [
                    "Trial: ",
                    timeLeft
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/TrialTimer.tsx",
                lineNumber: 77,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/TrialTimer.tsx",
        lineNumber: 71,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
const __TURBOPACK__default__export__ = TrialTimer;
}),
"[project]/src/components/layout/AppShell.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/AuthContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$Sidebar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/layout/Sidebar.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$TrialTimer$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/TrialTimer.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$menu$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Menu$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/menu.js [app-ssr] (ecmascript) <export default as Menu>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
;
const AppShell = ({ children })=>{
    // Hydration guard: ensure first client render matches SSR to avoid mismatch
    // NOTE: SSR build-time guard removed to preserve consistent hook order across renders.
    const [hydrated, setHydrated] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        setHydrated(true);
    }, []);
    // IMPORTANT: Call hooks unconditionally on every render to maintain consistent order
    const { state } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuthStore"])();
    const user = state.user;
    const authLoading = state.authLoading;
    const profile = state.profile;
    const [sidebarOpen, setSidebarOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    // Until hydrated, render SSR-equivalent wrapper
    if (!hydrated) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen bg-background",
            children: children
        }, void 0, false, {
            fileName: "[project]/src/components/layout/AppShell.tsx",
            lineNumber: 32,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0));
    }
    // Show sidebar only when user is authenticated
    if (authLoading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen bg-background flex items-center justify-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-2xl font-bold text-accent-primary",
                children: "Loading..."
            }, void 0, false, {
                fileName: "[project]/src/components/layout/AppShell.tsx",
                lineNumber: 42,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/src/components/layout/AppShell.tsx",
            lineNumber: 41,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0));
    }
    if (!user) {
        // For non-authenticated users, just render children without sidebar
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            children: children
        }, void 0, false, {
            fileName: "[project]/src/components/layout/AppShell.tsx",
            lineNumber: 49,
            columnNumber: 12
        }, ("TURBOPACK compile-time value", void 0));
    }
    // Check if account is locked due to expired trial
    if (user.account_locked) {
        const trialExpiredAt = profile?.trial_expires_at ? new Date(profile.trial_expires_at) : null;
        const formattedExpiration = trialExpiredAt ? trialExpiredAt.toLocaleString() : 'Unknown';
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen bg-background flex items-center justify-center p-4",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "max-w-md w-full bg-card rounded-xl shadow-lg p-6 text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-2xl font-bold text-red-500 mb-4",
                        children: "Account Locked"
                    }, void 0, false, {
                        fileName: "[project]/src/components/layout/AppShell.tsx",
                        lineNumber: 60,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-foreground mb-4",
                        children: [
                            "Your free trial expired on ",
                            formattedExpiration,
                            ". Please upgrade to a membership to continue accessing the platform."
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/layout/AppShell.tsx",
                        lineNumber: 61,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-6 p-3 bg-red-500/10 rounded-lg border border-red-500/20",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm text-red-400",
                            children: [
                                "Trial Duration: 5 minutes • Expired: ",
                                formattedExpiration
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/layout/AppShell.tsx",
                            lineNumber: 65,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/src/components/layout/AppShell.tsx",
                        lineNumber: 64,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                        href: "/payments",
                        className: "px-6 py-3 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors font-medium inline-block",
                        children: "Upgrade to Member"
                    }, void 0, false, {
                        fileName: "[project]/src/components/layout/AppShell.tsx",
                        lineNumber: 69,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/layout/AppShell.tsx",
                lineNumber: 59,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/src/components/layout/AppShell.tsx",
            lineNumber: 58,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0));
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex h-screen bg-background text-foreground overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "md:hidden absolute top-4 left-4 z-50",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: ()=>setSidebarOpen(!sidebarOpen),
                    className: "p-2 rounded-lg bg-sidebar-bg text-accent-primary hover:glow-button hover-lift",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$menu$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Menu$3e$__["Menu"], {
                        size: 24
                    }, void 0, false, {
                        fileName: "[project]/src/components/layout/AppShell.tsx",
                        lineNumber: 88,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0))
                }, void 0, false, {
                    fileName: "[project]/src/components/layout/AppShell.tsx",
                    lineNumber: 84,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/src/components/layout/AppShell.tsx",
                lineNumber: 83,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("h-full transition-all duration-300 ease-in-out", sidebarOpen ? "block" : "hidden md:block", "md:block md:translate-x-0"),
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$Sidebar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                    fileName: "[project]/src/components/layout/AppShell.tsx",
                    lineNumber: 100,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/src/components/layout/AppShell.tsx",
                lineNumber: 93,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed top-0 right-0 z-40 p-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$TrialTimer$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                    fileName: "[project]/src/components/layout/AppShell.tsx",
                    lineNumber: 105,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/src/components/layout/AppShell.tsx",
                lineNumber: 104,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: "flex-1 h-full overflow-auto md:ml-0 transition-all duration-300",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "h-full",
                    children: children
                }, void 0, false, {
                    fileName: "[project]/src/components/layout/AppShell.tsx",
                    lineNumber: 110,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/src/components/layout/AppShell.tsx",
                lineNumber: 109,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/layout/AppShell.tsx",
        lineNumber: 81,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
const __TURBOPACK__default__export__ = AppShell;
}),
"[project]/src/services/courseService.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "checkLessonAccess",
    ()=>checkLessonAccess,
    "getAllCourses",
    ()=>getAllCourses,
    "getCourseById",
    ()=>getCourseById,
    "getLatestAnnouncements",
    ()=>getLatestAnnouncements,
    "getLessonById",
    ()=>getLessonById,
    "getModulesByCourse",
    ()=>getModulesByCourse,
    "getPublishedCourses",
    ()=>getPublishedCourses,
    "getUserCourseProgress",
    ()=>getUserCourseProgress,
    "getUserLessonProgress",
    ()=>getUserLessonProgress,
    "getUserProfile",
    ()=>getUserProfile,
    "updateUserLessonProgress",
    ()=>updateUserLessonProgress
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase.ts [app-ssr] (ecmascript)");
;
const getPublishedCourses = async (userId)=>{
    console.log('getPublishedCourses: Fetching published courses for user:', userId);
    let query = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('courses').select(`
      id,
      title,
      description,
      thumbnail_url,
      is_published,
      created_at,
      modules (
        id,
        title,
        order_index,
        lessons (
          id,
          title,
          order_index,
          is_preview,
          is_published
        )
      )
    `).eq('is_published', true).order('order_index', {
        foreignTable: 'modules'
    }).order('order_index', {
        foreignTable: 'modules.lessons'
    });
    if (userId) {
        // Add user progress to the query
        query = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].rpc('get_courses_with_progress', {
            user_id: userId
        });
    } else {
        // For non-logged in users, just get courses without progress
        query = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('courses').select(`
        id,
        title,
        description,
        thumbnail_url,
        is_published,
        created_at,
        modules (
          id,
          title,
          order_index,
          lessons (
            id,
            title,
            order_index,
            is_preview,
            is_published
          )
        )
      `).eq('is_published', true).order('order_index', {
            foreignTable: 'modules'
        }).order('order_index', {
            foreignTable: 'modules.lessons'
        });
    }
    const { data, error } = await query;
    console.log('getPublishedCourses: Result', {
        data,
        error
    });
    if (error) {
        console.error('getPublishedCourses: Error fetching courses:', error);
        throw error;
    }
    return data || [];
};
const getCourseById = async (courseId, userId)=>{
    console.log('getCourseById: Fetching course:', courseId, 'for user:', userId);
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('courses').select(`
      id,
      title,
      description,
      thumbnail_url,
      is_published,
      created_at,
      modules (
        id,
        title,
        order_index,
        lessons (
          id,
          title,
          description,
          order_index,
          video_provider,
          video_url,
          youtube_video_id,
          is_preview,
          is_published
        )
      )
    `).eq('id', courseId).eq('is_published', true).single();
    console.log('getCourseById: Result', {
        data,
        error
    });
    if (error) {
        console.error('getCourseById: Error fetching course:', error);
        throw error;
    }
    // If user is logged in, get their progress for this course
    if (userId && data) {
        const progress = await getUserCourseProgress(userId, courseId);
        return {
            ...data,
            progress
        };
    }
    return data;
};
const getUserCourseProgress = async (userId, courseId)=>{
    console.log('getUserCourseProgress: Fetching progress for user:', userId, 'course:', courseId);
    // First, get all module IDs for this course
    const { data: modulesData, error: modulesError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('modules').select('id').eq('course_id', courseId);
    if (modulesError) {
        console.error('getUserCourseProgress: Error fetching module IDs:', modulesError);
        throw modulesError;
    }
    if (!modulesData || modulesData.length === 0) {
        console.log('getUserCourseProgress: No modules found for course');
        return [];
    }
    const moduleIds = modulesData.map((module)=>module.id);
    // Then get all lesson IDs for those modules
    const { data: lessonsData, error: lessonsError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('lessons').select('id').in('module_id', moduleIds);
    if (lessonsError) {
        console.error('getUserCourseProgress: Error fetching lesson IDs:', lessonsError);
        throw lessonsError;
    }
    if (!lessonsData || lessonsData.length === 0) {
        console.log('getUserCourseProgress: No lessons found for course');
        return [];
    }
    const lessonIds = lessonsData.map((lesson)=>lesson.id);
    // Then get progress for those lessons
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('user_lesson_progress').select(`
      lesson_id,
      completed,
      completed_at,
      last_position_seconds
    `).eq('user_id', userId).in('lesson_id', lessonIds);
    console.log('getUserCourseProgress: Result', {
        data,
        error
    });
    if (error) {
        console.error('getUserCourseProgress: Error fetching progress:', error);
        throw error;
    }
    return data || [];
};
const getLessonById = async (lessonId)=>{
    console.log('getLessonById: Fetching lesson:', lessonId);
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('lessons').select(`
      id,
      title,
      description,
      video_provider,
      video_url,
      youtube_video_id,
      is_preview,
      is_published,
      module_id,
      modules (
        id,
        title,
        course_id,
        courses (
          id,
          title
        )
      )
    `).eq('id', lessonId).eq('is_published', true).single();
    console.log('getLessonById: Result', {
        data,
        error
    });
    if (error) {
        console.error('getLessonById: Error fetching lesson:', error);
        throw error;
    }
    return data;
};
const getUserLessonProgress = async (userId, lessonId)=>{
    console.log('getUserLessonProgress: Fetching progress for user:', userId, 'lesson:', lessonId);
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('user_lesson_progress').select('completed, completed_at, last_position_seconds').eq('user_id', userId).eq('lesson_id', lessonId).single();
    console.log('getUserLessonProgress: Result', {
        data,
        error
    });
    if (error && error.code !== 'PGRST116') {
        console.error('getUserLessonProgress: Error fetching progress:', error);
        throw error;
    }
    return data || {
        completed: false,
        completed_at: null,
        last_position_seconds: 0
    };
};
const updateUserLessonProgress = async (userId, lessonId, progressData)=>{
    console.log('updateUserLessonProgress: Updating progress for user:', userId, 'lesson:', lessonId, 'data:', progressData);
    // Use upsert to create or update the progress record
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('user_lesson_progress').upsert({
        user_id: userId,
        lesson_id: lessonId,
        ...progressData,
        updated_at: new Date().toISOString()
    }, {
        onConflict: 'user_id,lesson_id'
    }).select().single();
    console.log('updateUserLessonProgress: Result', {
        data,
        error
    });
    if (error) {
        console.error('updateUserLessonProgress: Error updating progress:', error);
        throw error;
    }
    return data;
};
const getLatestAnnouncements = async (limit = 10)=>{
    console.log('getLatestAnnouncements: Fetching latest announcements, limit:', limit);
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('announcements').select('id, title, body, created_at').order('created_at', {
        ascending: false
    }).limit(limit);
    console.log('getLatestAnnouncements: Result', {
        data,
        error
    });
    if (error) {
        console.error('getLatestAnnouncements: Error fetching announcements:', error);
        throw error;
    }
    return data || [];
};
const getUserProfile = async (userId)=>{
    console.log('getUserProfile: Fetching profile for user:', userId);
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('profiles').select('id, username, full_name, role, plan, created_at, trial_started_at, trial_expires_at, account_locked').eq('id', userId).maybeSingle(); // Use maybeSingle to handle cases where profile doesn't exist yet
    console.log('getUserProfile: Result', {
        data,
        error
    });
    if (error) {
        console.error('getUserProfile: Error fetching profile:', error);
        throw error;
    }
    // Return null if no profile exists
    if (!data) {
        console.log('getUserProfile: No profile found for user:', userId);
        return null;
    }
    return data;
};
const getAllCourses = async ()=>{
    console.log('getAllCourses: Fetching all courses');
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('courses').select(`
      id,
      title,
      description,
      thumbnail_url,
      is_published,
      created_at,
      updated_at
    `).order('created_at', {
        ascending: false
    });
    console.log('getAllCourses: Result', {
        data,
        error
    });
    if (error) {
        console.error('getAllCourses: Error fetching courses:', error);
        throw error;
    }
    return data || [];
};
const getModulesByCourse = async (courseId)=>{
    console.log('getModulesByCourse: Fetching modules for course:', courseId);
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('modules').select(`
      id,
      title,
      description,
      order_index,
      lessons (
        id,
        title,
        description,
        order_index,
        is_preview,
        is_published
      )
    `).eq('course_id', courseId).order('order_index');
    console.log('getModulesByCourse: Result', {
        data,
        error
    });
    if (error) {
        console.error('getModulesByCourse: Error fetching modules:', error);
        throw error;
    }
    return data || [];
};
const checkLessonAccess = async (userId, lessonId)=>{
    console.log('checkLessonAccess: Checking access for user:', userId, 'lesson:', lessonId);
    // First, get the lesson to check if it's a preview
    const lesson = await getLessonById(lessonId);
    // If it's a preview lesson, everyone can access it
    if (lesson.is_preview) {
        console.log('checkLessonAccess: Lesson is preview, access granted');
        return {
            hasAccess: true,
            isPreview: true
        };
    }
    // Check if user is a member or has a valid trial
    const profile = await getUserProfile(userId);
    // If no profile exists, user doesn't have access
    if (!profile) {
        console.log('checkLessonAccess: No profile found for user, denying access');
        return {
            hasAccess: false,
            isPreview: false
        };
    }
    // Check if trial has expired for free users
    let hasAccess = false;
    if (profile.plan === 'member') {
        hasAccess = true;
    } else if (profile.plan === 'free' && profile.trial_expires_at) {
        const trialExpiresAt = new Date(profile.trial_expires_at);
        const now = new Date();
        hasAccess = now < trialExpiresAt;
    }
    console.log('checkLessonAccess: Trial/membership access check result:', {
        hasAccess,
        plan: profile.plan,
        trialExpiresAt: profile.trial_expires_at
    });
    return {
        hasAccess,
        isPreview: false
    };
};
}),
"[project]/src/services/courseNavigationService.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "checkLessonAccess",
    ()=>checkLessonAccess,
    "getContinueLearningItems",
    ()=>getContinueLearningItems,
    "getCourse",
    ()=>getCourse,
    "getCourseProgress",
    ()=>getCourseProgress,
    "getNextLesson",
    ()=>getNextLesson,
    "getResumeLesson",
    ()=>getResumeLesson,
    "getUserLessonProgress",
    ()=>getUserLessonProgress,
    "listCourses",
    ()=>listCourses,
    "listCoursesSafe",
    ()=>listCoursesSafe,
    "markLessonCompleted",
    ()=>markLessonCompleted,
    "updateUserLessonProgress",
    ()=>updateUserLessonProgress
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase.ts [app-ssr] (ecmascript)");
;
const listCourses = async ()=>{
    console.log('listCourses: Fetching published courses');
    // First, get courses
    const { data: coursesData, error: coursesError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('courses').select('id, title, description, thumbnail_url, is_published, created_at').eq('is_published', true).order('created_at', {
        ascending: false
    });
    if (coursesError) {
        console.error('listCourses: Error fetching courses:', coursesError);
        console.error("Supabase error", {
            message: coursesError?.message,
            details: coursesError?.details,
            hint: coursesError?.hint,
            code: coursesError?.code
        });
        throw coursesError;
    }
    // If no courses, return empty array
    if (!coursesData || coursesData.length === 0) {
        console.log('listCourses: No courses found');
        return [];
    }
    // Get modules for all courses
    const courseIds = coursesData.map((course)=>course.id);
    const { data: modulesData, error: modulesError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('modules').select('id, course_id, title, order_index').in('course_id', courseIds).order('order_index', {
        ascending: true
    });
    if (modulesError) {
        console.error('listCourses: Error fetching modules:', modulesError);
        console.error("Supabase error", {
            message: modulesError?.message,
            details: modulesError?.details,
            hint: modulesError?.hint,
            code: modulesError?.code
        });
        throw modulesError;
    }
    // Group modules by course
    const modulesByCourse = {};
    if (modulesData) {
        for (const module of modulesData){
            if (!modulesByCourse[module.course_id]) {
                modulesByCourse[module.course_id] = [];
            }
            modulesByCourse[module.course_id].push(module);
        }
    }
    // Get lessons for all modules
    const moduleIds = modulesData?.map((module)=>module.id) || [];
    let lessonsData = [];
    if (moduleIds.length > 0) {
        const { data: lessonsRes, error: lessonsError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('lessons').select('id, module_id, title, description, order_index, video_provider, video_url, youtube_video_id, is_preview, is_published, created_at').in('module_id', moduleIds).order('order_index', {
            ascending: true
        });
        if (lessonsError) {
            console.error('listCourses: Error fetching lessons:', lessonsError);
            console.error("Supabase error", {
                message: lessonsError?.message,
                details: lessonsError?.details,
                hint: lessonsError?.hint,
                code: lessonsError?.code
            });
            // Log a concise error message to prevent infinite loops
            console.warn('Warning: Failed to fetch lessons, continuing with empty lessons array');
            // Return empty array instead of throwing to prevent cascading errors
            lessonsData = [];
            // Optionally re-throw for calling code to handle appropriately
            throw lessonsError;
        }
        lessonsData = lessonsRes || [];
    }
    // Group lessons by module
    const lessonsByModule = {};
    for (const lesson of lessonsData){
        if (!lessonsByModule[lesson.module_id]) {
            lessonsByModule[lesson.module_id] = [];
        }
        lessonsByModule[lesson.module_id].push(lesson);
    }
    // Combine everything
    const result = coursesData.map((course)=>({
            ...course,
            modules: modulesByCourse[course.id] ? modulesByCourse[course.id].map((module)=>({
                    ...module,
                    lessons: lessonsByModule[module.id] || []
                })) : []
        }));
    console.log('listCourses: Final result', {
        count: result.length
    });
    return result;
};
const getCourse = async (courseId, userId)=>{
    console.log('getCourse: Fetching course:', courseId, 'for user:', userId);
    // Get the course
    const { data: courseData, error: courseError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('courses').select('id, title, description, thumbnail_url, is_published, created_at').eq('id', courseId).eq('is_published', true).single();
    if (courseError) {
        console.error('getCourse: Error fetching course:', courseError);
        console.error("Supabase error", {
            message: courseError?.message,
            details: courseError?.details,
            hint: courseError?.hint,
            code: courseError?.code
        });
        throw courseError;
    }
    if (!courseData) {
        throw new Error('Course not found');
    }
    // Get modules for this course
    const { data: modulesData, error: modulesError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('modules').select('id, course_id, title, order_index').eq('course_id', courseId).order('order_index', {
        ascending: true
    });
    if (modulesError) {
        console.error('getCourse: Error fetching modules:', modulesError);
        console.error("Supabase error", {
            message: modulesError?.message,
            details: modulesError?.details,
            hint: modulesError?.hint,
            code: modulesError?.code
        });
        throw modulesError;
    }
    // Get lessons for all modules in this course
    const moduleIds = modulesData?.map((module)=>module.id) || [];
    let lessonsData = [];
    if (moduleIds.length > 0) {
        const { data: lessonsRes, error: lessonsError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('lessons').select('id, module_id, title, description, order_index, video_provider, video_url, youtube_video_id, is_preview, is_published, created_at').in('module_id', moduleIds).order('order_index', {
            ascending: true
        });
        if (lessonsError) {
            console.error('getCourse: Error fetching lessons:', lessonsError);
            console.error("Supabase error", {
                message: lessonsError?.message,
                details: lessonsError?.details,
                hint: lessonsError?.hint,
                code: lessonsError?.code
            });
            // Log a concise error message to prevent infinite loops
            console.warn('Warning: Failed to fetch lessons, continuing with empty lessons array');
            // Return empty array instead of throwing to prevent cascading errors
            lessonsData = [];
            // Re-throw for calling code to handle appropriately
            throw lessonsError;
        }
        lessonsData = lessonsRes || [];
    }
    // Group lessons by module
    const lessonsByModule = {};
    for (const lesson of lessonsData){
        if (!lessonsByModule[lesson.module_id]) {
            lessonsByModule[lesson.module_id] = [];
        }
        lessonsByModule[lesson.module_id].push(lesson);
    }
    // Combine everything
    const result = {
        ...courseData,
        modules: modulesData?.map((module)=>({
                ...module,
                lessons: lessonsByModule[module.id] || []
            })) || []
    };
    console.log('getCourse: Result', {
        course: result.id,
        modules: result.modules.length
    });
    // Add progress if user is logged in
    if (userId) {
        const progress = await getCourseProgress(userId, courseId);
        return {
            ...result,
            progress
        };
    }
    return result;
};
const getCourseProgress = async (userId, courseId)=>{
    console.log('getCourseProgress: Fetching progress for user:', userId, 'course:', courseId);
    // Get all lessons for this course by first getting modules then lessons
    const { data: modulesData, error: modulesError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('modules').select('id').eq('course_id', courseId);
    if (modulesError) {
        console.error('getCourseProgress: Error fetching modules:', modulesError);
        console.error("Supabase error", {
            message: modulesError?.message,
            details: modulesError?.details,
            hint: modulesError?.hint,
            code: modulesError?.code
        });
        throw modulesError;
    }
    let lessonIds = [];
    if (modulesData && modulesData.length > 0) {
        const moduleIds = modulesData.map((module)=>module.id);
        const { data: lessonsData, error: lessonsError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('lessons').select('id').in('module_id', moduleIds);
        if (lessonsError) {
            console.error('getCourseProgress: Error fetching lessons:', lessonsError);
            console.error("Supabase error", {
                message: lessonsError?.message,
                details: lessonsError?.details,
                hint: lessonsError?.hint,
                code: lessonsError?.code
            });
            // Log a concise error message to prevent infinite loops
            console.warn('Warning: Failed to fetch lessons for progress calculation');
            // Return empty array instead of throwing to prevent cascading errors
            return {
                total_lessons: 0,
                completed_lessons: 0,
                progress_percent: 0,
                last_accessed_lesson_id: null
            };
        }
        lessonIds = lessonsData?.map((lesson)=>lesson.id) || [];
    }
    const totalLessons = lessonIds.length;
    if (totalLessons === 0) {
        return {
            total_lessons: 0,
            completed_lessons: 0,
            progress_percent: 0,
            last_accessed_lesson_id: null
        };
    }
    // Get user progress for these lessons
    const { data: progressData, error: progressError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('user_lesson_progress').select('lesson_id, completed, updated_at').eq('user_id', userId).in('lesson_id', lessonIds);
    if (progressError) {
        console.error('getCourseProgress: Error fetching progress data:', progressError);
        console.error("Supabase error", {
            message: progressError?.message,
            details: progressError?.details,
            hint: progressError?.hint,
            code: progressError?.code
        });
        throw progressError;
    }
    const completedLessons = progressData?.filter((p)=>p.completed).length || 0;
    const progressPercent = totalLessons > 0 ? Math.round(completedLessons / totalLessons * 100) : 0;
    // Find the most recently accessed lesson
    const sortedProgress = progressData?.sort((a, b)=>new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    const lastAccessedLessonId = sortedProgress?.[0]?.lesson_id || null;
    return {
        total_lessons: totalLessons,
        completed_lessons: completedLessons,
        progress_percent: progressPercent,
        last_accessed_lesson_id: lastAccessedLessonId
    };
};
const getNextLesson = async (userId, courseId)=>{
    console.log('getNextLesson: Finding next lesson for user:', userId, 'course:', courseId);
    // Get course with ordered modules and lessons
    const course = await getCourse(courseId, userId);
    if (!course.modules || course.modules.length === 0) {
        console.log('getNextLesson: No modules found');
        return null;
    }
    // Get user's progress for this course
    const { data: progressData, error: progressError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('user_lesson_progress').select('lesson_id, completed').eq('user_id', userId).eq('completed', true);
    if (progressError) {
        console.error('getNextLesson: Error fetching progress:', progressError);
        console.error("Supabase error", {
            message: progressError?.message,
            details: progressError?.details,
            hint: progressError?.hint,
            code: progressError?.code
        });
        throw progressError;
    }
    const completedLessonIds = new Set(progressData?.map((p)=>p.lesson_id) || []);
    // Find first incomplete lesson in order
    for (const module of course.modules){
        if (module.lessons) {
            for (const lesson of module.lessons){
                if (!completedLessonIds.has(lesson.id)) {
                    console.log('getNextLesson: Found next lesson:', lesson.id);
                    return lesson;
                }
            }
        }
    }
    // If all lessons are completed, return the first lesson
    console.log('getNextLesson: All lessons completed, returning first lesson');
    const firstModule = course.modules[0];
    if (firstModule && firstModule.lessons && firstModule.lessons.length > 0) {
        return firstModule.lessons[0];
    }
    return null;
};
const getResumeLesson = async (userId, courseId)=>{
    console.log('getResumeLesson: Finding resume lesson for user:', userId, 'course:', courseId);
    // First, try to find the last accessed incomplete lesson
    const { data: recentProgress, error: recentError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('user_lesson_progress').select(`
      lesson_id,
      completed,
      last_position_seconds
    `).eq('user_id', userId).order('updated_at', {
        ascending: false
    }).limit(5); // Check last 5 accessed lessons
    if (recentError) {
        console.error('getResumeLesson: Error fetching recent progress:', recentError);
        console.error("Supabase error", {
            message: recentError?.message,
            details: recentError?.details,
            hint: recentError?.hint,
            code: recentError?.code
        });
        throw recentError;
    }
    // Check recent lessons for incomplete ones with progress
    if (recentProgress) {
        for (const progress of recentProgress){
            if (!progress.completed && progress.last_position_seconds > 0) {
                // Get the lesson details
                const { data: lessonData, error: lessonError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('lessons').select('*').eq('id', progress.lesson_id).single();
                if (!lessonError && lessonData) {
                    console.log('getResumeLesson: Found resume lesson with progress:', lessonData.id);
                    return lessonData;
                }
            }
        }
    }
    // If no suitable resume lesson found, fall back to next lesson logic
    return getNextLesson(userId, courseId);
};
const updateUserLessonProgress = async (userId, lessonId, progressData)=>{
    console.log('updateUserLessonProgress: Updating progress for user:', userId, 'lesson:', lessonId, 'data:', progressData);
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('user_lesson_progress').upsert({
        user_id: userId,
        lesson_id: lessonId,
        ...progressData,
        updated_at: new Date().toISOString()
    }, {
        onConflict: 'user_id,lesson_id'
    }).select().single();
    console.log('updateUserLessonProgress: Result', {
        data,
        error
    });
    if (error) {
        console.error('updateUserLessonProgress: Error updating progress:', error);
        console.error("Supabase error", {
            message: error?.message,
            details: error?.details,
            hint: error?.hint,
            code: error?.code
        });
        throw error;
    }
    return data;
};
const markLessonCompleted = async (userId, lessonId)=>{
    return updateUserLessonProgress(userId, lessonId, {
        completed: true,
        completed_at: new Date().toISOString()
    });
};
const getContinueLearningItems = async (userId, limit = 3)=>{
    console.log('getContinueLearningItems: Fetching items for user:', userId, 'limit:', limit);
    // Get courses with user progress
    const courses = await listCourses();
    const items = [];
    for (const course of courses){
        const progress = await getCourseProgress(userId, course.id);
        if (progress.total_lessons > 0 && progress.progress_percent < 100) {
            const nextLesson = await getNextLesson(userId, course.id);
            if (nextLesson) {
                items.push({
                    course,
                    next_lesson: nextLesson,
                    progress_percent: progress.progress_percent
                });
            }
        }
    }
    // Sort by progress (lowest first) and limit results
    return items.sort((a, b)=>a.progress_percent - b.progress_percent).slice(0, limit);
};
const getUserLessonProgress = async (userId, lessonId)=>{
    console.log('getUserLessonProgress: Fetching progress for user:', userId, 'lesson:', lessonId);
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('user_lesson_progress').select('*').eq('user_id', userId).eq('lesson_id', lessonId).maybeSingle();
    console.log('getUserLessonProgress: Result', {
        data,
        error
    });
    if (error && error.code !== 'PGRST116') {
        console.error('getUserLessonProgress: Error fetching progress:', error);
        console.error("Supabase error", {
            message: error?.message,
            details: error?.details,
            hint: error?.hint,
            code: error?.code
        });
        throw error;
    }
    // Treat null as valid "no progress yet" state
    if (!data) {
        console.log('getUserLessonProgress: No progress found, returning default');
        return {
            user_id: userId,
            lesson_id: lessonId,
            completed: false,
            completed_at: null,
            last_position_seconds: 0,
            updated_at: new Date().toISOString()
        };
    }
    return data;
};
const checkLessonAccess = async (userId, lessonId)=>{
    console.log('checkLessonAccess: Checking access for user:', userId, 'lesson:', lessonId);
    // First, get the lesson to check if it's a preview
    const { data: lesson, error: lessonError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('lessons').select('is_preview').eq('id', lessonId).single();
    if (lessonError) {
        console.error('checkLessonAccess: Error fetching lesson:', lessonError);
        console.error("Supabase error", {
            message: lessonError?.message,
            details: lessonError?.details,
            hint: lessonError?.hint,
            code: lessonError?.code
        });
        return {
            hasAccess: false,
            isPreview: false
        };
    }
    // If it's a preview lesson, everyone can access it
    if (lesson.is_preview) {
        console.log('checkLessonAccess: Lesson is preview, access granted');
        return {
            hasAccess: true,
            isPreview: true
        };
    }
    // Check if user is a member
    const { data: profile, error: profileError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('profiles').select('plan').eq('id', userId).maybeSingle(); // Use maybeSingle to handle cases where profile doesn't exist yet
    if (profileError) {
        console.error('checkLessonAccess: Error fetching profile:', profileError);
        console.error("Supabase error", {
            message: profileError?.message,
            details: profileError?.details,
            hint: profileError?.hint,
            code: profileError?.code
        });
        return {
            hasAccess: false,
            isPreview: false
        };
    }
    // If no profile exists, user doesn't have access
    if (!profile) {
        console.log('checkLessonAccess: No profile found for user, denying access');
        return {
            hasAccess: false,
            isPreview: false
        };
    }
    const hasAccess = profile.plan === 'member';
    console.log('checkLessonAccess: Member access check result:', {
        hasAccess,
        plan: profile.plan
    });
    return {
        hasAccess,
        isPreview: false
    };
};
const listCoursesSafe = async ()=>{
    console.log('listCoursesSafe: Fetching published courses with error handling');
    try {
        // First, get courses
        const { data: coursesData, error: coursesError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('courses').select('id, title, description, thumbnail_url, is_published, created_at').eq('is_published', true).order('created_at', {
            ascending: false
        });
        if (coursesError) {
            console.error('listCoursesSafe: Error fetching courses:', coursesError);
            console.error("Supabase error", {
                message: coursesError?.message,
                details: coursesError?.details,
                hint: coursesError?.hint,
                code: coursesError?.code
            });
            return []; // Return empty array instead of throwing
        }
        // If no courses, return empty array
        if (!coursesData || coursesData.length === 0) {
            console.log('listCoursesSafe: No courses found');
            return [];
        }
        // Get modules for all courses
        const courseIds = coursesData.map((course)=>course.id);
        const { data: modulesData, error: modulesError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('modules').select('id, course_id, title, order_index').in('course_id', courseIds).order('order_index', {
            ascending: true
        });
        if (modulesError) {
            console.error('listCoursesSafe: Error fetching modules:', modulesError);
            console.error("Supabase error", {
                message: modulesError?.message,
                details: modulesError?.details,
                hint: modulesError?.hint,
                code: modulesError?.code
            });
            return coursesData.map((course)=>({
                    ...course,
                    modules: []
                })); // Return courses with empty modules
        }
        // Group modules by course
        const modulesByCourse = {};
        if (modulesData) {
            for (const module of modulesData){
                if (!modulesByCourse[module.course_id]) {
                    modulesByCourse[module.course_id] = [];
                }
                modulesByCourse[module.course_id].push(module);
            }
        }
        // Get lessons for all modules
        const moduleIds = modulesData?.map((module)=>module.id) || [];
        let lessonsData = [];
        if (moduleIds.length > 0) {
            const { data: lessonsRes, error: lessonsError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('lessons').select('id, module_id, title, description, order_index, video_provider, video_url, youtube_video_id, is_preview, is_published, created_at').in('module_id', moduleIds).order('order_index', {
                ascending: true
            });
            if (lessonsError) {
                console.error('listCoursesSafe: Error fetching lessons:', lessonsError);
                console.error("Supabase error", {
                    message: lessonsError?.message,
                    details: lessonsError?.details,
                    hint: lessonsError?.hint,
                    code: lessonsError?.code
                });
                // Continue with empty lessons array
                lessonsData = [];
            } else {
                lessonsData = lessonsRes || [];
            }
        }
        // Group lessons by module
        const lessonsByModule = {};
        for (const lesson of lessonsData){
            if (!lessonsByModule[lesson.module_id]) {
                lessonsByModule[lesson.module_id] = [];
            }
            lessonsByModule[lesson.module_id].push(lesson);
        }
        // Combine everything
        const result = coursesData.map((course)=>({
                ...course,
                modules: modulesByCourse[course.id] ? modulesByCourse[course.id].map((module)=>({
                        ...module,
                        lessons: lessonsByModule[module.id] || []
                    })) : []
            }));
        console.log('listCoursesSafe: Final result', {
            count: result.length
        });
        return result;
    } catch (error) {
        console.error('listCoursesSafe: Unexpected error', error);
        return []; // Return empty array as fallback
    }
};
}),
"[project]/src/services/quizService.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getQuizByLessonId",
    ()=>getQuizByLessonId,
    "getQuizSubmissionByLessonId",
    ()=>getQuizSubmissionByLessonId,
    "getUserQuizSubmission",
    ()=>getUserQuizSubmission,
    "submitQuizAnswers",
    ()=>submitQuizAnswers,
    "upsertQuiz",
    ()=>upsertQuiz
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase.ts [app-ssr] (ecmascript)");
;
function isUuid(value) {
    if (!value) return false;
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
const getQuizByLessonId = async (lessonId)=>{
    console.log('getQuizByLessonId: Fetching quiz for lesson:', lessonId);
    try {
        // First, get the quiz itself
        const { data: quizData, error: quizError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('quizzes').select('*').eq('lesson_id', lessonId).eq('is_active', true).maybeSingle();
        if (quizError) {
            console.error('getQuizByLessonId: Error fetching quiz:', {
                name: quizError.name,
                message: quizError.message,
                details: quizError.details
            });
            throw quizError;
        }
        // If no quiz found for this lesson, return null
        if (!quizData) {
            return null;
        }
        // Then get the questions for this quiz
        console.log('getQuizByLessonId: Fetching questions for lesson:', lessonId);
        // First, let's check what's actually in the database for this lesson
        const { data: allQuestions, error: allQuestionsError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('quiz_questions').select('*').limit(10);
        if (allQuestions) {
            console.log('getQuizByLessonId: All questions in DB:', allQuestions.map((q)=>({
                    id: q.id,
                    lesson_id: q.lesson_id,
                    text: q.question_text?.substring(0, 30) + '...'
                })));
        }
        const { data: questionsData, error: questionsError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('quiz_questions').select('*').eq('lesson_id', lessonId).order('order_index', {
            ascending: true
        });
        if (questionsError) {
            console.error('getQuizByLessonId: Error fetching questions:', questionsError);
            throw questionsError;
        }
        console.log('getQuizByLessonId: Raw questions data:', questionsData?.length || 0, 'questions found');
        if (questionsData) {
            console.log('getQuizByLessonId: Questions sample:', questionsData.slice(0, 2).map((q)=>({
                    id: q.id,
                    text: q.question_text?.substring(0, 50) + '...'
                })));
        }
        // Sort questions by order_index
        const sortedQuestions = [
            ...questionsData || []
        ].sort((a, b)=>a.order_index - b.order_index);
        console.log('getQuizByLessonId: Sorted questions count:', sortedQuestions.length);
        // Get options for each question
        const questionsWithOptions = [];
        console.log('getQuizByLessonId: Processing', sortedQuestions.length, 'questions');
        for (const [index, question] of sortedQuestions.entries()){
            console.log(`getQuizByLessonId: Processing question ${index + 1}/${sortedQuestions.length}:`, {
                id: question.id,
                text: question.question_text?.substring(0, 50) + '...'
            });
            const { data: optionsData, error: optionsError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('quiz_options').select('*').eq('question_id', question.id).order('order_index', {
                ascending: true
            });
            if (optionsError) {
                console.error('getQuizByLessonId: Error fetching options for question:', question.id, optionsError);
                throw optionsError;
            }
            console.log(`getQuizByLessonId: Question ${question.id} has ${optionsData?.length || 0} options`);
            questionsWithOptions.push({
                ...question,
                options: optionsData || []
            });
        }
        console.log('getQuizByLessonId: Built questionsWithOptions array with', questionsWithOptions.length, 'questions');
        const quizWithQuestions = {
            ...quizData,
            questions: questionsWithOptions
        };
        console.log('getQuizByLessonId: Final result structure:', {
            quizId: quizWithQuestions.id,
            lessonId: quizWithQuestions.lesson_id,
            title: quizWithQuestions.title,
            questionsCount: quizWithQuestions.questions?.length || 0,
            questionsSample: quizWithQuestions.questions?.slice(0, 2).map((q)=>({
                    id: q.id,
                    text: q.question_text?.substring(0, 50) + '...',
                    optionsCount: q.options?.length || 0
                }))
        });
        return quizWithQuestions;
    } catch (error) {
        console.error('getQuizByLessonId: Unhandled error:', {
            name: error?.name || 'UnknownError',
            message: error?.message || 'Unknown error occurred',
            stack: error?.stack
        });
        // Enhanced error categorization
        if (error?.name === 'TypeError' && error?.message?.includes('Failed to fetch')) {
            if (typeof navigator !== 'undefined' && !navigator.onLine) {
                throw new Error('Network error: You appear to be offline');
            } else {
                throw new Error('Network error: Unable to connect to database server');
            }
        }
        throw error;
    }
};
const upsertQuiz = async (lessonId, quizData)=>{
    console.log('upsertQuiz: Upserting quiz for lesson:', lessonId, 'data:', quizData);
    // Start a transaction-like approach
    // First, check if quiz already exists
    const { data: existingQuiz, error: fetchQuizError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('quizzes').select('id').eq('lesson_id', lessonId).maybeSingle();
    if (fetchQuizError) {
        console.error('upsertQuiz: Error checking existing quiz:', fetchQuizError);
        throw fetchQuizError;
    }
    let quizId;
    if (existingQuiz) {
        // Update existing quiz
        const { error: updateQuizError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('quizzes').update({
            title: quizData.title,
            description: quizData.description,
            is_active: quizData.is_active,
            updated_at: new Date().toISOString()
        }).eq('id', existingQuiz.id);
        if (updateQuizError) {
            console.error('upsertQuiz: Error updating quiz:', updateQuizError);
            throw updateQuizError;
        }
        quizId = existingQuiz.id;
    } else {
        // Insert new quiz
        const { data: newQuiz, error: insertQuizError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('quizzes').insert({
            lesson_id: lessonId,
            title: quizData.title,
            description: quizData.description,
            is_active: quizData.is_active
        }).select('id').single();
        if (insertQuizError) {
            console.error('upsertQuiz: Error inserting quiz:', insertQuizError);
            throw insertQuizError;
        }
        quizId = newQuiz.id;
    }
    // Process questions
    const questionIdMap = {};
    for (const question of quizData.questions){
        let questionId;
        const shouldUpdate = isUuid(question.id);
        if (shouldUpdate && question.id) {
            // Update existing question
            console.log(`upsertQuiz: updating question (uuid ${question.id})`);
            const { error: updateQuestionError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('quiz_questions').update({
                question_text: question.question_text,
                question_type: question.question_type,
                is_required: question.is_required,
                order_index: question.order_index,
                updated_at: new Date().toISOString()
            }).eq('id', question.id);
            if (updateQuestionError) {
                console.error('upsertQuiz: update quiz_questions failed:', updateQuestionError);
                throw updateQuestionError;
            }
            questionId = question.id;
        } else {
            // Insert new question
            console.log(`upsertQuiz: inserting question (temp id ${question.id || 'undefined'})`);
            const { data: newQuestion, error: insertQuestionError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('quiz_questions').insert({
                lesson_id: lessonId,
                question_text: question.question_text,
                question_type: question.question_type,
                is_required: question.is_required,
                order_index: question.order_index
            }).select('id').single();
            if (insertQuestionError) {
                console.error('upsertQuiz: insert quiz_questions failed:', insertQuestionError);
                throw insertQuestionError;
            }
            questionId = newQuestion.id;
        }
        // Map the temporary question ID to the real question ID
        if (question.id && !shouldUpdate) {
            questionIdMap[question.id] = questionId;
        }
        // Process options for this question (only for multiple choice)
        if (question.question_type === 'multiple_choice' && question.options) {
            // Replace all options strategy: delete all existing options first
            console.log(`upsertQuiz: replacing options for question ${questionId}`);
            const { error: deleteOptionsError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('quiz_options').delete().eq('question_id', questionId);
            if (deleteOptionsError) {
                console.error('upsertQuiz: delete quiz_options failed:', deleteOptionsError);
                throw deleteOptionsError;
            }
            // Insert all current options fresh
            for (const [index, option] of question.options.entries()){
                console.log(`upsertQuiz: inserting option ${index + 1} for question ${questionId}`);
                const { error: insertOptionError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('quiz_options').insert({
                    question_id: questionId,
                    option_text: option.option_text,
                    is_correct: option.is_correct,
                    order_index: index
                });
                if (insertOptionError) {
                    console.error('upsertQuiz: insert quiz_options failed:', insertOptionError);
                    throw insertOptionError;
                }
            }
        } else if (question.question_type === 'multiple_choice') {
            // If it's multiple choice but no options provided, delete existing options
            console.log(`upsertQuiz: deleting all options for question ${questionId} (no options provided)`);
            const { error: deleteAllOptionsError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('quiz_options').delete().eq('question_id', questionId);
            if (deleteAllOptionsError) {
                console.error('upsertQuiz: delete all quiz_options failed:', deleteAllOptionsError);
                throw deleteAllOptionsError;
            }
        }
    }
    // Clean up deleted questions (if any)
    console.log('upsertQuiz: Cleaning up questions for lesson:', lessonId);
    console.log('upsertQuiz: Quiz data questions:', quizData.questions.map((q)=>({
            id: q.id,
            isUuid: isUuid(q.id),
            text: q.question_text?.substring(0, 30) + '...'
        })));
    // Only clean up if there are existing questions to preserve
    if (quizData.questions.length > 0) {
        const existingQuestionIds = quizData.questions.filter((q)=>isUuid(q.id)) // Only include real UUIDs, not temporary IDs
        .map((q)=>q.id);
        console.log('upsertQuiz: Existing question IDs to preserve:', existingQuestionIds);
        if (existingQuestionIds.length > 0) {
            console.log('upsertQuiz: Deleting questions NOT in:', existingQuestionIds);
            const { error: deleteQuestionsError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('quiz_questions').delete().eq('lesson_id', lessonId).not('id', 'in', `(${existingQuestionIds.join(',')})`);
            if (deleteQuestionsError) {
                console.error('upsertQuiz: Error deleting questions:', deleteQuestionsError);
            }
        } else {
            // If no existing questions to preserve, this means ALL questions are new
            // So we should NOT delete anything - all questions are meant to be kept
            console.log('upsertQuiz: All questions are new (temporary IDs), preserving all');
        }
    } else {
        // If no questions remain, delete all questions for this lesson
        console.log('upsertQuiz: No questions in quiz data, deleting all questions for lesson');
        const { error: deleteAllQuestionsError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('quiz_questions').delete().eq('lesson_id', lessonId);
        if (deleteAllQuestionsError) {
            console.error('upsertQuiz: Error deleting all questions:', deleteAllQuestionsError);
        }
    }
    console.log('upsertQuiz: Successfully upserted quiz for lesson:', lessonId);
};
const submitQuizAnswers = async (userId, lessonId, answers)=>{
    console.log('submitQuizAnswers: Submitting answers for user:', userId, 'lesson:', lessonId);
    // First, get the quiz questions with correct answers
    const quiz = await getQuizByLessonId(lessonId);
    if (!quiz) {
        throw new Error('Quiz not found for this lesson');
    }
    // Create a new submission
    const { data: submission, error: submissionError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('quiz_submissions').insert({
        user_id: userId,
        lesson_id: lessonId,
        score: 0,
        total_questions: quiz.questions.length
    }).select('id').single();
    if (submissionError) {
        console.error('submitQuizAnswers: Error creating submission:', submissionError);
        throw submissionError;
    }
    let correctAnswers = 0;
    // Process each answer
    for (const answer of answers){
        const question = quiz.questions.find((q)=>q.id === answer.question_id);
        if (!question) {
            continue; // Skip if question doesn't exist
        }
        let isCorrect = false;
        if (question.question_type === 'multiple_choice') {
            // For multiple choice, check if the selected option is correct
            if (answer.selected_option_id) {
                const selectedOption = question.options?.find((opt)=>opt.id === answer.selected_option_id);
                if (selectedOption?.is_correct) {
                    isCorrect = true;
                    correctAnswers++;
                }
            }
        } else if (question.question_type === 'short_answer') {
            // For short answer, we'll just save the answer and let instructors grade manually
            // For now, we'll mark it as correct if an answer was provided
            if (answer.answer_text && answer.answer_text.trim().length > 0) {
                isCorrect = true;
                correctAnswers++;
            }
        }
        // Save the answer
        const { error: answerError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('quiz_answers').insert({
            submission_id: submission.id,
            question_id: answer.question_id,
            selected_option_id: answer.selected_option_id,
            answer_text: answer.answer_text,
            is_correct: isCorrect
        });
        if (answerError) {
            console.error('submitQuizAnswers: Error saving answer:', answerError);
            throw answerError;
        }
    }
    // Update the submission with the final score
    const finalScore = Math.round(correctAnswers / quiz.questions.length * 100);
    const { error: updateScoreError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('quiz_submissions').update({
        score: finalScore,
        completed_at: new Date().toISOString()
    }).eq('id', submission.id);
    if (updateScoreError) {
        console.error('submitQuizAnswers: Error updating score:', updateScoreError);
        throw updateScoreError;
    }
    console.log('submitQuizAnswers: Successfully submitted answers for user:', userId, 'lesson:', lessonId, 'score:', finalScore);
    return {
        score: finalScore,
        total: quiz.questions.length
    };
};
const getUserQuizSubmission = async (userId, lessonId)=>{
    console.log('getUserQuizSubmission: Fetching submission for user:', userId, 'lesson:', lessonId);
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('quiz_submissions').select('*').eq('user_id', userId).eq('lesson_id', lessonId).order('created_at', {
        ascending: false
    }).limit(1).maybeSingle();
    if (error) {
        console.error('getUserQuizSubmission: Error fetching submission:', error);
        throw error;
    }
    return data;
};
const getQuizSubmissionByLessonId = async (userId, lessonId)=>{
    console.log('getQuizSubmissionByLessonId: Fetching submission for user:', userId, 'lesson:', lessonId);
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('quiz_submissions').select('*').eq('user_id', userId).eq('lesson_id', lessonId).order('created_at', {
        ascending: false
    }).limit(1).maybeSingle();
    if (error) {
        console.error('getQuizSubmissionByLessonId: Error fetching submission:', error);
        throw error;
    }
    return data;
};
}),
"[project]/src/components/quiz/QuizQuestion.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "QuizQuestion",
    ()=>QuizQuestion
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
;
;
const QuizQuestion = ({ question, onAnswer, selectedAnswer, isSubmitted })=>{
    const [shortAnswer, setShortAnswer] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(typeof selectedAnswer === 'string' ? selectedAnswer : '');
    const handleMultipleChoiceChange = (optionId)=>{
        if (!isSubmitted) {
            onAnswer(question.id, optionId);
        }
    };
    const handleShortAnswerChange = (e)=>{
        if (!isSubmitted) {
            const value = e.target.value;
            setShortAnswer(value);
            onAnswer(question.id, value);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "mb-8 p-6 bg-card-bg rounded-lg border border-card-border",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-start gap-3 mb-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-shrink-0 mt-1",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-6 h-6 rounded-full bg-accent-primary/20 flex items-center justify-center",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs font-bold text-accent-primary",
                                children: question.order_index + 1
                            }, void 0, false, {
                                fileName: "[project]/src/components/quiz/QuizQuestion.tsx",
                                lineNumber: 42,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        }, void 0, false, {
                            fileName: "[project]/src/components/quiz/QuizQuestion.tsx",
                            lineNumber: 41,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/src/components/quiz/QuizQuestion.tsx",
                        lineNumber: 40,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "font-medium text-white text-lg mb-3",
                                children: question.question_text
                            }, void 0, false, {
                                fileName: "[project]/src/components/quiz/QuizQuestion.tsx",
                                lineNumber: 46,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            question.question_type === 'multiple_choice' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-3",
                                children: question.options?.map((option)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: `p-3 rounded-lg border cursor-pointer transition-all ${isSubmitted ? option.is_correct ? 'border-green-500 bg-green-900/20' : selectedAnswer === option.id && !option.is_correct ? 'border-red-500 bg-red-900/20' : 'border-card-border' : selectedAnswer === option.id ? 'border-accent-primary bg-accent-primary/10' : 'border-card-border hover:border-accent-primary/50'}`,
                                        onClick: ()=>handleMultipleChoiceChange(option.id),
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: `w-4 h-4 rounded-full border mr-3 flex items-center justify-center ${isSubmitted ? option.is_correct ? 'border-green-500 bg-green-500' : selectedAnswer === option.id && !option.is_correct ? 'border-red-500 bg-red-500' : 'border-gray-500' : selectedAnswer === option.id ? 'border-accent-primary bg-accent-primary' : 'border-gray-500'}`,
                                                    children: [
                                                        isSubmitted && option.is_correct && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                            className: "w-2 h-2 text-white",
                                                            fill: "currentColor",
                                                            viewBox: "0 0 20 20",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                fillRule: "evenodd",
                                                                d: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z",
                                                                clipRule: "evenodd"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/quiz/QuizQuestion.tsx",
                                                                lineNumber: 80,
                                                                columnNumber: 27
                                                            }, ("TURBOPACK compile-time value", void 0))
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/quiz/QuizQuestion.tsx",
                                                            lineNumber: 79,
                                                            columnNumber: 25
                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                        isSubmitted && selectedAnswer === option.id && !option.is_correct && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                            className: "w-2 h-2 text-white",
                                                            fill: "currentColor",
                                                            viewBox: "0 0 20 20",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                fillRule: "evenodd",
                                                                d: "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z",
                                                                clipRule: "evenodd"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/quiz/QuizQuestion.tsx",
                                                                lineNumber: 85,
                                                                columnNumber: 27
                                                            }, ("TURBOPACK compile-time value", void 0))
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/quiz/QuizQuestion.tsx",
                                                            lineNumber: 84,
                                                            columnNumber: 25
                                                        }, ("TURBOPACK compile-time value", void 0))
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/quiz/QuizQuestion.tsx",
                                                    lineNumber: 67,
                                                    columnNumber: 21
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: isSubmitted && option.is_correct ? 'text-green-400' : isSubmitted && selectedAnswer === option.id && !option.is_correct ? 'text-red-400' : 'text-gray-300',
                                                    children: option.option_text
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/quiz/QuizQuestion.tsx",
                                                    lineNumber: 89,
                                                    columnNumber: 21
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/quiz/QuizQuestion.tsx",
                                            lineNumber: 66,
                                            columnNumber: 19
                                        }, ("TURBOPACK compile-time value", void 0))
                                    }, option.id, false, {
                                        fileName: "[project]/src/components/quiz/QuizQuestion.tsx",
                                        lineNumber: 51,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0)))
                            }, void 0, false, {
                                fileName: "[project]/src/components/quiz/QuizQuestion.tsx",
                                lineNumber: 49,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                        value: isSubmitted ? selectedAnswer ?? '' : shortAnswer,
                                        onChange: handleShortAnswerChange,
                                        disabled: isSubmitted,
                                        placeholder: "Type your answer here...",
                                        className: `w-full p-3 rounded-lg border bg-card-bg text-white ${isSubmitted ? 'border-gray-600 bg-gray-800/50' : 'border-card-border focus:border-accent-primary focus:ring-1 focus:ring-accent-primary'}`,
                                        rows: 4
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/quiz/QuizQuestion.tsx",
                                        lineNumber: 104,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    isSubmitted && selectedAnswer && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mt-2 text-sm text-green-400",
                                        children: "✓ Your answer has been recorded"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/quiz/QuizQuestion.tsx",
                                        lineNumber: 117,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/quiz/QuizQuestion.tsx",
                                lineNumber: 103,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/quiz/QuizQuestion.tsx",
                        lineNumber: 45,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/quiz/QuizQuestion.tsx",
                lineNumber: 39,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            isSubmitted && question.question_type === 'multiple_choice' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-3 text-sm",
                children: selectedAnswer && typeof selectedAnswer === 'string' && !question.options?.some((o)=>o.id === selectedAnswer) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-yellow-400",
                    children: "You didn't select an answer for this question."
                }, void 0, false, {
                    fileName: "[project]/src/components/quiz/QuizQuestion.tsx",
                    lineNumber: 129,
                    columnNumber: 13
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/src/components/quiz/QuizQuestion.tsx",
                lineNumber: 127,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/quiz/QuizQuestion.tsx",
        lineNumber: 38,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
}),
"[project]/src/components/quiz/QuizComponent.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "QuizComponent",
    ()=>QuizComponent
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/AuthContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$quizService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/quizService.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$quiz$2f$QuizQuestion$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/quiz/QuizQuestion.tsx [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
const QuizComponent = ({ lessonId, quiz, onComplete })=>{
    const { state } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuthStore"])();
    const user = state.user;
    const [answers, setAnswers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    const [isSubmitted, setIsSubmitted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [score, setScore] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    // Check if user has already submitted this quiz
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const checkExistingSubmission = async ()=>{
            if (!user) return;
            try {
                const existingSubmission = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$quizService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getUserQuizSubmission"])(user.id, lessonId);
                if (existingSubmission) {
                    setScore(existingSubmission.score);
                    setIsSubmitted(true);
                }
            } catch (error) {
                console.error('Error checking existing submission:', error);
            } finally{
                setLoading(false);
            }
        };
        checkExistingSubmission();
    }, [
        user,
        lessonId
    ]);
    const handleAnswer = (questionId, answer)=>{
        // Normalize answer to always be a string
        const normalizedAnswer = typeof answer === 'string' ? answer : answer[0] ?? '';
        setAnswers((prev)=>({
                ...prev,
                [questionId]: normalizedAnswer
            }));
    };
    const handleSubmit = async ()=>{
        if (!user) {
            alert('Please log in to submit the quiz');
            return;
        }
        // Validate that all required questions are answered
        for (const question of quiz.questions){
            if (question.is_required && !answers[question.id]) {
                alert(`Please answer the required question: "${question.question_text}"`);
                return;
            }
        }
        try {
            const answerArray = quiz.questions.map((question)=>({
                    question_id: question.id,
                    ...question.question_type === 'multiple_choice' ? {
                        selected_option_id: answers[question.id]
                    } : {
                        answer_text: answers[question.id]
                    }
                }));
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$quizService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["submitQuizAnswers"])(user.id, lessonId, answerArray);
            setScore(result.score);
            setIsSubmitted(true);
            // Check if user passed the quiz (assuming 70% is passing)
            const quizPassed = result.score >= 70;
            if (onComplete) {
                onComplete(quizPassed);
            }
        } catch (error) {
            console.error('Error submitting quiz:', error);
            alert('Error submitting quiz. Please try again.');
        }
    };
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "mt-8 p-6 bg-card-bg rounded-lg border border-card-border",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center py-8",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-lg text-gray-400",
                    children: "Loading quiz..."
                }, void 0, false, {
                    fileName: "[project]/src/components/quiz/QuizComponent.tsx",
                    lineNumber: 97,
                    columnNumber: 11
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/src/components/quiz/QuizComponent.tsx",
                lineNumber: 96,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/src/components/quiz/QuizComponent.tsx",
            lineNumber: 95,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0));
    }
    if (isSubmitted) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "mt-8 p-6 bg-card-bg rounded-lg border border-card-border",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-center mb-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-2xl font-bold text-white mb-2",
                            children: "Quiz Complete!"
                        }, void 0, false, {
                            fileName: "[project]/src/components/quiz/QuizComponent.tsx",
                            lineNumber: 107,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-3xl font-bold text-accent-primary mb-2",
                            children: [
                                "Score: ",
                                score,
                                "%"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/quiz/QuizComponent.tsx",
                            lineNumber: 110,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-gray-400",
                            children: "You've completed this lesson's quiz."
                        }, void 0, false, {
                            fileName: "[project]/src/components/quiz/QuizComponent.tsx",
                            lineNumber: 113,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/quiz/QuizComponent.tsx",
                    lineNumber: 106,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-6",
                    children: quiz.questions.map((question)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$quiz$2f$QuizQuestion$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["QuizQuestion"], {
                            question: question,
                            onAnswer: handleAnswer,
                            selectedAnswer: answers[question.id] ?? '',
                            isSubmitted: true
                        }, question.id, false, {
                            fileName: "[project]/src/components/quiz/QuizComponent.tsx",
                            lineNumber: 120,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0)))
                }, void 0, false, {
                    fileName: "[project]/src/components/quiz/QuizComponent.tsx",
                    lineNumber: 118,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/quiz/QuizComponent.tsx",
            lineNumber: 105,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0));
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "mt-8 p-6 bg-card-bg rounded-lg border border-card-border",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "text-xl font-bold text-white mb-2",
                        children: quiz.title
                    }, void 0, false, {
                        fileName: "[project]/src/components/quiz/QuizComponent.tsx",
                        lineNumber: 136,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-gray-400",
                        children: quiz.description
                    }, void 0, false, {
                        fileName: "[project]/src/components/quiz/QuizComponent.tsx",
                        lineNumber: 137,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/quiz/QuizComponent.tsx",
                lineNumber: 135,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-6",
                children: quiz.questions.map((question)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$quiz$2f$QuizQuestion$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["QuizQuestion"], {
                        question: question,
                        onAnswer: handleAnswer,
                        selectedAnswer: answers[question.id] ?? '',
                        isSubmitted: false
                    }, question.id, false, {
                        fileName: "[project]/src/components/quiz/QuizComponent.tsx",
                        lineNumber: 142,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)))
            }, void 0, false, {
                fileName: "[project]/src/components/quiz/QuizComponent.tsx",
                lineNumber: 140,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-8 flex flex-col sm:flex-row gap-4 justify-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: handleSubmit,
                        className: "px-8 py-3 bg-accent-primary text-white font-bold rounded-lg hover:bg-accent-primary/90 transition-colors text-lg hover-lift border border-accent-primary",
                        children: "Submit Quiz"
                    }, void 0, false, {
                        fileName: "[project]/src/components/quiz/QuizComponent.tsx",
                        lineNumber: 153,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>{
                            // Allow user to retake the quiz
                            setIsSubmitted(false);
                            setScore(null);
                        },
                        className: "px-8 py-3 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 transition-colors text-lg hover-lift",
                        children: "Retake Quiz"
                    }, void 0, false, {
                        fileName: "[project]/src/components/quiz/QuizComponent.tsx",
                        lineNumber: 159,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/quiz/QuizComponent.tsx",
                lineNumber: 152,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/quiz/QuizComponent.tsx",
        lineNumber: 134,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
}),
"[project]/src/lib/youtube.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * YouTube IFrame API Loader Utility
 * Ensures safe, single-load initialization of YouTube's iframe API
 */ // Extend window interface
__turbopack_context__.s([
    "destroyPlayer",
    ()=>destroyPlayer,
    "loadYouTubeIFrameAPI",
    ()=>loadYouTubeIFrameAPI
]);
// Global promise to prevent duplicate API loading
let ytApiPromise = null;
function loadYouTubeIFrameAPI(timeoutMs = 15000) {
    if ("TURBOPACK compile-time truthy", 1) return Promise.resolve();
    //TURBOPACK unreachable
    ;
}
const destroyPlayer = (player)=>{
    if (player && typeof player.destroy === 'function') {
        try {
            console.log('YT: destroying player');
            player.destroy();
        } catch (error) {
            console.warn('YT: Error destroying player:', error);
        }
    }
};
}),
"[project]/src/services/lessonReviewService.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getLessonReviewsAdmin",
    ()=>getLessonReviewsAdmin,
    "getMyLessonReview",
    ()=>getMyLessonReview,
    "upsertLessonReview",
    ()=>upsertLessonReview
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase.ts [app-ssr] (ecmascript)");
;
const upsertLessonReview = async (userId, lessonId, input)=>{
    console.log('lessonReviewService.upsertLessonReview: user', userId, 'lesson', lessonId, 'input', input);
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('lesson_reviews').upsert({
        user_id: userId,
        lesson_id: lessonId,
        rating: input.rating,
        comment: input.comment ?? null,
        is_anonymous: !!input.is_anonymous,
        updated_at: new Date().toISOString()
    }, {
        onConflict: 'lesson_id,user_id'
    }).select().single();
    if (error) {
        const code = error.code;
        const msg = String(error.message || '');
        if (code === 'PGRST205' || msg.includes('Could not find the table') || msg.toLowerCase().includes('not found')) {
            console.warn('lessonReviewService.upsertLessonReview: lesson_reviews table missing; reviews disabled');
            throw new Error('Reviews are not yet available in this environment.');
        }
        console.error('lessonReviewService.upsertLessonReview: error', error);
        throw error;
    }
    console.log('lessonReviewService.upsertLessonReview: ok', data?.id);
    return data;
};
const getMyLessonReview = async (userId, lessonId)=>{
    console.log('lessonReviewService.getMyLessonReview: user', userId, 'lesson', lessonId);
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('lesson_reviews').select('*').eq('user_id', userId).eq('lesson_id', lessonId).maybeSingle();
    if (error) {
        const code = error.code;
        const msg = String(error.message || '');
        if (code === 'PGRST205' || msg.includes('Could not find the table') || msg.toLowerCase().includes('not found')) {
            console.warn('lessonReviewService.getMyLessonReview: lesson_reviews table missing; returning null');
            return null;
        }
        console.error('lessonReviewService.getMyLessonReview: error', error);
        throw error;
    }
    return data;
};
const getLessonReviewsAdmin = async (filters)=>{
    console.log('lessonReviewService.getLessonReviewsAdmin: filters', filters);
    let query = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('lesson_reviews').select(`
      id,
      lesson_id,
      rating,
      comment,
      is_anonymous,
      created_at,
      updated_at,
      lessons!lesson_reviews_lesson_id_fkey (
        id,
        title
      ),
      user:profiles!lesson_reviews_user_id_fkey (
        id,
        username
      )
    `);
    if (filters.lessonId) query = query.eq('lesson_id', filters.lessonId);
    if (filters.minRating) query = query.gte('rating', filters.minRating);
    if (filters.maxRating) query = query.lte('rating', filters.maxRating);
    if (typeof filters.isAnonymous === 'boolean') query = query.eq('is_anonymous', filters.isAnonymous);
    if (filters.sort === 'lowest') {
        query = query.order('rating', {
            ascending: true
        }).order('created_at', {
            ascending: false
        });
    } else {
        query = query.order('created_at', {
            ascending: false
        });
    }
    const { data, error } = await query;
    if (error) {
        // Gracefully handle missing table in remote schema
        const code = error.code;
        const msg = String(error.message || '');
        if (code === 'PGRST205' || msg.includes("Could not find the table")) {
            console.warn('lessonReviewService.getLessonReviewsAdmin: lesson_reviews table missing; returning empty list');
            return [];
        }
        console.error('lessonReviewService.getLessonReviewsAdmin: error', error);
        throw error;
    }
    // Hide username in result if is_anonymous = true
    const mapped = (data || []).map((r)=>({
            id: r.id,
            lesson_id: r.lesson_id,
            rating: r.rating,
            comment: r.comment,
            is_anonymous: r.is_anonymous,
            created_at: r.created_at,
            updated_at: r.updated_at,
            lesson: r.lessons ? {
                id: r.lessons.id,
                title: r.lessons.title
            } : null,
            user: r.is_anonymous ? null : r.user ? {
                id: r.user.id,
                username: r.user.username
            } : null
        }));
    console.log('lessonReviewService.getLessonReviewsAdmin: returned', mapped.length);
    return mapped;
};
}),
"[project]/src/components/reviews/LessonReviewForm.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LessonReviewForm",
    ()=>LessonReviewForm,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/AuthContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$lessonReviewService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/lessonReviewService.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
const LessonReviewForm = ({ lessonId })=>{
    const { state } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuthStore"])();
    const user = state.user;
    const [rating, setRating] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [comment, setComment] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [isAnonymous, setIsAnonymous] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [existingReview, setExistingReview] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [message, setMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    // Add user-friendly submission error state
    const [submitError, setSubmitError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const init = async ()=>{
            if (!user) return;
            try {
                setLoading(true);
                const myReview = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$lessonReviewService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getMyLessonReview"])(user.id, lessonId);
                if (myReview) {
                    setExistingReview(myReview);
                    setRating(myReview.rating);
                    setComment(myReview.comment || '');
                    setIsAnonymous(!!myReview.is_anonymous);
                }
            } catch (err) {
                console.error('LessonReviewForm: failed to load existing review', err);
            } finally{
                setLoading(false);
            }
        };
        init();
    }, [
        user,
        lessonId
    ]);
    const handleSubmit = async (e)=>{
        e.preventDefault();
        setSubmitError(null);
        if (!user) return;
        if (rating < 1 || rating > 5) {
            setMessage('Please choose a rating between 1 and 5.');
            return;
        }
        try {
            setLoading(true);
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$lessonReviewService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["upsertLessonReview"])(user.id, lessonId, {
                rating,
                comment,
                is_anonymous: isAnonymous
            });
            setMessage(existingReview ? 'Your feedback has been updated. Thank you!' : 'Thanks for your feedback — it helps us improve!');
            setExistingReview({
                rating,
                comment,
                is_anonymous: isAnonymous
            });
            console.log('LessonReviewForm: review submitted', {
                lessonId,
                rating,
                isAnonymous
            });
        } catch (err) {
            console.error('LessonReviewForm: submission error', err);
            const msg = String(err?.message || '');
            // Graceful message if reviews are not available yet (missing remote table)
            if (msg.toLowerCase().includes('reviews are not yet available') || msg.toLowerCase().includes('not found')) {
                setSubmitError('Reviews are temporarily unavailable in this environment. Your feedback is valuable — please try again later.');
            } else {
                setSubmitError('Something went wrong while submitting your review. Please try again.');
            }
        } finally{
            setLoading(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "mt-8 p-6 bg-card-bg rounded-lg border border-card-border",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                className: "text-xl font-semibold text-white mb-2",
                children: "Help us improve this lesson"
            }, void 0, false, {
                fileName: "[project]/src/components/reviews/LessonReviewForm.tsx",
                lineNumber: 70,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-gray-400 mb-2",
                children: "Your feedback is private and only visible to the VibeSchool team."
            }, void 0, false, {
                fileName: "[project]/src/components/reviews/LessonReviewForm.tsx",
                lineNumber: 71,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-gray-400 mb-4",
                children: "Any video rated below 3 stars will be recreated to improve student experience with VibeSchool."
            }, void 0, false, {
                fileName: "[project]/src/components/reviews/LessonReviewForm.tsx",
                lineNumber: 72,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                onSubmit: handleSubmit,
                className: "space-y-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "block text-gray-300 mb-2",
                                children: "Rate this lesson"
                            }, void 0, false, {
                                fileName: "[project]/src/components/reviews/LessonReviewForm.tsx",
                                lineNumber: 76,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2",
                                children: [
                                    1,
                                    2,
                                    3,
                                    4,
                                    5
                                ].map((star)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: ()=>setRating(star),
                                        className: `p-2 rounded ${rating >= star ? 'text-yellow-400' : 'text-gray-500'} hover:text-yellow-300`,
                                        "aria-label": `Rate ${star} star${star > 1 ? 's' : ''}`,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                            xmlns: "http://www.w3.org/2000/svg",
                                            viewBox: "0 0 24 24",
                                            fill: "currentColor",
                                            className: "w-6 h-6",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                d: "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21z"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/reviews/LessonReviewForm.tsx",
                                                lineNumber: 88,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0))
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/reviews/LessonReviewForm.tsx",
                                            lineNumber: 87,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0))
                                    }, star, false, {
                                        fileName: "[project]/src/components/reviews/LessonReviewForm.tsx",
                                        lineNumber: 79,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)))
                            }, void 0, false, {
                                fileName: "[project]/src/components/reviews/LessonReviewForm.tsx",
                                lineNumber: 77,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-gray-500 text-sm mt-1",
                                children: "Choose between 1 and 5 stars."
                            }, void 0, false, {
                                fileName: "[project]/src/components/reviews/LessonReviewForm.tsx",
                                lineNumber: 93,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/reviews/LessonReviewForm.tsx",
                        lineNumber: 75,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "block text-gray-300 mb-2",
                                children: "What did you like or find confusing?"
                            }, void 0, false, {
                                fileName: "[project]/src/components/reviews/LessonReviewForm.tsx",
                                lineNumber: 97,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                value: comment,
                                onChange: (e)=>setComment(e.target.value),
                                rows: 4,
                                placeholder: "Optional",
                                className: "w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-primary"
                            }, void 0, false, {
                                fileName: "[project]/src/components/reviews/LessonReviewForm.tsx",
                                lineNumber: 98,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/reviews/LessonReviewForm.tsx",
                        lineNumber: 96,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                id: "anonymous",
                                type: "checkbox",
                                checked: isAnonymous,
                                onChange: (e)=>setIsAnonymous(e.target.checked),
                                className: "h-4 w-4 text-accent-primary focus:ring-accent-primary border-gray-700 bg-gray-800"
                            }, void 0, false, {
                                fileName: "[project]/src/components/reviews/LessonReviewForm.tsx",
                                lineNumber: 108,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                htmlFor: "anonymous",
                                className: "text-gray-300",
                                children: "Submit anonymously"
                            }, void 0, false, {
                                fileName: "[project]/src/components/reviews/LessonReviewForm.tsx",
                                lineNumber: 115,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/reviews/LessonReviewForm.tsx",
                        lineNumber: 107,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "submit",
                                disabled: loading || rating === 0,
                                className: `px-4 py-2 rounded font-medium transition-colors hover-lift border ${loading || rating === 0 ? 'bg-gray-700 text-gray-400 border-gray-700' : 'bg-accent-primary text-white hover:bg-accent-primary/90 border-accent-primary'}`,
                                children: existingReview ? 'Update Feedback' : 'Submit Feedback'
                            }, void 0, false, {
                                fileName: "[project]/src/components/reviews/LessonReviewForm.tsx",
                                lineNumber: 119,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            message && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-gray-300 text-sm",
                                children: message
                            }, void 0, false, {
                                fileName: "[project]/src/components/reviews/LessonReviewForm.tsx",
                                lineNumber: 126,
                                columnNumber: 23
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/reviews/LessonReviewForm.tsx",
                        lineNumber: 118,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/reviews/LessonReviewForm.tsx",
                lineNumber: 74,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            submitError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                role: "alert",
                className: "mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700",
                children: submitError
            }, void 0, false, {
                fileName: "[project]/src/components/reviews/LessonReviewForm.tsx",
                lineNumber: 132,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/reviews/LessonReviewForm.tsx",
        lineNumber: 69,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
const __TURBOPACK__default__export__ = LessonReviewForm;
}),
"[project]/src/app/learn/[lessonId]/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/AuthContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/rotate-ccw.js [app-ssr] (ecmascript) <export default as RotateCcw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$auth$2f$ProtectedRoute$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/auth/ProtectedRoute.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$AppShell$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/layout/AppShell.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$courseService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/courseService.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$courseNavigationService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/courseNavigationService.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$quizService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/quizService.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$quiz$2f$QuizComponent$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/quiz/QuizComponent.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$youtube$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/youtube.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$reviews$2f$LessonReviewForm$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/reviews/LessonReviewForm.tsx [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
;
;
;
;
;
;
;
const LessonPlayer = ()=>{
    const { lessonId } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useParams"])();
    const { state } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuthStore"])();
    const user = state.user;
    const [lesson, setLesson] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [progress, setProgress] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        completed: false,
        last_position_seconds: 0
    });
    const [playerReady, setPlayerReady] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isPlaying, setIsPlaying] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [canAccess, setCanAccess] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isCheckingAccess, setIsCheckingAccess] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [devLogsShown, setDevLogsShown] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false); // For dev diagnostics
    const [quiz, setQuiz] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [quizLoading, setQuizLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [quizSubmission, setQuizSubmission] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [quizPassed, setQuizPassed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const playerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const timerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [playerEl, setPlayerEl] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const playerElRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((node)=>{
        console.log('YT DEBUG: playerElRef called with node:', !!node);
        setPlayerEl(node);
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (user && lessonId) {
            loadLessonData();
        }
    }, [
        user,
        lessonId
    ]);
    const loadLessonData = async ()=>{
        try {
            setLoading(true);
            // Check access first
            const accessResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$courseService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["checkLessonAccess"])(user.id, lessonId);
            setCanAccess(accessResult.hasAccess);
            setIsCheckingAccess(false);
            if (!accessResult.hasAccess) {
                setError('You do not have access to this lesson. Please upgrade to a membership or access a preview lesson.');
                return;
            }
            // Get lesson details
            const lessonData = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$courseService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getLessonById"])(lessonId);
            setLesson(lessonData);
            // Get user progress
            const progressData = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$courseNavigationService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getUserLessonProgress"])(user.id, lessonId);
            setProgress(progressData);
            // Get quiz for this lesson
            try {
                const lessonQuiz = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$quizService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getQuizByLessonId"])(lessonId);
                setQuiz(lessonQuiz);
                // Check if user has passed the quiz
                if (lessonQuiz) {
                    const submission = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$quizService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getQuizSubmissionByLessonId"])(user.id, lessonId);
                    if (submission) {
                        setQuizSubmission(submission);
                        // Check if the submission meets passing criteria (you can adjust this)
                        if (submission.score >= 70) {
                            setQuizPassed(true);
                        }
                    }
                }
            } catch (quizErr) {
                console.error('Error loading quiz:', quizErr);
            // Quiz is optional, so we don't set an error
            } finally{
                setQuizLoading(false);
            }
        } catch (err) {
            console.error('Error loading lesson:', err);
            setError(err.message || 'Failed to load lesson');
            setQuizLoading(false);
        } finally{
            setLoading(false);
        }
    };
    // Calculate hasVideo outside useEffect for proper dependency tracking
    const hasVideo = !!(lesson && (lesson.video_provider === 'youtube' && lesson.youtube_video_id || lesson.video_url && (lesson.video_url.includes('youtube.com') || lesson.video_url.includes('youtu.be'))));
    // Load YouTube API and initialize player when lesson changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        console.log('YT DEBUG: useEffect triggered, lesson:', !!lesson, 'hasVideo:', hasVideo, 'playerEl:', !!playerEl);
        if (!lesson) return;
        // Extract YouTube video ID from URL if needed
        let videoId = lesson.youtube_video_id;
        if (!videoId && lesson.video_url) {
            // Extract video ID from YouTube URL
            const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&\?\s]{11})/;
            const urlMatch = lesson.video_url.match(regExp);
            if (urlMatch) {
                videoId = urlMatch[1];
            }
        }
        if (!videoId) {
            console.log('YT DEBUG: No video ID found');
            return;
        }
        if (!playerEl) {
            console.log('YT DEBUG: No player element, waiting for mount');
            return;
        }
        console.log('YT DEBUG: Initializing player with video:', videoId);
        let cancelled = false;
        const initializePlayer = async ()=>{
            if (cancelled) return;
            try {
                console.log('YT: loading API for video:', videoId);
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$youtube$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["loadYouTubeIFrameAPI"])();
                if (cancelled || !playerEl) return;
                console.log('YT: creating player for video:', videoId);
                // Clean up existing player if any
                if (playerRef.current) {
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$youtube$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["destroyPlayer"])(playerRef.current);
                }
                // Create new player
                playerRef.current = new window.YT.Player(playerEl, {
                    videoId: videoId,
                    width: "100%",
                    height: "100%",
                    playerVars: {
                        autoplay: 0,
                        playsinline: 1,
                        modestbranding: 1,
                        rel: 0,
                        start: 0
                    },
                    events: {
                        onReady: (event)=>{
                            console.log('YT: onReady fired');
                            if (!cancelled) {
                                playerRef.current = event.target;
                                setPlayerReady(true);
                                // Seek to last position after player is ready
                                setTimeout(()=>{
                                    if (progress.last_position_seconds > 0 && !cancelled) {
                                        event.target.seekTo(progress.last_position_seconds, true);
                                    }
                                }, 1000);
                            }
                        },
                        onStateChange: (event)=>{
                            if (cancelled) return;
                            if (event.data === window.YT.PlayerState.PLAYING) {
                                setIsPlaying(true);
                            } else if (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.ENDED) {
                                setIsPlaying(false);
                                // If video ended, mark as completed
                                if (event.data === window.YT.PlayerState.ENDED && !progress.completed) {
                                    handleMarkComplete();
                                }
                            }
                        },
                        onError: (error)=>{
                            console.error('YT: Player error:', error);
                            if (!cancelled) {
                                setError(`Video player error: ${error?.data || 'Unknown error'}`);
                            }
                        }
                    }
                });
            } catch (error) {
                console.error('YT: Failed to initialize player:', error);
                if (!cancelled) {
                    setError(`Failed to load video player: ${error?.message || 'Unknown error'}`);
                    setPlayerReady(false);
                }
            }
        };
        initializePlayer();
        // Cleanup function
        return ()=>{
            cancelled = true;
            if (playerRef.current) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$youtube$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["destroyPlayer"])(playerRef.current);
                playerRef.current = null;
            }
            setPlayerReady(false);
        };
    }, [
        lesson?.id,
        lesson?.youtube_video_id,
        playerEl,
        progress.last_position_seconds
    ]);
    // Handle player ready event
    const onPlayerReady = (event)=>{
        // Store reference to player
        playerRef.current = event.target;
        setPlayerReady(true);
        // Seek to last position after player is ready and has loaded
        setTimeout(()=>{
            if (progress.last_position_seconds > 0) {
                event.target.seekTo(progress.last_position_seconds, true);
            }
        }, 1000); // Wait a bit for player to be fully ready
    };
    // Handle player state change event
    const onPlayerStateChange = (event)=>{
        if (event.data === window.YT.PlayerState.PLAYING) {
            setIsPlaying(true);
        } else if (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.ENDED) {
            setIsPlaying(false);
            // If video ended, mark as completed
            if (event.data === window.YT.PlayerState.ENDED && !progress.completed) {
                handleMarkComplete();
            }
        }
    };
    // Handle video progress updates
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        // Update progress every 5 seconds while playing
        if (isPlaying && playerRef.current) {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            timerRef.current = setInterval(async ()=>{
                try {
                    const currentTime = playerRef.current?.getCurrentTime();
                    if (currentTime !== undefined) {
                        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$courseNavigationService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["updateUserLessonProgress"])(user.id, lessonId, {
                            last_position_seconds: Math.floor(currentTime)
                        });
                    }
                } catch (err) {
                    console.error('Error updating progress:', err);
                }
            }, 5000); // Update every 5 seconds
        }
        return ()=>{
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [
        isPlaying,
        user,
        lessonId
    ]);
    const handleMarkComplete = async ()=>{
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$courseNavigationService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["updateUserLessonProgress"])(user.id, lessonId, {
                completed: true,
                completed_at: new Date().toISOString()
            });
            setProgress((prev)=>({
                    ...prev,
                    completed: true
                }));
        } catch (err) {
            console.error('Error marking lesson as complete:', err);
        }
    };
    const handleRestart = ()=>{
        if (playerRef.current) {
            playerRef.current.seekTo(0, true);
            playerRef.current.playVideo();
        }
    };
    const handleNextLesson = async ()=>{
        if (!lesson || !user) return;
        try {
            // Find the course ID from the lesson data
            const courseId = lesson.modules?.course_id;
            if (!courseId) {
                console.error('Could not find course ID for lesson');
                return;
            }
            // Get the next lesson in the course
            const nextLesson = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$courseNavigationService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getNextLesson"])(user.id, courseId);
            if (nextLesson) {
                // Navigate to the next lesson
                window.location.href = `/learn/${nextLesson.id}`;
            } else {
                // If no next lesson, show a message or navigate back to course
                alert('Congratulations! You have completed all lessons in this course.');
                window.location.href = `/courses/${courseId}`;
            }
        } catch (error) {
            console.error('Error getting next lesson:', error);
            // Fallback to course page
            const courseId = lesson.modules?.course_id;
            if (courseId) {
                window.location.href = `/courses/${courseId}`;
            }
        }
    };
    if (loading || isCheckingAccess) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$auth$2f$ProtectedRoute$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$AppShell$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "container mx-auto px-4 py-8",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-gray-400",
                        children: "Loading lesson..."
                    }, void 0, false, {
                        fileName: "[project]/src/app/learn/[lessonId]/page.tsx",
                        lineNumber: 353,
                        columnNumber: 13
                    }, ("TURBOPACK compile-time value", void 0))
                }, void 0, false, {
                    fileName: "[project]/src/app/learn/[lessonId]/page.tsx",
                    lineNumber: 352,
                    columnNumber: 11
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/src/app/learn/[lessonId]/page.tsx",
                lineNumber: 351,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/src/app/learn/[lessonId]/page.tsx",
            lineNumber: 350,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0));
    }
    if (error) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$auth$2f$ProtectedRoute$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$AppShell$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "container mx-auto px-4 py-8",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-red-900/20 border border-red-700 rounded-lg p-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-red-300 font-bold mb-2",
                                children: "Error Loading Lesson"
                            }, void 0, false, {
                                fileName: "[project]/src/app/learn/[lessonId]/page.tsx",
                                lineNumber: 366,
                                columnNumber: 15
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-red-400",
                                children: error
                            }, void 0, false, {
                                fileName: "[project]/src/app/learn/[lessonId]/page.tsx",
                                lineNumber: 367,
                                columnNumber: 15
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>window.history.back(),
                                className: "mt-4 px-4 py-2 bg-red-700 text-white rounded hover:bg-red-600 hover-lift",
                                children: "Go Back"
                            }, void 0, false, {
                                fileName: "[project]/src/app/learn/[lessonId]/page.tsx",
                                lineNumber: 368,
                                columnNumber: 15
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/learn/[lessonId]/page.tsx",
                        lineNumber: 365,
                        columnNumber: 13
                    }, ("TURBOPACK compile-time value", void 0))
                }, void 0, false, {
                    fileName: "[project]/src/app/learn/[lessonId]/page.tsx",
                    lineNumber: 364,
                    columnNumber: 11
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/src/app/learn/[lessonId]/page.tsx",
                lineNumber: 363,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/src/app/learn/[lessonId]/page.tsx",
            lineNumber: 362,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0));
    }
    if (!canAccess) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$auth$2f$ProtectedRoute$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$AppShell$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "container mx-auto px-4 py-8",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-yellow-900/20 border border-yellow-700 rounded-lg p-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-yellow-300 font-bold mb-2",
                                children: "Access Restricted"
                            }, void 0, false, {
                                fileName: "[project]/src/app/learn/[lessonId]/page.tsx",
                                lineNumber: 387,
                                columnNumber: 15
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-yellow-400",
                                children: "You need a membership to access this lesson."
                            }, void 0, false, {
                                fileName: "[project]/src/app/learn/[lessonId]/page.tsx",
                                lineNumber: 388,
                                columnNumber: 15
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-yellow-400 mt-2",
                                children: "Preview lessons are available for free, but full content requires a membership."
                            }, void 0, false, {
                                fileName: "[project]/src/app/learn/[lessonId]/page.tsx",
                                lineNumber: 389,
                                columnNumber: 15
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>window.location.href = '/courses',
                                className: "mt-4 px-4 py-2 bg-accent-primary text-white rounded hover:bg-accent-primary/90 hover-lift border border-accent-primary",
                                children: "Browse Courses"
                            }, void 0, false, {
                                fileName: "[project]/src/app/learn/[lessonId]/page.tsx",
                                lineNumber: 390,
                                columnNumber: 15
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/learn/[lessonId]/page.tsx",
                        lineNumber: 386,
                        columnNumber: 13
                    }, ("TURBOPACK compile-time value", void 0))
                }, void 0, false, {
                    fileName: "[project]/src/app/learn/[lessonId]/page.tsx",
                    lineNumber: 385,
                    columnNumber: 11
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/src/app/learn/[lessonId]/page.tsx",
                lineNumber: 384,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/src/app/learn/[lessonId]/page.tsx",
            lineNumber: 383,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0));
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$auth$2f$ProtectedRoute$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$AppShell$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "container mx-auto px-4 py-8",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-2xl font-bold text-white",
                                children: lesson?.title
                            }, void 0, false, {
                                fileName: "[project]/src/app/learn/[lessonId]/page.tsx",
                                lineNumber: 408,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-gray-400",
                                children: [
                                    lesson?.modules?.courses?.title,
                                    " • ",
                                    lesson?.modules?.title
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/learn/[lessonId]/page.tsx",
                                lineNumber: 409,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/learn/[lessonId]/page.tsx",
                        lineNumber: 407,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-6 bg-blue-900/20 border border-blue-700 rounded-lg p-4",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-start gap-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex-shrink-0 mt-0.5",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        className: "w-5 h-5 text-blue-400",
                                        fill: "currentColor",
                                        viewBox: "0 0 20 20",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            fillRule: "evenodd",
                                            d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z",
                                            clipRule: "evenodd"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/learn/[lessonId]/page.tsx",
                                            lineNumber: 417,
                                            columnNumber: 19
                                        }, ("TURBOPACK compile-time value", void 0))
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/learn/[lessonId]/page.tsx",
                                        lineNumber: 416,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0))
                                }, void 0, false, {
                                    fileName: "[project]/src/app/learn/[lessonId]/page.tsx",
                                    lineNumber: 415,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "text-blue-300 font-medium",
                                            children: "Video Loading Tip"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/learn/[lessonId]/page.tsx",
                                            lineNumber: 421,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-blue-400 text-sm mt-1",
                                            children: "If the video doesn't load, please refresh the page. Some videos may take a moment to load or require a page refresh to display properly."
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/learn/[lessonId]/page.tsx",
                                            lineNumber: 422,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/learn/[lessonId]/page.tsx",
                                    lineNumber: 420,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/learn/[lessonId]/page.tsx",
                            lineNumber: 414,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/src/app/learn/[lessonId]/page.tsx",
                        lineNumber: 413,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-black rounded-lg overflow-hidden mb-6 relative",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                ref: playerElRef,
                                "data-yt-container": true,
                                className: "w-full aspect-video rounded-lg overflow-hidden bg-black"
                            }, void 0, false, {
                                fileName: "[project]/src/app/learn/[lessonId]/page.tsx",
                                lineNumber: 430,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            !playerReady && hasVideo && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute inset-0 bg-black/80 flex items-center justify-center",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-center",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary mx-auto mb-4"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/learn/[lessonId]/page.tsx",
                                            lineNumber: 440,
                                            columnNumber: 19
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-white",
                                            children: "Loading video player..."
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/learn/[lessonId]/page.tsx",
                                            lineNumber: 441,
                                            columnNumber: 19
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/learn/[lessonId]/page.tsx",
                                    lineNumber: 439,
                                    columnNumber: 17
                                }, ("TURBOPACK compile-time value", void 0))
                            }, void 0, false, {
                                fileName: "[project]/src/app/learn/[lessonId]/page.tsx",
                                lineNumber: 438,
                                columnNumber: 15
                            }, ("TURBOPACK compile-time value", void 0)),
                            !hasVideo && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute inset-0 w-full aspect-video bg-gray-900 flex items-center justify-center text-gray-400",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-center",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            children: "Video not configured"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/learn/[lessonId]/page.tsx",
                                            lineNumber: 450,
                                            columnNumber: 19
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm mt-2",
                                            children: [
                                                "Lesson ID: ",
                                                lesson?.id
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/learn/[lessonId]/page.tsx",
                                            lineNumber: 451,
                                            columnNumber: 19
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs mt-1",
                                            children: [
                                                "Video provider: ",
                                                lesson?.video_provider
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/learn/[lessonId]/page.tsx",
                                            lineNumber: 452,
                                            columnNumber: 19
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs mt-1",
                                            children: [
                                                "YouTube ID: ",
                                                lesson?.youtube_video_id
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/learn/[lessonId]/page.tsx",
                                            lineNumber: 453,
                                            columnNumber: 19
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs mt-1",
                                            children: [
                                                "Video URL: ",
                                                lesson?.video_url
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/learn/[lessonId]/page.tsx",
                                            lineNumber: 454,
                                            columnNumber: 19
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/learn/[lessonId]/page.tsx",
                                    lineNumber: 449,
                                    columnNumber: 17
                                }, ("TURBOPACK compile-time value", void 0))
                            }, void 0, false, {
                                fileName: "[project]/src/app/learn/[lessonId]/page.tsx",
                                lineNumber: 448,
                                columnNumber: 15
                            }, ("TURBOPACK compile-time value", void 0)),
                            ("TURBOPACK compile-time value", "development") === 'development' && !playerEl && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute top-2 left-2 bg-red-500 text-white text-xs p-1 rounded",
                                children: "YT container not mounted"
                            }, void 0, false, {
                                fileName: "[project]/src/app/learn/[lessonId]/page.tsx",
                                lineNumber: 461,
                                columnNumber: 15
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-4 bg-gray-900 flex justify-between items-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: handleRestart,
                                                className: "flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 hover-lift",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__["RotateCcw"], {
                                                        size: 16
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/learn/[lessonId]/page.tsx",
                                                        lineNumber: 472,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    "Restart"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/learn/[lessonId]/page.tsx",
                                                lineNumber: 468,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-sm text-gray-300",
                                                children: progress.completed ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-green-500",
                                                    children: "✓ Completed"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/learn/[lessonId]/page.tsx",
                                                    lineNumber: 478,
                                                    columnNumber: 21
                                                }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: [
                                                        "Resume from ",
                                                        Math.floor(progress.last_position_seconds / 60),
                                                        ":",
                                                        String(Math.floor(progress.last_position_seconds % 60)).padStart(2, '0')
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/learn/[lessonId]/page.tsx",
                                                    lineNumber: 480,
                                                    columnNumber: 21
                                                }, ("TURBOPACK compile-time value", void 0))
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/learn/[lessonId]/page.tsx",
                                                lineNumber: 476,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/learn/[lessonId]/page.tsx",
                                        lineNumber: 467,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: handleMarkComplete,
                                                disabled: progress.completed,
                                                className: `px-4 py-2 rounded hover-lift ${progress.completed ? 'bg-green-800 text-green-300' : 'bg-accent-primary text-white hover:bg-accent-primary/90 border border-accent-primary'}`,
                                                children: progress.completed ? '✓ Completed' : 'Mark as Complete'
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/learn/[lessonId]/page.tsx",
                                                lineNumber: 486,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            quiz && !quizPassed && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>{
                                                    // Scroll to the quiz section
                                                    const quizSection = document.querySelector('#quiz-section');
                                                    if (quizSection) {
                                                        quizSection.scrollIntoView({
                                                            behavior: 'smooth'
                                                        });
                                                    }
                                                },
                                                className: "px-4 py-2 rounded hover-lift bg-purple-600 text-white hover:bg-purple-500",
                                                children: "Take Quiz"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/learn/[lessonId]/page.tsx",
                                                lineNumber: 498,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            quizPassed && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: handleNextLesson,
                                                className: "px-4 py-2 rounded hover-lift bg-blue-600 text-white hover:bg-blue-500",
                                                children: "Next Lesson →"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/learn/[lessonId]/page.tsx",
                                                lineNumber: 512,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/learn/[lessonId]/page.tsx",
                                        lineNumber: 485,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/learn/[lessonId]/page.tsx",
                                lineNumber: 466,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/learn/[lessonId]/page.tsx",
                        lineNumber: 429,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "prose prose-invert max-w-none",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-gray-300",
                            children: lesson?.description
                        }, void 0, false, {
                            fileName: "[project]/src/app/learn/[lessonId]/page.tsx",
                            lineNumber: 524,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/src/app/learn/[lessonId]/page.tsx",
                        lineNumber: 523,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$reviews$2f$LessonReviewForm$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        lessonId: lessonId
                    }, void 0, false, {
                        fileName: "[project]/src/app/learn/[lessonId]/page.tsx",
                        lineNumber: 528,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    !quizLoading && quiz && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        id: "quiz-section",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$quiz$2f$QuizComponent$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["QuizComponent"], {
                                lessonId: lessonId,
                                quiz: quiz,
                                onComplete: (passed)=>{
                                    setQuizPassed(passed);
                                    if (passed) {
                                        // Mark lesson as completed when quiz is passed
                                        handleMarkComplete();
                                    }
                                }
                            }, void 0, false, {
                                fileName: "[project]/src/app/learn/[lessonId]/page.tsx",
                                lineNumber: 533,
                                columnNumber: 15
                            }, ("TURBOPACK compile-time value", void 0)),
                            !quizPassed && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-4 p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-yellow-300",
                                    children: "⚠️ Complete the quiz to unlock the next lesson."
                                }, void 0, false, {
                                    fileName: "[project]/src/app/learn/[lessonId]/page.tsx",
                                    lineNumber: 546,
                                    columnNumber: 19
                                }, ("TURBOPACK compile-time value", void 0))
                            }, void 0, false, {
                                fileName: "[project]/src/app/learn/[lessonId]/page.tsx",
                                lineNumber: 545,
                                columnNumber: 17
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/learn/[lessonId]/page.tsx",
                        lineNumber: 532,
                        columnNumber: 13
                    }, ("TURBOPACK compile-time value", void 0)),
                    quizLoading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-8 p-6 bg-card-bg rounded-lg border border-card-border",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-center py-8",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-lg text-gray-400",
                                children: "Loading quiz..."
                            }, void 0, false, {
                                fileName: "[project]/src/app/learn/[lessonId]/page.tsx",
                                lineNumber: 555,
                                columnNumber: 17
                            }, ("TURBOPACK compile-time value", void 0))
                        }, void 0, false, {
                            fileName: "[project]/src/app/learn/[lessonId]/page.tsx",
                            lineNumber: 554,
                            columnNumber: 15
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/src/app/learn/[lessonId]/page.tsx",
                        lineNumber: 553,
                        columnNumber: 13
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/learn/[lessonId]/page.tsx",
                lineNumber: 406,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/src/app/learn/[lessonId]/page.tsx",
            lineNumber: 405,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/src/app/learn/[lessonId]/page.tsx",
        lineNumber: 404,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
const __TURBOPACK__default__export__ = LessonPlayer;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__8e8be794._.js.map